import SceneEntity from '../core/common/SceneEntity';
import Entity from '../core/Entity';

/**
 * nucleus3d camera
 */
export default class Camera extends Entity {
  protected _camera: BABYLON.FreeCamera;

  public setActive(): void {
    if (!this.isMounted) {
      throw new Error('Camera not mounted.');
    }
    this.context.scene.setActiveCameraByID(this._camera.id);
  }

  protected onMount(): BABYLON.AbstractMesh {
    if (!(this.parent instanceof SceneEntity)) {
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
}
