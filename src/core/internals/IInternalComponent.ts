import { IComponentContext } from '../Component';
import System from '../System';

export default interface IInternalComponent {
  _system: System;
  isEnabled: boolean;
  _internalMount(context: IComponentContext, system: System): void;
  _internalUnmount(): void;
  onEntityPropsWillUpdate(oldProps: {}): void;
  onEntityPropsUpdated(): void;
}
