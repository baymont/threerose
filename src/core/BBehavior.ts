import * as BABYLON from 'babylonjs';

export interface IBBehaviorContext {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    node: BABYLON.Mesh;
}

export default abstract class BBehavior {
    context: IBBehaviorContext;
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