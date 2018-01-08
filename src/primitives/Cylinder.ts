import * as BABYLON from 'babylonjs';
import IEntityProps from '../core/common/IEntityProps';
import Entity from '../core/Entity';

export interface ICylinderProps extends IEntityProps {
    readonly height?: number;
    readonly diameterTop?: number;
    readonly diameterBottom?: number;
    readonly diameter?: number;
    readonly tessellation?: number;
    readonly subdivisions?: number;
    readonly arc?: number;
    readonly hasRings?: boolean;
    readonly enclose?: boolean;
    readonly sideOrientation?: number;
}

// Define a custom element type.
export default class Cylinder extends Entity<ICylinderProps> {
    protected onMount(): BABYLON.Mesh {
        return BABYLON.MeshBuilder.CreateCylinder(
            this.key,
            this.props,
            this.context.scene
        );
    }

    protected onUpdated(): void {
        throw new Error('Method not implemented.');
    }
}
