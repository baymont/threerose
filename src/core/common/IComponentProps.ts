import Component from '../Behavior';
import EntityBase from '../Component';
import Vector3 from './Vector3';

export default interface IComponentProps {
    readonly components?: Component[];
    readonly position?: Vector3;
    readonly rotation?: Vector3;
    readonly scaling?: Vector3;
}
