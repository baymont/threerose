import * as BABYLON from 'babylonjs';
import Container from './common/Container';
import IComponentProps from '../core/common/IComponentProps';
import Component from '../core/Component';

export enum StackOrientation {
    X,
    Y,
    Z
}

export interface IStackContainerProps extends IComponentProps {
    orientation: StackOrientation;
}

/**
 * Stacks 3D components.
 */
export default class StackContainer extends Container<IStackContainerProps> {
    protected didMount(): void {
        this.onUpdated();
    }

    protected onUpdated(): void {
        this.childrenUpdated();
    }

    protected childrenUpdated(): void {
        let offset: number = 0;

        // update children's position
        this.children.forEach((child: Component<any>) => {
            // TODO: assuming Y for now
            child.node.position.y = offset;
            offset +=
                child.node.getHierarchyBoundingVectors().max.y -
                child.node.getHierarchyBoundingVectors().min.y;
        });
    }
}
