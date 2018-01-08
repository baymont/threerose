import * as BABYLON from 'babylonjs';
import Entity from './Entity';

export interface IComponentContext {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    entity: Entity;
    node: BABYLON.Mesh;
}

export default abstract class Component {
    context: IComponentContext;
    loaded: boolean;

    /**
     * Called when the attached component is mounted.
     */
    public didMount(): void {}

    public onEntityUpdated(): void {}

    public tick(): void {}

    public unmount(): void {}
}
