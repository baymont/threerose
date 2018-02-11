import * as BABYLON from 'babylonjs';

import Component from '../core/Component';
import Vector3 from '../core/common/Vector3';

export interface ITransformProps {
    rotation?: Vector3;
    position?: Vector3;
    scaling?: Vector3;
}

export default class Transform extends Component {
    public didMount(): void {
        const props: ITransformProps = this.context.entity.props;
        this.onEntityWillUpdate(undefined, props);
    }

    public onEntityWillUpdate(oldProps: ITransformProps, newProps: ITransformProps) : void {
        if (newProps) {
            if ((oldProps && oldProps.rotation !== newProps.rotation) || (!oldProps && newProps.rotation)) {
                this.context.node.rotation = new BABYLON.Vector3(
                    BABYLON.Tools.ToRadians(newProps.rotation.x || 0),
                    BABYLON.Tools.ToRadians(newProps.rotation.y || 0),
                    BABYLON.Tools.ToRadians(newProps.rotation.z || 0)
                );
            }
            if ((oldProps && oldProps.position !== newProps.position) || (!oldProps && newProps.position)) {
                this.context.node.position = new BABYLON.Vector3(
                    newProps.position.x || 0,
                    newProps.position.y || 0,
                    newProps.position.z || 0
                );
            }
            if ((oldProps && oldProps.scaling !== newProps.scaling) || (!oldProps && newProps.scaling)) {
                this.context.node.scaling = new BABYLON.Vector3(
                    newProps.scaling.x || 0,
                    newProps.scaling.y || 0,
                    newProps.scaling.z || 0
                );
            }
        }
    }
}