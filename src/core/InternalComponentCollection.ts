import INucleusContext from './common/INucleusContext';
import SceneEntity from './common/SceneEntity';
import Component from './Component';
import Entity from './Entity';
import IInternalComponent from './internals/IInternalComponent';
import IInternalSceneEntity from './internals/IInternalSceneEntity';
import System from './System';

export default class InternalComponentCollection {
  private _isMounted: boolean;
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  private _entity: Entity;
  private _sceneEntity: SceneEntity;

  // tslint:disable-next-line:ban-types
  private _internalMap: Map<Function, IInternalComponent>
    = new Map<() => void, IInternalComponent>();

  // tslint:disable-next-line:ban-types
  public get map(): Map<Function, Component> {
    return this._internalMap as any; // tslint:disable-line:no-any
  }

  public get array(): Component[] {
    const arr: Component[] = [];
    this._internalMap.forEach(component => {
      arr.push(component as any); // tslint:disable-line:no-any
    });
    return arr;
  }

  public mount(entity: Entity, engine: BABYLON.Engine, scene: BABYLON.Scene, sceneEntity: SceneEntity): void {
    if (this._isMounted) {
      return;
    }

    this._entity = entity;
    this._engine = engine;
    this._scene = scene;
    this._sceneEntity = sceneEntity as any; // tslint:disable-line:no-any

    this._internalMap.forEach(component => {
      component._internalMount(
        this._entity,
        this._sceneEntity.getSystem(component.constructor as new() => Component)
      );
    });

    this._isMounted = true;
  }

  public mountComponent(component: Component): void {
    const internalComponent: IInternalComponent = component as any; // tslint:disable-line:no-any
    if (this._isMounted) {
      internalComponent._internalMount(
        this._entity,
        // tslint:disable-next-line:no-any
        this._sceneEntity.getSystem(component.constructor as new() => Component)
      );
    }
    this._internalMap.set(component.constructor, internalComponent);
  }

  public onEntityPropsWillUpdate(oldProps: {}): void {
    this._internalMap.forEach(component => {
      if (component.isEnabled) {
        component.onEntityPropsWillUpdate(oldProps);
      }
    });
  }

  public onEntityPropsUpdated(): void {
    this._internalMap.forEach(component => {
      if (component.isEnabled) {
        component.onEntityPropsUpdated();
      }
    });
  }

  public unmountComponent(component: Component, disposeMaterialAndTextures: boolean): void {
    const internalComponent: IInternalComponent = component as any; // tslint:disable-line:no-any

    this._internalMap.delete(component.constructor);
    internalComponent._internalUnmount(disposeMaterialAndTextures);
  }

  public unmount(disposeMaterialAndTextures: boolean): void {
    this._internalMap.forEach(component => {
      component._internalUnmount(disposeMaterialAndTextures);
    });
    this._internalMap.clear();
    this._entity = undefined;
    this._engine = undefined;
    this._scene = undefined;
    this._isMounted = false;
  }
}
