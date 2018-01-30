import * as BABYLON from 'babylonjs';

import Entity from './Entity';

export interface IComponentContext<TEntityProps> {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    entity: Entity<TEntityProps>;
    node: BABYLON.Mesh;
}

/**
 * A mountable component for a nucleus entity
 *
 * @alpha
 */
export default abstract class Component<TEntityProps = {}> {
  public context: IComponentContext<TEntityProps>;
  public isMounted: boolean;

  /**
   * Called after being mounted to a component
   */
  public didMount(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before an entity's props are updated
   */
  public onEntityWillUpdate(oldProps: TEntityProps, newProps: TEntityProps): void {
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
   * Called when unmounting from component.
   */
  public unmount(): void {
    // EMPTY BLOCK
  }
}
