import INucleusContext from '../common/INucleusContext';
import Entity from '../Entity';
import System from '../System';

export default interface IInternalComponent {
  _system: System;
  isEnabled: boolean;
  _internalMount(entity: Entity, system?: System): void;
  _internalUnmount(disposeMaterialAndTextures: boolean): void;
  onEntityPropsWillUpdate(oldProps: {}): void;
  onEntityPropsUpdated(): void;
}
