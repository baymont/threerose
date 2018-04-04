
import * as BABYLON from 'babylonjs';

import Component from '../core/Component';

export interface IModelLoaderProps {
  url?: string;
}

export default class ModelLoader extends Component<IModelLoaderProps> {
  private _root: BABYLON.Node;

  protected didMount(): void {
    this._root = new BABYLON.Node('root', this.context.scene);
    this.setParent(this._root);

    this.loadModel(this.props.url).then(
      (meshes: BABYLON.AbstractMesh[]) => {
        meshes.forEach(mesh => {
          mesh.parent = this._root;
        });
      }
    );
  }

  protected onPropsUpdated(oldProps: IModelLoaderProps) {
    this._root.dispose();
    this.didMount();
  }

  protected willUnmount(): void {
    this._root.dispose();
    this._root = undefined;
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
