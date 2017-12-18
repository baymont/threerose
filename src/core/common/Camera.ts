import EntityBase from '../Component';
import IComponentProps from './IComponentProps';
import IComponentContext from './IComponentContext';
import Scene from './Scene';

/**
 * bframe camera
 */
export default class Camera extends EntityBase<IComponentProps> {
    protected _camera: BABYLON.FreeCamera;

    protected onMount(): BABYLON.Mesh {
        if (!(this.parent instanceof Scene)) {
            throw new Error('Camera needs to be mounted to a scene.');
        }
        this._camera = new BABYLON.FreeCamera(
            'freeCamera',
            new BABYLON.Vector3(0, 5, -10),
            this.context.scene
        );
        this._camera.setTarget(BABYLON.Vector3.Zero());
        
        // Attach the camera to the canvas, this allows us to give input to the camera
        this._camera.attachControl(this.context.sceneEntity.canvas, false);

        const node = super.onMount();
        this._camera.parent = node;
        return node;
    }

    public setActive(): void {
        if (!this.isMounted) {
            throw new Error("Camera not mounted.");
        }
        this.context.scene.setActiveCameraByID(this._camera.id);
    }
}
