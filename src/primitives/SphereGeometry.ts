import * as BABYLON from 'babylonjs';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

/**
 * @public
 */
export interface ISphereGeometryProps {
  segments?: number;
  diameter?: number;
  diameterX?: number;
  diameterY?: number;
  diameterZ?: number;
  arc?: number;
  slice?: number;
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
}

/**
 * Sphere geometry for an entity.
 * @public
 */
export default class SphereGeometry extends Component<ISphereGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateSphere(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
