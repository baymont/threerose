import BComponent from '../core/BComponent';
import * as BABYLON from 'babylonjs';
import IComponentProps from '../core/common/IComponentProps';

export interface ICylinderProps extends IComponentProps {
    height?: number;
    diameterTop?: number;
    diameterBottom?: number;
    diameter?: number;
    tessellation?: number;
    subdivisions?: number;
    arc?: number;
    updatable?: boolean;
    hasRings?: boolean;
    enclose?: boolean;
    sideOrientation?: number;
}
  
// Define a custom element type.
export default class Cylinder extends BComponent<ICylinderProps, {}> {
    protected onMount(): BABYLON.Mesh {
        return BABYLON.MeshBuilder.CreateCylinder(this.key, this.props, this.context.scene);
    }
}