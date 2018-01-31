import * as BABYLON from 'babylonjs';

import Entity from './Entity';

export interface IComponentContext {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    entity: Entity;
    node: BABYLON.Mesh;
}

/**
 * A mountable component for a nucleus entity
 *
 * @alpha
 */
export default abstract class Component<TProps = {}> {
  private _props: TProps;

  public context: IComponentContext;
  public isMounted: boolean;

  public get props(): TProps {
      return this._props;
  }

  constructor(props?: TProps) {
    this._props = Object.assign({}, props) || <TProps>{};
  }

  /**
   * Called after being mounted to a component
   */
  public didMount(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before an entity's props are updated
   */
  public onEntityWillUpdate(oldProps: {}, newProps: {}): void {
    // EMPTY BLOCK
  }

   /**
   * Called after an entity's props are updated
   */
  public onEntityUpdated(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before render.
   */
  public tick(): void {
    // EMPTY BLOCK
  }

  /**
   * Update properties
   * @param props The new properties
   */
  public updateProps(props: TProps): void {
    const oldProps: TProps = Object.assign({}, this.props);
    this._props = Object.assign(this.props, props);
    this.onUpdated(oldProps);
  }

  /**
   * Called when unmounting from component.
   */
  public unmount(): void {
    // EMPTY BLOCK
  }

  /**
   * Called after props updated.
   */
  protected onUpdated(oldProps: TProps): void {
    // EMPTY BLOCK
  }
}
