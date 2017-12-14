import BComponent from '../core/BComponent';
import * as BABYLON from 'babylonjs';
import IComponentProps from '../core/common/IComponentProps';

/**
 * The base for making group controls.
 */
export default abstract class Group<T extends IComponentProps> extends BComponent<T> {
    
    protected onMount(): BABYLON.Mesh {
        return new BABYLON.Mesh(this.key, this.context.scene);
    }

    
    protected onUpdated(): void {
        // Nothing to update
    }
}