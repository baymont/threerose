import * as BABYLON from 'babylonjs';

import ObjectHelper from '../utils/ObjectHelper';
import Entity from './Entity';

export interface IComponentContext {
  engine: BABYLON.Engine;
  entity: Entity;
  scene: BABYLON.Scene;
}

/**
 * A mountable component for a nucleus entity
 *
 * @alpha
 */
export default abstract class Component<TProps = {}> {
  private _props: TProps;
  private _isMounted: boolean;
  private _isEnabled: boolean = true;
  private _context: IComponentContext;

  constructor(props?: TProps) {
    this._props = ObjectHelper.cloneDeep(props) || {} as TProps;
  }

  public get context(): IComponentContext {
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

  public enable(): void {
    this._isEnabled = true;
    if (this.isMounted) {
      this.didMount();
    }
  }

  public disable(): void {
    this._isEnabled = false;
    if (this.isMounted) {
      this.willUnmount();
    }
  }

  /**
   * Update properties
   * @param props The new properties
   */
  public updateProps(props: TProps): void {
    if (!this.isMounted || !this.isEnabled || this.willPropsUpdate(props)) {
      const oldProps: TProps = ObjectHelper.cloneDeep(this.props);
      this._props = Object.assign(this.props, ObjectHelper.cloneDeep(props));

      if (this.isEnabled) {
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

  private _internalMount(context: IComponentContext): void {
    if (this._isMounted) {
      throw new Error('This component is already mounted.');
    }
    this._context = context;
    if (this.isEnabled) {
      this.didMount();
    }
    this._isMounted = true;
  }

  private _internalUnmount(): void {
    if (!this._isMounted) {
      throw new Error('This component is not mounted.');
    }
    this._isMounted = false;
    if (this.isEnabled) {
      this.willUnmount();
    }
  }
}
