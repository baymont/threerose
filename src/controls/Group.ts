import Container from './common/Container';
import IComponentProps from '../core/common/IComponentProps';

/**
 * A basic control for grouping 3D components.
 */
export default class Group extends Container<IComponentProps> {
    protected onUpdated(): void {
        // Nothing to update
    }
}
