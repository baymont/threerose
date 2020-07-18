import { Vector3, Tools } from 'babylonjs';

import Component from '../core/Component';

/**
 * @beta
 */
export interface ITransformProps {
  rotation?: Vector3;
  position?: Vector3;
  scaling?: Vector3;
}

/**
 * Basic transform component.
 * @beta
 */
export default class Transform extends Component<ITransformProps> {
  protected didMount(): void {
    const props: ITransformProps = this.entity.props;
    this._updateTransform(undefined, props);
  }

  protected onPropsUpdated(oldProps: ITransformProps): void {
    this._updateTransform(oldProps, this.props);
  }

  protected onEntityPropsWillUpdate(oldProps: ITransformProps): void {
    this._updateTransform(oldProps, this.props);
  }

  private _updateTransform(oldProps: ITransformProps | undefined, newProps: ITransformProps): void {
    if (newProps) {
      if ((oldProps && oldProps.rotation !== newProps.rotation) || (!oldProps && newProps.rotation)) {
        this.entity.node.rotation = new Vector3(
          Tools.ToRadians(newProps.rotation!.x || 0),
          Tools.ToRadians(newProps.rotation!.y || 0),
          Tools.ToRadians(newProps.rotation!.z || 0)
        );
      }
      if ((oldProps && oldProps.position !== newProps.position) || (!oldProps && newProps.position)) {
        this.entity.node.position = new Vector3(
          newProps.position!.x || 0,
          newProps.position!.y || 0,
          newProps.position!.z || 0
        );
      }
      if ((oldProps && oldProps.scaling !== newProps.scaling) || (!oldProps && newProps.scaling)) {
        this.entity.node.scaling = new Vector3(
          newProps.scaling!.x || 0,
          newProps.scaling!.y || 0,
          newProps.scaling!.z || 0
        );
      }
    }
  }
}
