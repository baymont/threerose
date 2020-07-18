import Entity from '../Entity';

export default interface IInternalSystemRegistrar {
  // tslint:disable: no-any
  _internalRegisterEntity(entity: Entity<any>): void;
  _internalUnregisterEntity(entity: Entity<any>): void;
  // tslint:enable: no-any
}
