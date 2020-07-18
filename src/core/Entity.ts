import { Observer, Scene, TransformNode, Tools } from 'babylonjs';
import cloneDeep =  require('lodash/cloneDeep');
import { getLogger, Logger } from 'loglevel';

import INucleusContext from './common/INucleusContext';
import Component from './Component';
import InternalComponentCollection from './internals/InternalComponentCollection';
import IInternalSystemRegistrar from './internals/IInternalSystemRegistrar';
import NucleusHelper from './common/NucleusHelper';

/**
 * Typings for a class of type T.
 */
export type ClassType<T> = new(...args: any[]) => T; // tslint:disable-line:no-any

export interface IMountingPointWithName<TNode extends TransformNode = TransformNode> {
  mountingPoint: MountingPoint<TNode>;
  nodeName: string;
}

export type MountingPoint<TNode extends TransformNode = TransformNode>
  // We need this conditional since the constructor makes a transform node if you pass a scene or entity.
  // But if TNode is extending TransformNode, there's no way to know and create the appropriate type.
  = TransformNode extends TNode
     ? TNode | Scene | Entity | INucleusContext
     : TNode;

/**
 * A thing in the 3D world. The mounting point for components.
 * @public
 */
export default class Entity<
  TNode extends TransformNode = TransformNode,
  TProps = {}
> {
  private readonly _components: InternalComponentCollection<TNode> = new InternalComponentCollection<TNode>();

  // Using double underscore to avoid conflicts with derived classes
  private __logger: Logger = getLogger('Nucleus'); // tslint:disable-line:variable-name

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
    if (!node) {
      throw new Error('Node can\'t be undefined');
    }
    if (node.isDisposed()) {
      throw new Error('This node has been disposed.');
    }

    const entity: Entity<TNode> = Entity.extract(node) as Entity<TNode>;
    if (entity) {
      return entity;
    }

    return new Entity(node as MountingPoint<TNode>);
  }

  // tslint:disable: no-any
  private static extract<TNode extends TransformNode>(node: TNode): Entity<TNode> {
    return (node as any).__entity__;
  }

  private static set(node: TransformNode, entity: Entity<any> | undefined): void {
    (node as any).__entity__ = entity;
  }
  // tslint:enable: no-any

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
    mountingPoint: MountingPoint<TNode> | IMountingPointWithName<TNode>,
    props?: TProps
  ) {
    if (this._isMountingPointDisposed(mountingPoint)) {
      throw new Error('Mounting point has been disposed.');
    }

    const actualMountingPoint: MountingPoint<TNode>
      = (mountingPoint as IMountingPointWithName<TNode>).mountingPoint
        ? (mountingPoint as IMountingPointWithName<TNode>).mountingPoint
        : mountingPoint as MountingPoint<TNode>;

    const context: INucleusContext = NucleusHelper.getContextFor(actualMountingPoint);

    let node: TNode;
    if (actualMountingPoint instanceof TransformNode) {
      if (Entity.extract(actualMountingPoint as any)) { // tslint:disable-line: no-any
        throw new Error('Node already has an Entity. Instead use Entity.for(node)');
      }
      node = actualMountingPoint as TNode;
    } else {
      const nodeName: keyof IMountingPointWithName = 'nodeName';
      // Default to transform node
      node = new TransformNode(
        (mountingPoint as any)[nodeName] || 'Entity', // tslint:disable-line: no-any
        context.scene
      ) as any; // tslint:disable-line:no-any

      if (actualMountingPoint instanceof Entity) {
        node.parent = actualMountingPoint.node;
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
    if (this.isDisposed || !this._node) {
      return;
    }

    // capture the context, since the getter throws if node is disposed
    const context: INucleusContext = this.context;

    this._node.dispose = this._originalDispose;
    this.onDispose();

    this._components.unmount(disposeMaterialAndTextures);

    if (this._onBeforeRenderObserver) {
      context.scene.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
      this._onBeforeRenderObserver = undefined;
    }

    const internalRegistrar: IInternalSystemRegistrar
      = context.systemRegistrar as any; // tslint:disable-line:no-any
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
      hasComponent = (component as Component<any, any>).entity === this; // tslint:disable-line: no-any
    } else {
      componentInstance = this.getComponent(component);
      hasComponent = !!componentInstance;
    }

    if (!hasComponent) {
      const isType: boolean = !(component instanceof Component);
      throw new Error('This component is not mounted to this entity: ' + Tools.GetClassName(component, isType));
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
      this.onPropsUpdated(oldProps);
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
      throw new Error('A component of this type is already mounted. Type: ' + Tools.GetClassName(component));
    } else {
      this._components.mountComponent(component);
    }
    return component;
  }

  private _tryExecute(func: () => void): void {
    try {
      func();
    } catch (e) {
      this.__logger.error(e);
    }
  }

  private _throwIfDisposed(): never | void {
    if (this.isDisposed) {
      throw new Error('The Entity\'s node has been disposed.');
    }
  }

  private _isMountingPointDisposed(mountingPoint: MountingPoint<TNode> | IMountingPointWithName<TNode>): boolean {
    if (mountingPoint instanceof TransformNode) {
      return mountingPoint.isDisposed();
    } else if ((mountingPoint as INucleusContext).scene) {
      return (mountingPoint as INucleusContext).scene.isDisposed;
    } else if ((mountingPoint as IMountingPointWithName<TNode>).mountingPoint) {
      return this._isMountingPointDisposed((mountingPoint as IMountingPointWithName<TNode>).mountingPoint);
    }

    return (mountingPoint as { isDisposed: boolean }).isDisposed;
  }
}
