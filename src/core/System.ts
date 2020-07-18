import cloneDeep = require('lodash/cloneDeep');

import INucleusContext from './common/INucleusContext';
import Component from './Component';

/**
 * Provide global scope, services, and management to classes of components.
 * @public
 */
export default abstract class System<TProps = {}, TComponent extends Component = Component> {
  // tslint:disable-next-line:no-any
  private _componentType: new(...args: any[]) => TComponent;
  private _props: TProps;
  private _context?: INucleusContext;
  private _isInitialized: boolean;

  /**
   * Constructs the system.
   * @param componentType - the component type to associate with the system
   */
  // tslint:disable-next-line:no-any
  constructor(componentType: new(...args: any[]) => TComponent) {
    this._props = {} as TProps;
    this._componentType = componentType;
    this.onBeforeRender = this.onBeforeRender.bind(this);
  }

  /**
   * Gets the context.
   */
  protected get context(): INucleusContext {
    if (!this.isInitialized) {
      this._throwNotInitialized();
    }
    return this._context!;
  }

  /**
   * Gets whether the system has been initialized.
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Gets the properties.
   */
  public get props(): TProps {
    return this._props;
  }

  /**
   * Gets the associated component type.
   */
  // tslint:disable-next-line:no-any
  public get componentType(): new(...args: any[]) => Component {
    return this._componentType;
  }

  /**
   * Update properties.
   * @param props - The new properties
   */
  public updateProps(props: TProps): void {
    if (!this._isInitialized || this.willPropsUpdate(props)) {
      const oldProps: TProps = cloneDeep(this.props);
      this._props = Object.assign(this.props, cloneDeep(props));

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
  protected onBeforeRender(): void {
    // EMPTY BLOCK
  }

  /**
   * Called when a system related component is mounted.
   * @param component - the new component
   */
  protected onComponentDidMount(component: TComponent): void {
    // EMPTY BLOCK
  }

  /**
   * Called when a system related component is about to be unmounted.
   * @param component - the component
   */
  protected onComponentWillUnmount(component: TComponent): void {
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

  /**
   * @internal
   */
  // tslint:disable-next-line:no-unused-variable
  private _internalInit(context: INucleusContext): void {
    this._context = context;
    this._isInitialized = true;
    this.onInit();
  }

  /**
   * @internal
   */
  // tslint:disable-next-line:no-unused-variable
  private _internalDispose(): void {
    this._context = undefined;
    this.onDispose();
    this._isInitialized = false;
  }

  private _throwNotInitialized(): never {
    throw new Error('System has not been initialized.');
  }
}
