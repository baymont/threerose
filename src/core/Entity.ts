import * as BABYLON from 'babylonjs';
import cloneDeep = require('lodash/cloneDeep');

import INucleusContext from './common/INucleusContext';
import Component from './Component';
import InternalComponentCollection from './InternalComponentCollection';
import IInternalSceneEntity from './internals/IInternalSceneEntity';

/**
 * Typings for a class of type T.
 */
export type ClassType<T> = new(...args: any[]) => T; // tslint:disable-line:no-any

/**
 * A thing in the 3D world. The mounting point for components.
 * @public
 */
export default class Entity<TProps = {}, TParentContext = {}> {
  /**
   * Gets the entity for each respective node.
   * @param nodes - an array of nodes
   */
  public static forNodes(nodes: BABYLON.Node[]): Entity[] {
    return nodes.map(node => Entity.for(node));
  }

  /**
   * Gets the entity for the node.
   * @param node - the node
   * @returns the releated entity; creates a new one if none
   * @remarks
   * If the parent node's entity has been instantiated; this one will be mounted to it.
   */
  public static for(node: BABYLON.Node): Entity {
    if (node.isDisposed()) {
      throw new Error('This node has been disposed.');
    }

    let entity: Entity = Entity.extract(node);
    if (entity) {
      return entity;
    }
    entity = new Entity();
    // @todo Eventually `this.node` should be of type Node. Components might be
    // able to say Component<IProps, ISytem, BABYLON.AbstractMesh> to force a specific node?
    entity.onMount = () => {
      return node as BABYLON.AbstractMesh;
    };
    Entity.set(node, entity);

    // auto mount
    // @todo Remove the concept of mounting Entities.
    // There's really no need and at this point it serves as a legacy behavior.
    if (node.parent) {
      const parentEntity: Entity = Entity.for(node.parent);
      parentEntity.mountChild(entity);
    } else {
      const scene: Entity = Entity.extract(node.getScene() as any); // tslint:disable-line:no-any
      if (scene) {
        scene.mountChild(entity);
      }
    }

    return entity;
  }

  private static extract(node: BABYLON.Node): Entity {
    return (node as any).__entity__; // tslint:disable-line:no-any
  }

  private static set(node: BABYLON.Node, entity: Entity | undefined): void {
    (node as any).__entity__ = entity; // tslint:disable-line:no-any
  }

  private readonly _components: InternalComponentCollection = new InternalComponentCollection();
  private readonly _key?: string;

  private _context?: INucleusContext;
  private _parentContext?: TParentContext;

  private _onBeforeRenderObserver: BABYLON.Observer<BABYLON.Scene> | undefined;
  private _isMounted: boolean;
  private _node?: BABYLON.AbstractMesh;
  private _props: TProps;

  private _originalDispose: () => void;

  /**
   * Gets the context passed down by the entity's parent.
   */
  protected get parentContext(): TParentContext {
    return this._parentContext!;
  }

  /**
   * Gets the context.
   */
  public get context(): INucleusContext {
    if (!this.isMounted) {
      this._throwNotMounted();
    }
    return this._context!;
  }

  /**
   * Gets all the mounted components.
   */
  public get components(): Component[] {
    return this._components.array;
  }

  /**
   * Gets the key identifying this entity.
   * @remarks
   * Used as the name for a new mesh when creating an empty entity.
   */
  public get key(): string | undefined {
    return this._key;
  }

  /**
   * Gets the node.
   */
  public get node(): BABYLON.AbstractMesh {
    if (!this.isMounted) {
      this._throwNotMounted();
    }
    return this._node!;
  }

  /**
   * Gets the parent.
   */
  public get parent(): Entity | undefined {
    return this.node.parent ? Entity.for(this.node.parent) : undefined;
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
  public get isMounted(): boolean {
    return this._isMounted;
  }

  /**
   * Constructs the entity.
   * @param props - the props
   * @param key - the identifying key
   */
  constructor(
    props?: TProps,
    key?: string
  ) {
    this._props = cloneDeep(props) || {} as TProps;
    this._key = key;

    this._onBeforeRender = this._onBeforeRender.bind(this);
  }

  /**
   * Unmount the entity and its children.
   * @param disposeMaterialAndTextures - (default: true) if true, disposes of materials and textures
   */
  public unmount(disposeMaterialAndTextures: boolean = true): void {
    if (!this._isMounted) {
      throw new Error('Entity not mounted');
    }

    this.node.dispose = this._originalDispose;

    this.willUnmount();

    this._components.unmount(disposeMaterialAndTextures);

    if (this._onBeforeRenderObserver) {
      this.context.scene.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
      this._onBeforeRenderObserver = undefined;
    }

    Entity.set(this._node!, undefined);

    if (!this._node!.isDisposed()) {
      this._node!.dispose(
        false, // doNotRecurse
        disposeMaterialAndTextures
      );
    }

    const internalScene: IInternalSceneEntity = this.context.sceneEntity as any; // tslint:disable-line:no-any
    internalScene._internalUnregisterEntity(this);

    this._node = undefined;
    this._context = undefined;
    this._isMounted = false;
  }

  /**
   * Mounts a child entity.
   * @param child - the child entity
   */
  public mountChild<T extends Entity>(child: T): T {
    if (child._isMounted) {
      throw new Error('Child already mounted.');
    }

    // Mount child
    if (this._isMounted) {
      child._parentContext = this.getChildContext();
      child._mount(this.context, this.node);
    }

    return child;
  }

  /**
   * Gets all child entities.
   * @param directDescendantsOnly - (default: true) if false, only direct descendants of 'this' will be returned
   */
  public getChildren(directDescendantsOnly: boolean = true): Entity[] {
    return Entity.forNodes(this.node.getDescendants(directDescendantsOnly));
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
   * Mounts a component.
   * @param component - the component
   * @remarks Throws if a component of the same type is already mounted.
   */
  public mountComponent<T extends Component>(component: T): T {
    this.mountComponents([component]);
    return component;
  }

  /**
   * Mounts an array of components.
   * @param component - the components
   * @remarks Throws if a component of the same type is already mounted.
   */
  public mountComponents(components: Component[]): void {
    components.forEach(component => {
      if (this._components.map.has(component.constructor)) {
        throw new Error('A component of this type is already mounted. Type: ' + component.constructor.name);
      } else {
        this._components.mountComponent(component);
      }
    });
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
    if (!this._isMounted || this.willPropsUpdate(props)) {
      const oldProps: TProps = cloneDeep(this.props);
      this._props = Object.assign(this.props, cloneDeep(props));

      if (this._isMounted) {
        this._components.onEntityPropsWillUpdate(oldProps);

        // finally let the implemantation update itself
        this.onPropsUpdated(oldProps);

        if (this.components) {
          this._components.onEntityPropsUpdated();
        }
      }
    }
  }

  /**
   * Mounts the entity with the returned mesh.
   * @remarks The default implementation creates an empty mesh.
   */
  protected onMount(): BABYLON.AbstractMesh {
    return new BABYLON.Mesh(this.key || 'Entity', this.context.scene);
  }

  /**
   * Called after this instance and all of its childrens are mounted.
   */
  protected didMount(): void {
    // EMPTY BLOCK
  }

  /**
   * Additional context passed down to children.
   */
  protected getChildContext(): {} | undefined {
    return undefined;
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
  protected onUpdate(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before unmounting.
   */
  protected willUnmount(): void {
    // EMPTY BLOCK
  }

  private _mount(context: INucleusContext, parentNode?: BABYLON.AbstractMesh): void {
    if (this._isMounted) {
      throw new Error('Entity already mounted');
    }

    this._context = context;
    this._isMounted = true;
    this._node = this.onMount();
    if (!Entity.extract(this.node)) {
      Entity.set(this.node, this);
    }

    // Set to parent
    if (parentNode) {
      this._node.parent = parentNode;
    }

    // Mount components
    this._components.mount(this, this.context.sceneEntity);

    this.didMount();
    this._onBeforeRenderObserver = this.context.scene.onBeforeRenderObservable.add(this._onBeforeRender)!;

    // override dispose, we want to trigger willUnmount before disposing.
    this._originalDispose = this.node.dispose;
    this.node.dispose = this._overrideDispose.bind(this);

    const internalScene: IInternalSceneEntity = context.sceneEntity as any; // tslint:disable-line:no-any
    internalScene._internalRegisterEntity(this);
  }

  private _overrideDispose(): void {
    if (this.isMounted) {
      this.unmount(arguments[1]); // tslint:disable-line:use-named-parameter
    } else {
      this.node.dispose = this._originalDispose;
      this.node.dispose.call(this.node, arguments);
    }
  }

  private _onBeforeRender(): void {
    if (this.components) {
      this._components.map
        .forEach(component => {
          if (component.isEnabled) {
            this._tryExecute((component as any).onUpdate.bind(component)); // tslint:disable-line:no-any
          }
        });
    }

    this._tryExecute(this.onUpdate.bind(this));
  }

  private _tryExecute(func: () => void): void {
    try {
      func();
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.log(e);
    }
  }

  private _throwNotMounted(): never {
    throw new Error('Entity has not been mounted.');
  }
}
