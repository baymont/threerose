import * as BABYLON from 'babylonjs';
import Vector3 from '../core/common/Vector3';
import Entity from '../core/Entity';

export enum StackOrientation {
  X,
  Y,
  Z
}

export interface IStackContainerProps {
  orientation: StackOrientation;
}

/**
 * Stacks 3D components.
 */
export default class StackContainer extends Entity<IStackContainerProps> {
  private _size: BABYLON.Vector3 = BABYLON.Vector3.Zero();

  protected didMount(): void {
    this._onSizeChanged();
  }

  protected onUpdated(): void {
    this._onSizeChanged();
  }

  protected onChildrenUpdated(): void {
    this._onSizeChanged();
  }

  protected tick(): void {
    try {
      const bounds = this.node.getHierarchyBoundingVectors(true);
      const newSize = bounds.max.subtract(bounds.min);

      if (
        this._size.x !== newSize.x ||
        this._size.y !== newSize.y ||
        this._size.z !== newSize.z
      ) {
        this._size = newSize;
        this._onSizeChanged();
      }
    } catch (err) {
      // Workaround for v3.1.0, TODO: https://github.com/BabylonJS/Babylon.js/issues/3406
    }
  }

  private _onSizeChanged(): void {
    let offset: number = 0;

    // update children's position
    this.children.forEach((child: Entity) => {
      // TODO: assuming Y for now
      // Wrap in stack container
      const stackItem: BABYLON.Mesh =
        child.node.parent.name === 'StackItem'
          ? child.node.parent as BABYLON.Mesh
          : new BABYLON.Mesh('StackItem');

      if (child.node.parent !== stackItem) {
        stackItem.parent = this.node;
        child.node.parent = stackItem;
      }

      stackItem.position.y = offset;

      const bounds = stackItem.getHierarchyBoundingVectors(true);

      const dimensions = bounds.max.subtract(bounds.min);
      stackItem.setPivotMatrix(
        BABYLON.Matrix.Translation(
          0,
          dimensions.y / 2,
          0
        )
      );

      offset += dimensions.y;
    });
  }
}
