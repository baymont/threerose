import { TransformNode } from 'babylonjs';

import SystemRegistrar from './common/SystemRegistrar';
import Component from './Component';
import Entity from './Entity';
import IInternalComponent from './internals/IInternalComponent';

export default class InternalComponentCollection<TNode extends TransformNode> {
  private _isMounted: boolean;
  private _entity?: Entity<TNode>;
  private _systemRegistrar?: SystemRegistrar;

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

  public mount(entity: Entity<TNode>, systemRegistrar: SystemRegistrar): void {
    if (this._isMounted) {
      return;
    }

    this._entity = entity;
    this._systemRegistrar = systemRegistrar as any; // tslint:disable-line:no-any

    this._isMounted = true;

    // Loop through array in cases where a component, mounted before the entity was mounted, mounts another component.
    (this.array as any as IInternalComponent[]).forEach(component => { // tslint:disable-line:no-any
      component._internalMount(
        entity,
        systemRegistrar.getSystem(component.constructor as new() => Component)
      );
    });
  }

  public mountComponent(component: Component): void {
    const internalComponent: IInternalComponent = component as any; // tslint:disable-line:no-any
    this._internalMap.set(component.constructor, internalComponent);
    if (this._isMounted) {
      internalComponent._internalMount(
        this._entity!,
        this._systemRegistrar!.getSystem(component.constructor as new() => Component)
      );
    }
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
      this._internalMap.delete(component.constructor);
    });
    this._entity = undefined;
    this._isMounted = false;
  }
}
