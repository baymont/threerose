import Entity from '../Component';
import IComponentProps from './IComponentProps';
import IComponentContext from './IComponentContext';
import Scene from './Scene';

/**
 * bframe ground
 */
export default class Ground extends Entity<IComponentProps> {
    protected onMount(): BABYLON.Mesh {
        const ground = BABYLON.MeshBuilder.CreateGround(
            'groundPlane',
            { width: 6, height: 6, subdivisions: 2 },
            this.context.scene
        );
        return ground;
    }
}
