import * as BABYLON from 'babylonjs';
import cloneDeep = require('lodash/cloneDeep');

import INucleusContext from './common/INucleusContext';
import SceneEntity from './common/SceneEntity';
import Entity from './Entity';
import System from './System';

/**
 * A mountable component for a nucleus entity
 *
 * @alpha
 */
// tslint:disable-next-line:no-any
export default abstract class Component<TProps = {}, TSystem extends System = any> {
  private _isEnabled: boolean = true;
  private _props: TProps;
  private _isMounted: boolean;
  private _context: INucleusContext;
  private _system: TSystem;
  private _entity: Entity;
  private _nodes: BABYLON.Node[] = [];

  constructor(props?: TProps) {
    this._props = cloneDeep(props) || {} as TProps;
  }

  public get context(): INucleusContext {
    return this._context;
  }

  public get entity(): Entity {
    return this._entity;
  }

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public get isMounted(): boolean {
    return this._isMounted;
  }

  public get props(): TProps {
    return this._props;
  }

  public get system(): TSystem {
    return this._system;
  }

  public enable(): void {
    if (this._isEnabled) {
      return;
    }
    this._isEnabled = true;
    if (this.isMounted) {
      this.onEnabled();
    }
  }

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
   * Update properties
   * @param props The new properties
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
   * Adds the node to 'this.nodes` and parents it to the entity's node.
   * Automatically disposes of it after unmounting the component.
   * @param mesh the node
   */
  protected addNode(node: BABYLON.Node): void {
    node.parent = this.entity.node;
    this._nodes.push(node);
  }

  /**
   * Adds the node to 'this.nodes` and parents it to the entity's node.
   * Automatically disposes of it after unmounting the component.
   * @param mesh the node
   * @returns the entity for the mesh
   */
  protected mountMesh(mesh: BABYLON.AbstractMesh): Entity {
    this.addNode(mesh);
    return Entity.for(mesh);
  }

  /**
   * Called after being mounted to a component
   */
  protected didMount(): void {
    // EMPTY BLOCK
  }

  /**
   * Override to provide your custom enabling logic. Only called when mounted.
   *
   * The default implemantation calls didMount. (soft mount)
   */
  protected onEnabled(): void {
    this.didMount();
  }

  /**
   * Override to provide your custom disabling logic. Only called when mounted.
   *
   * The default implemantation calls willUnmount. (soft unmount)
   */
  protected onDisabled(): void {
    this.willUnmount();
  }

  /**
   * Called before an entity's props are updated
   */
  protected onEntityPropsWillUpdate(oldProps: any): void { // tslint:disable-line:no-any
    // EMPTY BLOCK
  }

  /**
   * Called after an entity's props are updated
   */
  protected onEntityPropsUpdated(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before render.
   */
  protected onUpdate(): void {
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

  private _internalMount(entity: Entity, system?: TSystem): void {
    if (this._isMounted) {
      throw new Error('This component is already mounted.');
    }
    this._entity = entity;
    this._context = entity.context;
    this._system = system;
    this._isMounted = true;

    if (this.isEnabled) {
      this.didMount();
    }
  }

  private _internalUnmount(): void {
    if (!this._isMounted) {
      throw new Error('This component is not mounted.');
    }

    if (this.isEnabled) {
      this.willUnmount();
    }

    this._nodes.forEach(node => {
      if (!node.isDisposed()) {
        node.dispose();
      }
    });

    this._nodes.length = 0;
    this._context  = undefined;
    this._system = undefined;
    this._isMounted = false;
  }
}
