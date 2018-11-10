import SceneEntity from '../core/common/SceneEntity';
import Component from '../core/Component';

/**
 * A universal camera.
 * @beta
 */
export default class Camera extends Component {
  protected _camera?: BABYLON.UniversalCamera;

  public get id(): string | undefined {
    return this._camera ? this._camera.id : undefined;
  }

  protected didMount(): void {
    if (this.entity !== this.context.sceneEntity) {
      throw new Error('Camera needs to be mounted to a scene entity.');
    }
    this._camera = new BABYLON.UniversalCamera(
      'freeCamera',
      new BABYLON.Vector3(0, 5, -10),
      this.context.scene
    );
    this._camera.setTarget(BABYLON.Vector3.Zero());

    // Attach the camera to the canvas, this allows us to give input to the camera
    this._camera.attachControl(this.context.sceneEntity.canvas, false);

    this._camera.parent = this.context.sceneEntity.node;

    this.context.scene.setActiveCameraByID(this.id!);
  }

  protected willUnmount(): void {
    this._camera!.dispose();
    this._camera = undefined;
  }
}
