import * as BABYLON from 'babylonjs';
import Color4 from '../core/common/Color4';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

export interface IBoxGeometryProps {
  size?: number;
  width?: number;
  height?: number;
  depth?: number;
  faceUV?: Vector4[];
  faceColors?: Color4[];
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
}

/**
 * Box geometry for an entity.
 */
export default class BoxGeometry extends Component<IBoxGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateBox(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
