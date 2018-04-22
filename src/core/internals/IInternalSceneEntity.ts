import Component from '../Component';
import Entity from '../Entity';
import System from '../System';

export default interface IInternalSceneEntity {
  _internalGetSystemFor(component: Component): System;
  _registerEntity(entity: Entity): void;
  _unregisterEntity(entity: Entity): void;
}
