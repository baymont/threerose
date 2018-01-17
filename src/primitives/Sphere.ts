import * as BABYLON from 'babylonjs';
import Entity from '../core/Entity';

export interface ISphereProps {
    readonly segments?: number;
    readonly diameter?: number;
    readonly diameterX?: number;
    readonly diameterY?: number;
    readonly diameterZ?: number;
    readonly arc?: number;
    readonly slice?: number;
    readonly sideOrientation?: number;
}

// Define a custom element type.
export default class Sphere extends Entity<ISphereProps> {
    protected onMount(): BABYLON.Mesh {
        return BABYLON.MeshBuilder.CreateSphere(
            this.key,
            this.props,
            this.context.scene
        );
    }

    protected onUpdated(): void {
        throw new Error('Method not implemented.');
    }
}
