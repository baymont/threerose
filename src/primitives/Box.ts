import * as BABYLON from 'babylonjs';
import Entity from '../core/Entity';

export interface IBoxProps {
    size?: number;
    width?: number;
    height?: number;
    depth?: number;
    sideOrientation?: number;
}

// Define a custom element type.
export default class Box extends Entity<IBoxProps> {
    protected onMount(): BABYLON.Mesh {
        return BABYLON.MeshBuilder.CreateBox(
            this.key,
            this.props,
            this.context.scene
        );
    }

    protected onUpdated(): void {
        throw new Error('Method not implemented.');
    }
}
