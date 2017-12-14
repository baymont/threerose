import * as BABYLON from 'babylonjs';

export interface IBehaviorContext {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    node: BABYLON.Mesh;
}

export default abstract class Behavior {
    context: IBehaviorContext;
    loaded: boolean;
    abstract runOnRenderLoop: boolean;

    /**
     * Called when the attached component is mounted. 
     */
    public didMount(): void {
    }

    public onComponentUpdated(): void {
    }

    public tick(): void {
    }

    public unmount(): void {
    }
}