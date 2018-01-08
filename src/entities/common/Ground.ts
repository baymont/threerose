import Entity from '../../core/Entity';

/**
 * bframe ground
 */
export default class Ground extends Entity {
    protected onMount(): BABYLON.Mesh {
        const ground = BABYLON.MeshBuilder.CreateGround(
            'groundPlane',
            { width: 6, height: 6, subdivisions: 2 },
            this.context.scene
        );
        return ground;
    }
}