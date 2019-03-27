import INucleusContext from '../common/INucleusContext';

export default interface IInternalSystem {
  _internalInit(context: INucleusContext): void;
  _internalDispose(): void;
  onBeforeRender(): void;
}
