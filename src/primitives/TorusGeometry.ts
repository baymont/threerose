import * as BABYLON from 'babylonjs';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

/**
 * @public
 */
export interface ITorusGeometryProps {
  diameter?: number;
  thickness?: number;
  tessellation?: number;
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
}

/**
 * Torus geometry for an entity.
 * @public
 */
export default class TorusGeometry extends Component<ITorusGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateTorus(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
