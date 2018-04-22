import * as BABYLON from 'babylonjs';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

/**
 * @public
 */
export interface IPlaneGeometryProps {
  size?: number;
  width?: number;
  height?: number;
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
}

/**
 * Plane geometry for an entity.
 * @public
 */
export default class PlaneGeometry extends Component<IPlaneGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreatePlane(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
