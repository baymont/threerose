import * as BABYLON from 'babylonjs';
import Color4 from '../core/common/Color4';
import Vector3 from '../core/common/Vector3';
import Component from '../core/Component';

export interface ILineSystemGeometryProps {
  lines: Vector3[][];
  colors?: Color4[][];
}

/**
 * Line system geometry for an entity.
 */
export default class LineSystemGeometry extends Component<ILineSystemGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateLineSystem(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
