import IEntityContext from './common/IEntityContext';
import Component, { IComponentContext } from './Component';
import Entity from './Entity';

export interface IInternalComponent {
  isEnabled: boolean;
  _internalMount(context: IComponentContext): void;
  _internalUnmount(): void;
  onEntityPropsWillUpdate(oldProps: {}): void;
  onEntityPropsUpdated(): void;
}

export default class InternalComponentCollection {
  private _isMounted: boolean;
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  private _entity: Entity;

  private _internalArray: IInternalComponent[] = [];

  public get array(): Component[] {
    return this._internalArray as any; // tslint:disable-line:no-any
  }

  public mount(entity: Entity, engine: BABYLON.Engine, scene: BABYLON.Scene): void {
    if (this._isMounted) {
      return;
    }

    this._entity = entity;
    this._engine = engine;
    this._scene = scene;

    this._internalArray.forEach(component => {
      const context: IComponentContext = {
        engine: this._engine,
        entity: this._entity,
        scene: this._scene
      };
      component._internalMount(context);
    });

    this._isMounted = true;
  }

  public mountComponent(component: Component): void {
    const internalComponent: IInternalComponent = component as any; // tslint:disable-line:no-any
    if (this._isMounted) {
      internalComponent._internalMount({
        engine: this._engine,
        entity: this._entity,
        scene: this._scene
      });
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
