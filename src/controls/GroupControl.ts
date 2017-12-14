import Group from './Group';
import IComponentProps from '../core/common/IComponentProps';

/**
 * A basic control for grouping 3D components.
 */
export default class GroupControl extends Group<IComponentProps> {
    
    protected onUpdated(): void {
        // Nothing to update
    }
}