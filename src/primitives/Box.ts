import BComponent from '../core/BComponent';
import * as BABYLON from 'babylonjs';
import IComponentProps from '../core/common/IComponentProps';

export interface IBoxProps extends IComponentProps {
    size?: number;
    width?: number;
    height?: number;
    depth?: number;
    sideOrientation?: number;
}
  
// Define a custom element type.
export default class Box extends BComponent<IBoxProps> {
    
    protected onMount(): BABYLON.Mesh {
        return BABYLON.MeshBuilder.CreateBox(this.key, this.props, this.context.scene);
    }
    
    protected onUpdated(): void {
        throw new Error("Method not implemented.");
    }
}