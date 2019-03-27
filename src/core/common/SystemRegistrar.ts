import { Scene, Observer } from 'babylonjs';

import Component from '../Component';
import Entity from '../Entity';
import IInternalComponent from '../internals/IInternalComponent';
import IInternalSystem from '../internals/IInternalSystem';
import System from '../System';
import NucleusHelper from './NucleusHelper';

/**
 * The registrar for Systems in a scene.
 * @public
 */
export default class SystemRegistrar {
  private _instatiatedEntites: Entity[] = [];
  private _systems: Map<new() => Component, System> = new Map<new() => Component, System>();
  private _scene: Scene;
  private _onDisposeToken: Observer<Scene>;

  public static for(scene: Scene): SystemRegistrar {
    if (scene.isDisposed) {
      throw new Error('This scene has been disposed.');
    }

    return NucleusHelper.getContextFor(scene).systemRegistrar;
  }

  constructor(scene: Scene) {
    this._scene = scene;
    this._onDisposeToken = scene.onDisposeObservable.addOnce(() => {
      this.dispose();
    })!;
  }

   public get isDisposed(): boolean {
    return this._scene.isDisposed;
  }

  /**
   * Gets all registered systems.
   */
  public get systems(): System[] {
    const systems: System[] = [];
    this._systems.forEach(system => {
      systems.push(system);
    });
    return systems;
  }

  /**
   * Gets a system by component type.
   * @param component - the component type
   */
  // tslint:disable-next-line:no-any
  public getSystem<T extends Component>(component: new(...args: any[]) => T): System | undefined {
    return this._systems.get(component);
  }

  /**
   * Register an array of systems.
   * @param systems - the systems
   */
  public registerSystems(systems: System[]): void {
    systems.forEach(system => this.registerSystem(system));
  }

  /**
   * Register a system.
   * @param system - the system
   */
  public registerSystem<TSystem extends System>(system: TSystem): TSystem {
    this._throwIfSceneDisposed();
    if (this._systems.has(system.componentType)) {
      throw new Error('System already registered for this component type.');
    }
    this._systems.set(system.componentType, system);
    this._initializeSystem(system);
    return system;
  }

  /**
   * Unregister a system.
   * @param system - the system
   */
  public unregisterSystem<TSystem extends System>(system: TSystem): void {
    this._throwIfSceneDisposed();
    if (!this._systems.has(system.componentType)) {
      throw new Error('System not registered for this component type.');
    }

    this._systems.delete(system.componentType);
    this._disposeSystem(system);
  }

  public dispose(): void {
    this._systems.forEach(system => {
      this._disposeSystem(system);
    });
    this._systems.clear();
    if (!this._scene.isDisposed) {
      this._scene.onDisposeObservable.remove(this._onDisposeToken);
      this._scene.dispose();
    }
  }

  /**
   * @internal
   */
  // tslint:disable-next-line:no-unused-variable
  private _internalRegisterEntity(entity: Entity): void {
    this._instatiatedEntites.push(entity);
  }

  /**
   * @internal
   */
  // tslint:disable-next-line:no-unused-variable
  private _internalUnregisterEntity(entity: Entity): void {
    this._instatiatedEntites.splice(this._instatiatedEntites.indexOf(entity), 1);
  }

  private _disposeSystem(system: System): void {
    const internalSystem: IInternalSystem = system as any; // tslint:disable-line:no-any
    this._scene.onBeforeRenderObservable.removeCallback(internalSystem.onBeforeRender);
    internalSystem._internalDispose();
  }

  private _initializeSystem(system: System): void {
    const internalSystem: IInternalSystem = system as any; // tslint:disable-line:no-any
    internalSystem._internalInit(NucleusHelper.getContextFor(this._scene));

    this._scene.onBeforeRenderObservable.add(internalSystem.onBeforeRender);

    // intiailize any mounted entities
    this._instatiatedEntites.forEach(entity => {
      entity.components.forEach(component => {
        if (component.constructor === system.componentType) {
          const internalComponent: IInternalComponent = component as any; // tslint:disable-line:no-any
          internalComponent._system = system;
        }
      });
    });
  }

  private _throwIfSceneDisposed(): never | void {
    if (this.isDisposed) {
      throw new Error('The scene for this Nucleus instance has been disposed.');
    }
  }
}
