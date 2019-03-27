import { Observer, Scene, TransformNode } from 'babylonjs';
import cloneDeep =  require('lodash/cloneDeep');

import INucleusContext from './common/INucleusContext';
import Component from './Component';
import InternalComponentCollection from './InternalComponentCollection';
import IInternalSystemRegistrar from './internals/IInternalSystemRegistrar';
import NucleusHelper from './common/NucleusHelper';

/**
 * Typings for a class of type T.
 */
export type ClassType<T> = new(...args: any[]) => T; // tslint:disable-line:no-any
export type MountingPoint<TNode extends TransformNode = TransformNode> = TNode | Scene | Entity;

/**
 * A thing in the 3D world. The mounting point for components.
 * @public
 */
export default class Entity<
  TNode extends TransformNode = TransformNode,
  TProps = {}
> {
  private readonly _components: InternalComponentCollection<TNode> = new InternalComponentCollection<TNode>();

  private _context?: INucleusContext;

  private _onBeforeRenderObserver: Observer<Scene> | undefined;
  private _node?: TNode;
  private _props: TProps;

  private _originalDispose: () => void;

  /**
   * Gets the entity for each respective node.
   * @param nodes - an array of nodes
   */
  public static forNodes<TNode extends TransformNode = TransformNode>(nodes: TNode[]): Entity<TNode>[] {
    return nodes.map(node => Entity.for(node));
  }

  /**
   * Gets the entity for the node.
   * @param node - the node
   * @returns the releated entity; creates a new one if none
   * @remarks
   * If the parent node's entity has been instantiated; this one will be mounted to it.
   */
  public static for<TNode extends TransformNode = TransformNode>(node: TNode): Entity<TNode> {
    if (node.isDisposed()) {
      throw new Error('This node has been disposed.');
    }

    const entity: Entity<TNode> = Entity.extract(node) as Entity<TNode>;
    if (entity) {
      return entity;
    }

    return new Entity(node);
  }

  private static extract<TNode extends TransformNode>(node: TNode): Entity<TNode> {
    return (node as any).__entity__; // tslint:disable-line:no-any
  }

  private static set(node: TransformNode, entity: Entity | undefined): void {
    (node as any).__entity__ = entity; // tslint:disable-line:no-any
  }

  /**
   * Gets the context.
   */
  public get context(): INucleusContext {
    this._throwIfDisposed();
    return this._context!;
  }

  /**
   * Gets all the mounted components.
   */
  public get components(): Component[] {
    return this._components.array;
  }

  /**
   * Gets the node.
   */
  public get node(): TNode {
    this._throwIfDisposed();
    return this._node!;
  }

  /**
   * Gets the parent.
   */
  public get parent(): Entity | undefined {
    return this.node.parent ? Entity.for(this.node.parent as TransformNode) : undefined;
  }

  public set parent(parent: Entity | undefined) {
    // tslint:disable-next-line:no-null-keyword
    this.node.parent = parent ? parent.node : null;
  }

  /**
   * Gets the properties.
   */
  public get props(): TProps {
    return this._props;
  }

  /**
   * Gets whether the entity is mounted.
   */
  public get isDisposed(): boolean {
    return !this._node || this._node.isDisposed();
  }

  /**
   * Constructs the entity.
   * @param mountingPoint - a mounting point.
   * @param props - the props
   * @remarks When using a scene or Entity as a mounting point, the returned Entity will default to a TransformNode.
   */
  constructor(
    mountingPoint: MountingPoint<TNode>,
    props?: TProps
  ) {
    if (mountingPoint instanceof TransformNode ? mountingPoint.isDisposed() : mountingPoint.isDisposed) {
      throw new Error('Mounting point has been disposed.');
    }

    let context: INucleusContext;
    if (mountingPoint instanceof Entity) {
      context = mountingPoint.context;
    } else {
      context = NucleusHelper.getContextFor(mountingPoint);
    }

    let node: TNode;
    if (mountingPoint instanceof TransformNode) {
      if (Entity.extract(mountingPoint)) {
        throw new Error('Node already has an Entity. Instead use Entity.for(node)');
      }
      node = mountingPoint;
    } else {
      const scene: Scene = mountingPoint instanceof Scene ? mountingPoint : mountingPoint.context.scene;
      // Default to transform node
      node = new TransformNode('Entity', scene) as any; // tslint:disable-line:no-any

      if (mountingPoint instanceof Entity) {
        node.parent = mountingPoint.node;
      }
    }

    this._props = cloneDeep(props) || {} as TProps;
    this._context = context;
    this._node = node as TNode;

    Entity.set(this.node, this);

    // Mount components
    this._components.mount(this, this.context.systemRegistrar);

    this._onBeforeRenderObserver = this.context.scene.onBeforeRenderObservable.add(this._onBeforeRender)!;

    // override dispose, we want to trigger willUnmount before disposing.
    this._originalDispose = this.node.dispose;
    this.node.dispose = this._overrideDispose.bind(this);

    const internalRegistrar: IInternalSystemRegistrar = context.systemRegistrar as any; // tslint:disable-line:no-any
    internalRegistrar._internalRegisterEntity(this);
  }

  /**
   * Disposes the entity and its children.
   * @param disposeMaterialAndTextures - (default: true) if true, disposes of materials and textures
   */
  public dispose(disposeMaterialAndTextures: boolean = true): void {
    if (this.isDisposed) {
      return;
    }

    this.node.dispose = this._originalDispose;

    this.onDispose();

    this._components.unmount(disposeMaterialAndTextures);

    if (this._onBeforeRenderObserver) {
      this.context.scene.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
      this._onBeforeRenderObserver = undefined;
    }

    const internalRegistrar: IInternalSystemRegistrar
      = this.context.systemRegistrar as any; // tslint:disable-line:no-any
    internalRegistrar._internalUnregisterEntity(this);

    Entity.set(this._node!, undefined);

    if (!this._node!.isDisposed()) {
      this._node!.dispose(
        false, // doNotRecurse
        disposeMaterialAndTextures
      );
    }

    this._node = undefined;
    this._context = undefined;
  }

  /**
   * Calls setEnabled on the node with true.
   */
  public enable(): void {
    this.node.setEnabled(true);
  }

  /**
   * Calls setEnabled on the node with false.
   * This will prevent the node or any of its children from rendering.
   */
  public disable(): void {
    this.node.setEnabled(false);
  }

  /**
   * Adds a child entity.
   * @param child - the child entity
   */
  public addChild<T extends Entity<TT>, TT extends TransformNode>(child: T | TT): T {
    this._throwIfDisposed();

    const entity: T = child instanceof TransformNode ? Entity.for(child) as T : child;
    if (entity.isDisposed) {
      throw new Error('The child has been disposed.');
    }

    entity.node.parent = this.node;
    return entity;
  }

  /**
   * Gets all child entities.
   * @param directDescendantsOnly - (default: true) if false, only direct descendants of 'this' will be returned
   */
  public getChildren(directDescendantsOnly: boolean = true): Entity[] {
    return Entity.forNodes(this.node.getChildTransformNodes(directDescendantsOnly));
  }

  /**
   * Gets component by type.
   * @param component - the component type
   */
  public getComponent<T extends Component>(component: ClassType<T>): T {
    return this._components.map.get(component) as T;
  }

  /**
   * Check if component is mounted.
   * @param component - the component type
   */
  public hasComponent<T extends Component>(component: ClassType<T>): boolean {
    return Boolean(this.getComponent(component));
  }

  /**
   * Unmounts the component.
   * @param component - the instance or class of component
   * @param disposeMaterialAndTextures - if true, disposes of materials and textures
   */
  public unmountComponent<T extends Component>(
    component: T | ClassType<T>,
    disposeMaterialAndTextures: boolean = true
  ): void {
    let componentInstance: T;

    let hasComponent: boolean = false;
    if (component instanceof Component) {
      componentInstance = component;
      hasComponent = component.entity === this;
    } else {
      componentInstance = this.getComponent(component);
      hasComponent = !!componentInstance;
    }

    if (!hasComponent) {
      throw new Error('This component is not mounted to this entity.');
    }

    this._components.unmountComponent(componentInstance, disposeMaterialAndTextures);
  }

  /**
   * Update properties.
   * @param props - The new properties
   */
  public updateProps(props: TProps): void {
    this._throwIfDisposed();
    if (this.willPropsUpdate(props)) {
      const oldProps: TProps = cloneDeep(this.props);
      this._props = Object.assign(this.props, cloneDeep(props));

      this._components.onEntityPropsWillUpdate(oldProps);

      // finally let the implemantation update itself
      this.onPropsUpdated(oldProps);

      if (this.components) {
        this._components.onEntityPropsUpdated();
      }
    }
  }

  /**
   * Called before update. False will reject the changes.
   */
  protected willPropsUpdate(newProps: TProps): boolean {
    return true;
  }

  /**
   * Called after props updated.
   */
  protected onPropsUpdated(oldProps: TProps): void {
    // EMPTY BLOCK
  }

  /**
   * Called before render.
   */
  protected onBeforeRender(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before disposing.
   */
  protected onDispose(): void {
    // EMPTY BLOCK
  }

  private _overrideDispose(): void {
    if (!this.isDisposed) {
      this.dispose(arguments[1]); // tslint:disable-line:use-named-parameter
    } else {
      this.node.dispose = this._originalDispose;
      this.node.dispose.call(this.node, arguments);
    }
  }

  private _onBeforeRender = (): void => {
    if (this.components) {
      this._components.map
        .forEach(component => {
          if (component.isEnabled) {
            this._tryExecute((component as any).onBeforeRender.bind(component)); // tslint:disable-line:no-any
          }
        });
    }

    this._tryExecute(this.onBeforeRender.bind(this));
  }

  /**
   * @internal
   */
  // tslint:disable-next-line:no-unused-variable
  private _mountComponent<T extends Component>(component: T): T {
    if (this._components.map.has(component.constructor)) {
      throw new Error('A component of this type is already mounted. Type: ' + component.constructor.name);
    } else {
      this._components.mountComponent(component);
    }
    return component;
  }

  private _tryExecute(func: () => void): void {
    try {
      func();
    } catch (e) {
      console.log(e);
    }
  }

  private _throwIfDisposed(): never | void {
    if (this.isDisposed) {
      throw new Error('The Entity\'s node has been disposed.');
    }
  }
}