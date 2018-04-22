import * as BABYLON from 'babylonjs';
import Component from '../core/Component';

/**
 * @public
 */
export interface IGroundGeometryProps {
  width?: number;
  height?: number;
  subdivisions?: number;
  subdivisionsX?: number;
  subdivisionsY?: number;
}

/**
 * Ground geometry for an entity.
 * @public
 */
export default class GroundGeometry extends Component<IGroundGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateGround(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
