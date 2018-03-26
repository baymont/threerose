import * as BABYLON from 'babylonjs';
import cloneDeep = require('lodash/cloneDeep');

import SceneEntity from './common/SceneEntity';
import Entity from './Entity';
import System from './System';

export interface IComponentContext {
  engine: BABYLON.Engine;
  entity: Entity;
  scene: BABYLON.Scene;
  sceneEntity: SceneEntity;
}

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
  private _context: IComponentContext;
  private _system: TSystem;

  constructor(props?: TProps) {
    this._props = cloneDeep(props) || {} as TProps;
  }

  protected get context(): IComponentContext {
    return this._context;
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
      this._props = Object.assign(cloneDeep(props), this.props);

      if (this.isEnabled && this.isMounted) {
        this.onPropsUpdated(oldProps);
      }
    }
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

  private _internalMount(context: IComponentContext, system?: TSystem): void {
    if (this._isMounted) {
      throw new Error('This component is already mounted.');
    }
    this._context = context;
    if (this.isEnabled) {
      this.didMount();
    }
    this._system = system;
    this._isMounted = true;
  }

  private _internalUnmount(): void {
    if (!this._isMounted) {
      throw new Error('This component is not mounted.');
    }
    this._context  = undefined;
    this._system = undefined;
    this._isMounted = false;
    if (this.isEnabled) {
      this.willUnmount();
    }
  }
}
