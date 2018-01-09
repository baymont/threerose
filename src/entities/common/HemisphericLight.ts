import Entity from "../../core/Entity";

/**
 * bframe hemispheric light
 */
export default class HemisphericLight extends Entity {
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