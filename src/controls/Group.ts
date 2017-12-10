import BComponent from '../core/BComponent';
import * as BABYLON from 'babylonjs';
import IComponentProps from '../core/common/IComponentProps';

/**
 * A basic control for grouping 3D components.
 */
export default class Group extends BComponent<IComponentProps, {}> {
    protected onMount(): BABYLON.Mesh {
        return new BABYLON.Mesh(this.key, this.context.scene);
    }
}