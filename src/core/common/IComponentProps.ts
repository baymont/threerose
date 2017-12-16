import Behavior from '../Behavior';
import Component from '../Component';
import Vector3 from './Vector3';

export default interface IComponentProps {
    readonly behaviors?: Behavior[];
    readonly position?: Vector3;
    readonly rotation?: Vector3;
}
