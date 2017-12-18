import * as BABYLON from 'babylonjs';
import Container from './common/Container';
import IComponentProps from '../core/common/IComponentProps';
import Entity from '../core/Component';
import Vector3 from '../../lib/core/common/Vector3';

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
        this.children.forEach((child: Entity<{}>) => {
            // TODO: assuming Y for now
            // Wrap in stack container
            const stackItem: BABYLON.Mesh =
                child.node.parent.name === 'StackItem'
                    ? child.node.parent as BABYLON.Mesh
                    : new BABYLON.Mesh('StackItem');

            if (child.node.parent !== stackItem) {
                stackItem.parent = this.node;
                child.node.parent = stackItem;
            }

            stackItem.position.y = offset;

            const bounds = stackItem.getHierarchyBoundingVectors(true);

            const dimensions = bounds.max.subtract(bounds.min);
            stackItem.setPivotMatrix(
                BABYLON.Matrix.Translation(
                    0,
                    dimensions.y / 2,
                    0
                )
            );

            offset += dimensions.y;
        });
    }
}
