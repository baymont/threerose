import * as BABYLON from 'babylonjs';
import Scene from './Scene';

export default interface IComponentContext {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    sceneEntity: Scene;
}
