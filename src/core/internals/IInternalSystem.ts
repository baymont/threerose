import INucleusContext from '../common/INucleusContext';
import Component from '../Component';

export default interface IInternalSystem {
  _internalInit(context: INucleusContext): void;
  _internalDispose(): void;
  onBeforeRender(): void;
  // tslint:disable: no-any
  onComponentDidMount(component: Component<any, any>): void;
  onComponentWillUnmount(component: Component<any, any>): void;
  // tslint:enable: no-any
}
