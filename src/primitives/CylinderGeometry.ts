import * as BABYLON from 'babylonjs';
import Color4 from '../core/common/Color4';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

/**
 * @public
 */
export interface ICylinderGeometryProps {
  height?: number;
  diameterTop?: number;
  diameterBottom?: number;
  diameter?: number;
  tessellation?: number;
  subdivisions?: number;
  arc?: number;
  faceColors?: Color4[];
  faceUV?: Vector4[];
  hasRings?: boolean;
  enclose?: boolean;
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
}

/**
 * Cylinder geometry for an entity.
 * @public
 */
export default class CylinderGeometry extends Component<ICylinderGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateCylinder(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
