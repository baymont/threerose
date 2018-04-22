import * as BABYLON from 'babylonjs';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

/**
 * @public
 */
export interface IDiscGeometryProps {
  radius?: number;
  tessellation?: number;
  arc?: number;
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
}

/**
 * Disc geometry for an entity.
 * @public
 */
export default class DiscGeometry extends Component<IDiscGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateDisc(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
