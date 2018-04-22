import Component from '../Component';
import Entity from '../Entity';
import IInternalComponent from '../internals/IInternalComponent';
import IInternalSystem from '../internals/IInternalSystem';
import System from '../System';

/**
 * Represents the root of any nucleus tree
 */
export default class SceneEntity extends Entity {
  public static from(scene: BABYLON.Scene): SceneEntity {
    if (scene.isDisposed) {
      throw new Error('This scene has been disposed.');
    }

    let entity: SceneEntity = SceneEntity.extractFrom(scene);
    if (entity) {
      return entity;
    }
    entity = new SceneEntity();
    entity.mount(scene.getEngine(), scene);
    return entity;
  }

  private static extractFrom(scene: BABYLON.Scene) {
    return (scene as any).__entity__; // tslint:disable-line:no-any
  }

  private static setTo(scene: BABYLON.Scene, entity: Entity) {
    (scene as any).__entity__ = entity; // tslint:disable-line:no-any
  }

  private _mountedEntities: Entity[] = [];
  private _systems: Map<new() => Component, System> = new Map<new() => Component, System>();

  constructor() {
    super({}, 'Scene');
  }

  /**
   * The rendering canvas
   */
  public get canvas(): HTMLCanvasElement {
    return this.context.engine.getRenderingCanvas();
  }

  public get systems(): System[] {
    const systems: System[] = [];
    this._systems.forEach(system => {
      systems.push(system);
    });
    return systems;
  }

  /**
   * Mounts the scene.
   * @param engine The BABYLON engine
   * @param scene An optional BABYLON scene to use instead of creating a new one.
   */
  public mount(engine: BABYLON.Engine, scene: BABYLON.Scene): void {
    if (SceneEntity.extractFrom(scene)) {
      throw new Error('The passed scene has an associated entity. Use SceneEntity.from(scene).');
    }
    SceneEntity.setTo(scene, this);
    (this as any)._mount({ // tslint:disable-line no-any
      engine,
      scene,
      sceneEntity: this
    });
  }

  // tslint:disable-next-line:no-any
  public getSystem<T extends Component>(component: new(...args: any[]) => T): System {
    return this._systems.get(component);
  }

  public registerSystems(systems: System[]): void {
    systems.forEach(system => this.registerSystem(system));
  }

  public registerSystem<TSystem extends System>(system: TSystem): TSystem {
    if (this._systems.has(system.componentType)) {
      throw new Error('System already registered for this component type.');
    }

    this._systems.set(system.componentType, system);

    if (this.isMounted) {
      this._initializeSystem(system);
    }

    return system;
  }

  public unregisterSystem<TSystem extends System>(system: TSystem): void {
    if (!this._systems.has(system.componentType)) {
      throw new Error('System not registered for this component type.');
    }

    this._systems.delete(system.componentType);

    if (this.isMounted) {
      this._disposeSystem(system);
    }
  }

  protected willUnmount(): void {
    this._systems.forEach(system => {
      this._disposeSystem(system);
    });
  }

  private _registerEntity(entity: Entity): void {
    this._mountedEntities.push(entity);
  }

  private _unregisterEntity(entity: Entity): void {
    this._mountedEntities.splice(this._mountedEntities.indexOf(entity), 1);
  }

  private _internalGetSystemFor(component: Component): System {
    return this._systems.get(component.constructor as new() => Component);
  }

  private _initializeSystems(): void {
    this._systems.forEach(system => {
      this._initializeSystem(system);
    });
  }

  private _disposeSystem(system: System): void {
    const internalSystem: IInternalSystem = system as any; // tslint:disable-line:no-any
    this.context.scene.onBeforeRenderObservable.removeCallback(internalSystem.onUpdate);
    internalSystem._internalDispose();
  }

  private _initializeSystem(system: System): void {
    const internalSystem: IInternalSystem = system as any; // tslint:disable-line:no-any
    internalSystem._internalInit(this.context.engine, this.context.scene);

    this.context.scene.onBeforeRenderObservable.add(internalSystem.onUpdate);

    // intiailize any mounted entities
    this._mountedEntities.forEach(entity => {
      entity.components.forEach(component => {
        const internalComponent: IInternalComponent = component as any; // tslint:disable-line:no-any
        internalComponent._system = system;
      });
    });
  }
}
