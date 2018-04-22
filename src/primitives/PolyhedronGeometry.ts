import * as BABYLON from 'babylonjs';
import Color4 from '../core/common/Color4';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

export interface IPolyhedronGeometryProps {
  type?: number;
  size?: number;
  sizeX?: number;
  sizeY?: number;
  sizeZ?: number;
  custom?: any; // tslint:disable-line:no-any
  faceUV?: Vector4[];
  faceColors?: Color4[];
  flat?: boolean;
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
}

/**
 * Polyhedron geometry for an entity.
 */
export default class PolyhedronGeometry extends Component<IPolyhedronGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreatePolyhedron(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
