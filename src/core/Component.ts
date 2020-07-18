import { TransformNode, Node } from 'babylonjs';
import clone from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';

import INucleusContext from './common/INucleusContext';
import Entity from './Entity';
import System from './System';
import IInternalSystem from './internals/IInternalSystem';

/**
 * Modular chunks of data that can add appearance, behaviors and/or functionality to an entity.
 * @public
 */
// tslint:disable-next-line:no-any
export default abstract class Component<
  TProps = {},
  TNode extends TransformNode = TransformNode,
  TSystem extends System | unknown = unknown
> {
  private _isEnabled: boolean = true;
  private _props: TProps;
  private _isMounted: boolean = false;
  private _context?: INucleusContext;
  private _system?: TSystem;
  private _entity: Entity<TNode>;
  private _nodes: Node[] = [];

  /**
   * Constructs the component.
   * @param props - the props
   */
  constructor(props?: TProps) {
    this._props = cloneDeep(props) || {} as TProps;
  }

  /**
   * Gets the context.
   */
  public get context(): INucleusContext {
    this._throwIfNotMounted();
    return this._context!;
  }

  /**
   * Gets the entity.
   */
  public get entity(): Entity<TNode> {
    this._throwIfNotMounted();
    return this._entity;
  }

  /**
   * Gets whether the component is enabled.
   */
  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Gets whether the component is mounted.
   */
  public get isMounted(): boolean {
    return this._isMounted;
  }

  /**
   * Gets all associated nodes with this component.
   */
  public get nodes(): ReadonlyArray<Node> {
    this._throwIfNotMounted();
    return this._nodes;
  }

  /**
   * Gets the properties.
   */
  public get props(): TProps {
    return this._props;
  }

  /**
   * Gets the associated system for the component class.
   */
  public get system(): TSystem {
    this._throwIfNotMounted();
    if (!this._system) {
      throw new Error('Ensure a system has been registered for this component.');
    }
    return this._system;
  }

  /**
   * Mounts a component.
   * @param entity - the entity to mount it to
   * @remarks Throws if a component of the same type is already mounted.
   */
  public mountTo<T extends Entity<TNode>>(entity: T | TNode): this {
    if (entity instanceof TransformNode) {
      entity = Entity.for(entity) as T;
    }
    (entity as any)._mountComponent(this); // tslint:disable-line: no-any
    return this;
  }

  /**
   * Enable the component.
   * @remarks Does nothing if already enabled.
   */
  public enable(): void {
    if (this._isEnabled) {
      return;
    }
    this._isEnabled = true;
    if (this.isMounted) {
      this.onEnabled();
    }
  }

  /**
   * Disable the component.
   * @remarks Does nothing if already disabled.
   */
  public disable(): void {
    if (!this._isEnabled) {
      return;
    }
    this._isEnabled = false;
    if (this.isMounted) {
      this.onDisabled();
    }
  }

  /**
   * Update properties.
   * @param props - The new properties
   */
  public updateProps(props: TProps): void {
    if (!this.isMounted || !this.isEnabled || this.willPropsUpdate(props)) {
      const oldProps: TProps = cloneDeep(this.props);
      this._props = Object.assign(this.props, cloneDeep(props));

      if (this.isEnabled && this.isMounted) {
        this.onPropsUpdated(oldProps);
      }
    }
  }

  /**
   * Unmount the component from the entity.
   */
  public unmount(): void {
    this._throwIfNotMounted();
    this.entity.unmountComponent(this as Component<any, any>); // tslint:disable-line: no-any
  }

  /**
   * Adds the node to 'this.nodes' and parents it to the entity's node.
   * Automatically disposes of it after unmounting the component.
   * @param mesh - the node
   */
  protected addNode<T extends Node>(node: T): T {
    node.parent = this.entity.node;
    this._nodes.push(node);
    return node;
  }

  /**
   * Removes and disposes the node from `this.nodes`.
   * @param mesh - the node
   * @param disposeMaterialAndTextures - if true, disposes of materials and textures
   */
  protected disposeNode<T extends Node>(node: T, disposeMaterialAndTextures: boolean = true): void {
    this._nodes.splice(this._nodes.indexOf(node), 1);
    node.dispose(false, disposeMaterialAndTextures);
  }

  /**
   * Adds the node/entity to 'this.nodes` and parents it.
   * Automatically disposes of it after unmounting the component.
   * @param node - the node
   * @returns the entity for the node.
   */
  protected addEntity(node: TransformNode | Entity): Entity {
    if (node instanceof Entity) {
      this.addNode(node.node);
      return node;
    } else {
      this.addNode(node);
      return Entity.for(node);
    }
  }

  /**
   * Called after being mounted to an entity.
   */
  protected didMount(): void {
    // EMPTY BLOCK
  }

  /**
   * Override to provide your custom enabling logic. Only called when mounted.
   * @remarks
   * The default implemantation calls didMount. (soft mount)
   */
  protected onEnabled(): void {
    this.didMount();
  }

  /**
   * Override to provide your custom disabling logic. Only called when mounted.
   * @remarks
   * The default implemantation calls willUnmount. (soft unmount)
   */
  protected onDisabled(): void {
    this.willUnmount();
    this._disposeOfNodes(true);
  }

  /**
   * Called before render.
   */
  protected onBeforeRender(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before unmounting from entity.
   */
  protected willUnmount(): void {
    // EMPTY BLOCK
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
   * @internal
   */
  // tslint:disable-next-line:no-unused-variable
  private _internalMount(entity: Entity<TNode>, system?: TSystem): void {
    if (this._isMounted) {
      throw new Error('This component is already mounted.');
    }
    this._entity = entity;
    this._context = clone(entity.context);
    this._system = system;
    this._isMounted = true;

    this.didMount();

    if (system) {
      const internalSystem: IInternalSystem = system as any; // tslint:disable-line: no-any
      internalSystem.onComponentDidMount(this);
    }

    if (!this.isEnabled) {
      this.onDisabled();
    }
  }

  /**
   * @internal
   */
  // tslint:disable-next-line:no-unused-variable
  private _internalUnmount(disposeMaterialAndTextures: boolean): void {
    if (!this._isMounted) {
      throw new Error('This component is not mounted.');
    }

    if (this._system) {
      const internalSystem: IInternalSystem = this._system as any; // tslint:disable-line: no-any
      internalSystem.onComponentWillUnmount(this);
    }

    if (this.isEnabled) {
      this.willUnmount();
      this._disposeOfNodes(disposeMaterialAndTextures);
    }

    this._context  = undefined;
    this._system = undefined;
    this._isMounted = false;
  }

  private _disposeOfNodes(disposeMaterialAndTextures: boolean): void {
    this._nodes.forEach(node => {
      if (!node.isDisposed()) {
        node.dispose(
          false, // doNotRecurse
          disposeMaterialAndTextures
        );
      }
    });

    this._nodes.length = 0;
  }

  private _throwIfNotMounted(): never | void {
    if (!this.isMounted) {
      throw new Error('Component has not been mounted.');
    }
  }
}
