import Component from '../Component';
import Entity from '../Entity';
import Vector3 from './Vector3';

export default interface IEntityProps {
    readonly position?: Vector3;
    readonly rotation?: Vector3;
    readonly scaling?: Vector3;
    readonly scale?: number;
}
