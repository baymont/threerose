import * as BABYLON from 'babylonjs';
import Group from './Group';
import IComponentProps from '../core/common/IComponentProps';
import BComponent from '../core/BComponent';

export enum StackOrientation {
    X,
    Y,
    Z
}

export interface IStackGroupProps extends IComponentProps {
    orientation: StackOrientation;
}

/**
 * Stack 3D components.
 */
export default class StackGroupControl extends Group<IStackGroupProps> {
    
    protected didMount(): void {
        this.onUpdated();
    }

    protected onUpdated(): void {
        this.childrenUpdated();
    }

    protected childrenUpdated(): void {
        let offset: number = 0;

        // update children's position
        this.children.forEach((child: BComponent<any>) => {
            // TODO: assuming Y for now
            child.node.position.y = offset;
            offset += child.node.getBoundingInfo().boundingBox.maximum.y - child.node.getBoundingInfo().boundingBox.minimum.y
        });
    }
}