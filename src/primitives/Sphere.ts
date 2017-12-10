import BComponent from '../core/BComponent';
import IComponentProps from '../core/common/IComponentProps';

export interface ISphereProps extends IComponentProps {
    segments?: number;
    diameter?: number;
    diameterX?: number;
    diameterY?: number;
    diameterZ?: number;
    arc?: number;
    slice?: number;
    sideOrientation?: number;
}
  
// Define a custom element type.
export default class Sphere extends BComponent<ISphereProps, {}> {
    protected onMount(): BABYLON.Mesh {
        return BABYLON.MeshBuilder.CreateSphere(this.key, this.props, this.context.scene);
    }
}