import * as BABYLON from 'babylonjs';

import Vector3 from '../core/common/Vector3';
import Component from '../core/Component';

export interface ITransformProps {
  rotation?: Vector3;
  position?: Vector3;
  scaling?: Vector3;
}

/**
 * Supports having the properties on the entity or the component itself.
 */
export default class Transform extends Component<ITransformProps> {
  protected didMount(): void {
    const props: ITransformProps = this.context.entity.props;
    this._updateTransform(undefined, props);
  }

  protected onPropsUpdated(oldProps: ITransformProps): void {
    this._updateTransform(oldProps, this.props);
  }

  protected onEntityPropsWillUpdate(oldProps: ITransformProps): void {
    this._updateTransform(oldProps, this.props);
  }

  private _updateTransform(oldProps: ITransformProps, newProps: ITransformProps): void {
    if (newProps) {
      if ((oldProps && oldProps.rotation !== newProps.rotation) || (!oldProps && newProps.rotation)) {
        this.context.entity.node.rotation = new BABYLON.Vector3(
          BABYLON.Tools.ToRadians(newProps.rotation.x || 0),
          BABYLON.Tools.ToRadians(newProps.rotation.y || 0),
          BABYLON.Tools.ToRadians(newProps.rotation.z || 0)
        );
      }
      if ((oldProps && oldProps.position !== newProps.position) || (!oldProps && newProps.position)) {
        this.context.entity.node.position = new BABYLON.Vector3(
          newProps.position.x || 0,
          newProps.position.y || 0,
          newProps.position.z || 0
        );
      }
      if ((oldProps && oldProps.scaling !== newProps.scaling) || (!oldProps && newProps.scaling)) {
        this.context.entity.node.scaling = new BABYLON.Vector3(
          newProps.scaling.x || 0,
          newProps.scaling.y || 0,
          newProps.scaling.z || 0
        );
      }
    }
  }
}
