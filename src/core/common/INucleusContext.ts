import * as BABYLON from 'babylonjs';

import SceneEntity from './SceneEntity';

/**
 * The Nucleus context.
 * @public
 */
export default interface INucleusContext {
  /**
   * The engine
   */
  readonly engine: BABYLON.Engine;
  /**
   * The scene
   */
  readonly scene: BABYLON.Scene;
  /**
   * The scene entity.
   */
  readonly sceneEntity: SceneEntity;
}
