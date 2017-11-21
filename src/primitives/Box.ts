import BComponent, { IComponentProps } from '../core/BComponent';
import * as BABYLON from 'babylonjs';

export interface IBoxProps extends IComponentProps {
    size?: number;
    width?: number;
    height?: number;
    depth?: number;
    sideOrientation?: number;
    updatable?: boolean;
}
  
// Define a custom element type.
export default class Box extends BComponent<IBoxProps> {
    constructor(props: IBoxProps, children?: BComponent<any>[]) {
        super(props, children);
    }

    protected create(): BABYLON.TransformNode {
        return BABYLON.MeshBuilder.CreateBox(this.key, this.props, this.context.scene);
    }
}