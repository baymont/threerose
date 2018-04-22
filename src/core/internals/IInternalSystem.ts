export default interface IInternalSystem {
  _internalInit(engine: BABYLON.Engine, scene: BABYLON.Scene): void;
  _internalDispose(): void;
  onUpdate(): void;
}
