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
        this.onChildrenUpdated();
    }

    protected onSizeChanged(): void {
        this.onChildrenUpdated();
    }

    protected onChildrenUpdated(): void {
        let offset: number = 0;

        // update children's position
        this.children.forEach((child: Component<{}>) => {
            // TODO: assuming Y for now
            child.node.setPivotMatrix(BABYLON.Matrix.Translation(0.5, 1, 0.5));
            child.node.position.y = offset;

            const bounds = child.node.getHierarchyBoundingVectors(true);
            offset += bounds.max.y - bounds.min.y;
        });
    }
}
