import Entity from '../Entity';

/**
 * Represents the root of any nucleus tree
 */
export default class SceneEntity extends Entity {
  constructor() {
    super({}, 'Scene');
  }

  /**
   * The rendering canvas
   */
  public get canvas(): HTMLCanvasElement {
    return this.context.engine.getRenderingCanvas();
  }

  /**
   * Mounts the scene.
   * @param engine The BABYLON engine
   * @param scene An optional BABYLON scene to use instead of creating a new one.
   */
  public mount(engine: BABYLON.Engine, scene?: BABYLON.Scene): void {
    if (!scene) {
      scene = new BABYLON.Scene(engine);
      engine.runRenderLoop(() => {
        scene.render();
      });
    }

    (<any>this)._mount({ // tslint:disable-line no-any
      engine: engine,
      scene: scene,
      sceneEntity: this
    });
  }
}
