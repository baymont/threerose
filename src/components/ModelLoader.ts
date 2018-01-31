import Component from '../core/Component';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export interface IModelLoaderProps {
  url?: string;
}

export default class ModelLoader extends Component<IModelLoaderProps> {
    public didMount(): void {
        this.loadModel(this.props.url).then(
            (meshes: Array<BABYLON.AbstractMesh>) => {
                meshes.forEach((mesh) => {
                    mesh.parent = this.context.node;
                });
            }
        );
    }

    protected onUpdated(oldProps: IModelLoaderProps){
        this.context.node.getChildMeshes().forEach((mesh: BABYLON.AbstractMesh) => {
            mesh.dispose();
        });
        this.didMount();
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
