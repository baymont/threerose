import * as BABYLON from 'babylonjs';
import Color3 from '../core/common/Color3';
import Component from '../core/Component';

export interface IGroundFromHeightMapGeometryProps {
  width: number;
  height: number;
  subdivisions: number;
  minHeight: number;
  maxHeight: number;
  colorFilter: Color3;
  buffer: Uint8Array;
  bufferWidth: number;
  bufferHeight: number;
}

/**
 * Ground from height map geometry for an entity.
 */
export default class GroundFromHeightMapGeometry extends Component<IGroundFromHeightMapGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateGroundFromHeightMap(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
