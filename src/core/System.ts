import cloneDeep = require('lodash/cloneDeep');
import Component from './Component';

export interface ISystemContext {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
}

export default abstract class System<TProps = {}> {
  private _componentType: string;
  private _props: TProps;
  private _context: ISystemContext;
  private _isInitialized: boolean;

  constructor(componentType: new() => Component) {
    this._componentType = componentType.name;
    this.onUpdate = this.onUpdate.bind(this);
  }

  protected get context(): ISystemContext {
    return this._context;
  }

  public get props(): TProps {
    return this._props;
  }

  public get componentType(): string {
    return this._componentType;
  }

  /**
   * Update properties
   * @param props The new properties
   */
  public updateProps(props: TProps): void {
    if (!this._isInitialized || this.willPropsUpdate(props)) {
      const oldProps: TProps = cloneDeep(this.props);
      this._props = Object.assign(cloneDeep(props), this.props);

      if (this._isInitialized) {
        this.onPropsUpdated(oldProps);
      }
    }
  }

  /**
   * Called to initialize the system.
   */
  protected onInit(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before render.
   */
  protected onUpdate(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before update. False will reject the changes.
   */
  protected willPropsUpdate(newProps: TProps): boolean {
    return true;
  }

  /**
   * Called after props updated.
   */
  protected onPropsUpdated(oldProps: TProps): void {
    // EMPTY BLOCK
  }

  /**
   * Called when disposing of system.
   */
  protected onDispose(): void {
    // EMPTY BLOCK
  }

  private _internalInit(engine: BABYLON.Engine, scene: BABYLON.Scene): void {
    this._context = {
      engine,
      scene
    };
    this.onInit();
    this._isInitialized = true;
  }

  private _internalDispose(): void {
    this._context = undefined;
    this.onDispose();
    this._isInitialized = false;
  }
}
