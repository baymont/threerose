import * as BABYLON from 'babylonjs';
import Vector3 from '../core/common/Vector3';
import Component from '../core/Component';

/**
 * @public
 */
export interface IDashedLinesGeometryProps {
  points: Vector3[];
  dashSize?: number;
  gapSize?: number;
  dashNb?: number;
}

/**
 * Dashed lines geometry for an entity.
 * @public
 */
export default class DashedLinesGeometry extends Component<IDashedLinesGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateDashedLines(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
