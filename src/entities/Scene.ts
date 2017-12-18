import IComponentProps from '../core/common/IComponentProps';
import EntityBase from '../core/Component';

/**
 * Represents the root of any bframe tree
 */
export default class Scene extends EntityBase<IComponentProps> {

    protected onMount(): BABYLON.Mesh {
        if (this.context.scene !== undefined) {
            throw new Error("There's a Scene already mounted.");
        }
        this.context.scene = new BABYLON.Scene(this.context.engine);
        return super.onMount();
    }
}
