import EntityBase from '../core/Component';
import IComponentProps from '../core/common/IComponentProps';

export interface ISphereProps extends IComponentProps {
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
export default class Sphere extends EntityBase<ISphereProps> {
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
