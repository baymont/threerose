import EntityBase from '../Component';
import IComponentProps from './IComponentProps';
import IComponentContext from './IComponentContext';
import Scene from './Scene';

/**
 * bframe hemispheric light
 */
export default class HemisphericLight extends EntityBase<IComponentProps> {
    protected onMount(): BABYLON.Mesh {
        const light = new BABYLON.HemisphericLight(
            'skyLight',
            new BABYLON.Vector3(0, 1, 0),
            this.context.scene
        );

        const node = super.onMount();
        light.parent = node;
        return node;
    }
}
