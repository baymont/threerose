import * as BABYLON from 'babylonjs';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

/**
 * @public
 */
export interface IIcoSphereGeometryProps {
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  radiusZ?: number;
  flat?: boolean;
  subdivisions?: number;
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
}

/**
 * Ico sphere geometry for an entity.
 * @public
 */
export default class IcoSphereGeometry extends Component<IIcoSphereGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateIcoSphere(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
