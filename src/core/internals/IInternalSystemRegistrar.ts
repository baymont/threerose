import Entity from '../Entity';

export default interface IInternalSystemRegistrar {
  _internalRegisterEntity(entity: Entity): void;
  _internalUnregisterEntity(entity: Entity): void;
}
