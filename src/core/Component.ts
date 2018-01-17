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
export default abstract class Component {
  public context: IComponentContext;
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
   * Called when unmounting from component.
   */
  public unmount(): void {
    // EMPTY BLOCK
  }
}
