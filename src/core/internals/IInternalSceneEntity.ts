import Component from '../Component';
import Entity from '../Entity';
import System from '../System';

export default interface IInternalSceneEntity {
  _internalRegisterEntity(entity: Entity): void;
  _internalUnregisterEntity(entity: Entity): void;
}
