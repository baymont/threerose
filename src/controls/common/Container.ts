import Component from '../../core/Component';
import * as BABYLON from 'babylonjs';
import IComponentProps from '../../core/common/IComponentProps';

/**
 * The base for making container controls.
 */
export default abstract class Container<T extends IComponentProps> extends Component<T> {
    
    protected onMount(): BABYLON.Mesh {
        return new BABYLON.Mesh(this.key, this.context.scene);
    }

    
    protected onUpdated(): void {
        // Nothing to update
    }
}