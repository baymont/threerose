import EntityBase from '../Component';
import IComponentProps from './IComponentProps';
import IComponentContext from './IComponentContext';
import Camera from './Camera';

/**
 * Represents the root of any bframe tree
 */
export default class Scene extends EntityBase<IComponentProps> {
    public get canvas(): HTMLCanvasElement {
        return this.context.engine.getRenderingCanvas();
    }

    public mount(engine: BABYLON.Engine, scene?: BABYLON.Scene) {
        if (scene === undefined) {
            scene = new BABYLON.Scene(engine);
            engine.runRenderLoop(() => {
                scene.render();
            });
        }

        super._mount({
            engine: engine,
            scene: scene,
            sceneEntity: this
        });
    }

    public setActiveCamera(camera: Camera): void {
        if (camera.parent !== this) {
            if (camera.parent !== undefined) {
                camera.unmount();
            }
            this.mountChild(camera);
        }

        if (this.isMounted) {
            camera.setActive();
        }
    }
}
