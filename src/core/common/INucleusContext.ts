import * as BABYLON from 'babylonjs';

import SceneEntity from './SceneEntity';

export default interface INucleusContext {
  readonly engine: BABYLON.Engine;
  readonly scene: BABYLON.Scene;
  readonly sceneEntity: SceneEntity;
}
