import * as BABYLON from 'babylonjs';

import SceneEntity from './SceneEntity';

export default interface IEntityContext {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  sceneEntity: SceneEntity;
}
