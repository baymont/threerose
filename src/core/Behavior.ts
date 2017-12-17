import * as BABYLON from 'babylonjs';

export interface IComponentContext {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    node: BABYLON.Mesh;
}

export default abstract class Component {
    context: IComponentContext;
    loaded: boolean;

    /**
     * Called when the attached component is mounted.
     */
    public didMount(): void {
    }

    public onComponentUpdated(): void {}

    public tick(): void {}

    public unmount(): void {}
}
