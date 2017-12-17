import Component from '../Behavior';
import Entity from '../Component';
import Vector3 from './Vector3';

export default interface IComponentProps {
    readonly components?: Component[];
    readonly position?: Vector3;
    readonly rotation?: Vector3;
}
