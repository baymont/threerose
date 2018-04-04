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

  private _internalArray: IInternalComponent[] = [];

  public get array(): Component[] {
    return this._internalArray as any; // tslint:disable-line:no-any
  }

  public mount(entity: Entity, engine: BABYLON.Engine, scene: BABYLON.Scene, sceneEntity: SceneEntity): void {
    if (this._isMounted) {
      return;
    }

    this._entity = entity;
    this._engine = engine;
    this._scene = scene;
    this._sceneEntity = sceneEntity as any; // tslint:disable-line:no-any

    this._internalArray.forEach(component => {
      component._internalMount(
        this._entity,
        // tslint:disable-next-line:no-any
        (this._sceneEntity as any as IInternalSceneEntity)._internalGetSystemFor(component as any)
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
        (this._sceneEntity as any as IInternalSceneEntity)._internalGetSystemFor(component)
      );
    }
    this._internalArray.push(internalComponent);
  }

  public onEntityPropsWillUpdate(oldProps: {}): void {
    this._internalArray.filter(component => component.isEnabled).forEach(component => {
      component.onEntityPropsWillUpdate(oldProps);
    });
  }

  public onEntityPropsUpdated(): void {
    this._internalArray.filter(component => component.isEnabled).forEach(component => {
      component.onEntityPropsUpdated();
    });
  }

  public unmountComponent(component: Component): void {
    const internalComponent: IInternalComponent = component as any; // tslint:disable-line:no-any

    const index: number = this._internalArray.indexOf(internalComponent);
    this._internalArray.splice(index, 1);
    internalComponent._internalUnmount();
  }

  public unmount(): void {
    this._internalArray.forEach(component => {
      component._internalUnmount();
    });
    this._internalArray.splice(0);
    this._entity = undefined;
    this._engine = undefined;
    this._scene = undefined;
    this._isMounted = false;
  }
}
