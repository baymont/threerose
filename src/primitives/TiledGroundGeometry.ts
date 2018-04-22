import * as BABYLON from 'babylonjs';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

/**
 * @public
 */
export interface ITiledGroundGeometryProps {
  xmin: number;
  zmin: number;
  xmax: number;
  zmax: number;
  subdivisions?: {
      w: number;
      h: number;
  };
  precision?: {
      w: number;
      h: number;
  };
}

/**
 * Tiled ground geometry for an entity.
 * @public
 */
export default class TiledGroundGeometry extends Component<ITiledGroundGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateTiledGround(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
