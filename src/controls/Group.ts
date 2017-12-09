import BComponent from '../core/BComponent';
import * as BABYLON from 'babylonjs';
import IControlState from './common/IControlProps';

/**
 * A basic control for grouping 3D components.
 */
export default class Group extends BComponent<IControlState> {
    protected create(): BABYLON.Mesh {
        return new BABYLON.Mesh(this.state.name, this.context.scene);
    }
}