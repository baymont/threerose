import * as BABYLON from 'babylonjs';

import Color4 from '../core/common/Color4';
import Vector2 from '../core/common/Vector2';
import Vector3 from '../core/common/Vector3';
import Vector4 from '../core/common/Vector4';
import Component from '../core/Component';

export interface IRibbonGeometryProps {
  pathArray: Vector3[][];
  closeArray?: boolean;
  closePath?: boolean;
  offset?: number;
  sideOrientation?: number;
  frontUVs?: Vector4;
  backUVs?: Vector4;
  invertUV?: boolean;
  uvs?: Vector2[];
  colors?: Color4[];
}

/**
 * Ribbon geometry for an entity.
 */
export default class RibbonGeometry extends Component<IRibbonGeometryProps> {
  protected didMount(): void {
    this._applyVertexData();
  }

  protected onPropsUpdated(): void {
    this._applyVertexData();
  }

  private _applyVertexData(): void {
    const vertexData: BABYLON.VertexData = BABYLON.VertexData.CreateRibbon(this.props);
    vertexData.applyToMesh(this.entity.node as BABYLON.Mesh, false);
  }
}
