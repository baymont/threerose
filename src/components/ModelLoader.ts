
import * as BABYLON from 'babylonjs';

import Component from '../core/Component';

export interface IModelLoaderProps {
  url?: string;
}

export default class ModelLoader extends Component<IModelLoaderProps> {
  protected didMount(): void {
    this.loadModel(this.props.url).then(
      (meshes: BABYLON.AbstractMesh[]) => {
        meshes.forEach(mesh => {
          mesh.parent = this.context.entity.node;
        });
      }
    );
  }

  protected onUpdated(oldProps: IModelLoaderProps) {
    this.context.entity.node.getChildMeshes().forEach((mesh: BABYLON.AbstractMesh) => {
      mesh.dispose();
    });
    this.didMount();
  }

  private loadModel(modelUrl: string): Promise<BABYLON.AbstractMesh[]> {
    const parts = modelUrl.split('/');
    const filename = parts.pop();
    const base = parts.join('/') + '/';

    return Promise.resolve().then(() => {
      return new Promise<BABYLON.AbstractMesh[]>(
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
              reject(m);
            }
          );
        }
      );
    });
  }
}
