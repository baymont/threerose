import Component from '../core/Component';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export default class ModelLoader extends Component {
    private _modelUrl: string;

    constructor(modelUrl: string) {
        super();
        this._modelUrl = modelUrl;
    }

    public didMount(): void {
        this.loadModel(this._modelUrl).then(
            (meshes: Array<BABYLON.AbstractMesh>) => {
                meshes.forEach((mesh) => {
                    mesh.parent = this.context.node;
                });
            }
        );
    }

    private loadModel(modelUrl: string): Promise<Array<BABYLON.AbstractMesh>> {
        let parts = modelUrl.split('/');
        let filename = parts.pop();
        let base = parts.join('/') + '/';

        return Promise.resolve().then(() => {
            return new Promise<Array<BABYLON.AbstractMesh>>(
                (resolve, reject) => {
                    BABYLON.SceneLoader.ImportMesh(
                        undefined,
                        base,
                        filename,
                        this.context.scene,
                        meshes => {
                            resolve(meshes);
                        },
                        undefined,
                        (e, m, exception) => {
                            console.log(m, exception);
                            reject(m);
                        }
                    );
                }
            );
        });
    }
}
