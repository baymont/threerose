import * as BABYLON from 'babylonjs';

export interface IBSystemContext {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    node: BABYLON.Mesh;
}

export default abstract class BSystem {
    context: IBSystemContext;
    loaded: boolean;
    abstract runOnRenderLoop: boolean;

    /**
     * Called when the attached component is mounted. 
     */
    public didMount(): void {
    }

    public onPropsUpdated(): void {
    }

    public tick(): void {
    }

    public unmount(): void {
    }
}