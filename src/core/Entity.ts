import * as BABYLON from 'babylonjs';
import cloneDeep = require('lodash/cloneDeep');

import IEntityContext from './common/IEntityContext';
import Component from './Component';
import InternalComponentCollection from './InternalComponentCollection';

/**
 * nucleus entity
 *
 * @alpha
 */
export default class Entity<TProps = {}, TParentContext = {}> {
  private readonly _children: Entity[] = [];
  private readonly _components: InternalComponentCollection = new InternalComponentCollection();
  private readonly _key: string;

  private _context: IEntityContext;
  private _parentContext?: TParentContext;

  private _onBeforeRenderObservable: BABYLON.Observer<BABYLON.Scene>;
  private _isMounted: boolean;
  private _node: BABYLON.AbstractMesh;
  private _props: TProps;
  private _parent?: Entity<{}>;

  public get children(): Entity[] {
    return this._children;
  }

  public get components(): Component[] {
    return this._components.array;
  }

  public get key(): string {
    return this._key;
  }

  public get node(): BABYLON.AbstractMesh {
    return this._node;
  }

  public get parent(): Entity<{}> {
    return this._parent;
  }

  public get props(): TProps {
    return this._props;
  }

  protected get context(): IEntityContext {
    return this._context;
  }

  protected get parentContext(): TParentContext {
    return this._parentContext;
  }

  protected get isMounted(): boolean {
    return this._isMounted;
  }

  constructor(
    props?: TProps,
    key?: string
  ) {
    this._props = cloneDeep(props) || {} as TProps;
    this._key = key;

    this._onBeforeRender = this._onBeforeRender.bind(this);
  }

  /**
   * Unmount the entity and it's children.
   */
  public unmount(): void {
    if (!this._isMounted) {
      throw new Error('Entity not mounted');
    }

    this.willUnmount();

    // Unmount all children first.
    this.children.forEach((child: Entity) => {
      if (child.isMounted) {
        child.unmount();
      }
    });

    // unmount components
    this._components.unmount();

    this.context.scene.onBeforeRenderObservable.remove(this._onBeforeRenderObservable);
    this._onBeforeRenderObservable = undefined;

    this._node.dispose();
    this._node = undefined;
    this._isMounted = false;

    if (this.parent) {
      const index: number = this.parent.children.indexOf(this);
      this.parent.children.splice(index, 1);
    }
  }

  /**
   * Unmounts and remounts the entity and it's children.
   */
  public remount(): void {
    if (!this._isMounted) {
      throw new Error('Not mounted.');
    }

    this.unmount();
    this._mount(this.context);
  }

  public mountChild<T extends Entity>(child: T): T {
    if (child._isMounted) {
      throw new Error('Child already mounted.');
    }

    this.children.push(child);
    child._parent = this;
    child.parentUpdated(this._isMounted);

    // Mount child
    if (this._isMounted) {
      child._parentContext = this.getChildContext();
      child._mount(this.context);
    }

    return child;
  }

  public mountComponent<T extends Component>(component: T): T {
    this.mountComponents([component]);
    return component;
  }

  public mountComponents(components: Component[]): void {
    components.forEach(component => {
      if (this.components.indexOf(component) === -1) {
        this._components.mountComponent(component);
      } else {
        throw new Error('An instance of this component is already mounted.');
      }
    });
  }

  public unmountComponent<T extends Component>(component: T): void {
    const index: number = this.components.indexOf(component);
    if (index < 0) {
      throw new Error('This component is not mounted to this entity.');
    }
    this._components.unmountComponent(component);
  }

  /**
   * Update properties
   * @param props The new properties
   */
  public updateProps(props: TProps): void {
    if (!this._isMounted || this.willPropsUpdate(props)) {
      const oldProps: TProps = cloneDeep(this.props);
      this._props = Object.assign(cloneDeep(props), this.props);

      if (this._isMounted) {
        this._components.onEntityPropsWillUpdate(oldProps);

        // finally let the implemantation update itself
        this.onPropsUpdated(oldProps);

        if (this.components) {
          this._components.onEntityPropsUpdated();
        }
        this._notifyChildren();
      }
    }
  }

  /**
   * Mounts the entity with the returned Babylon.JS Node
   */
  protected onMount(): BABYLON.AbstractMesh {
    return new BABYLON.Mesh(this.key || 'Entity', this.context.scene);
  }

  /**
   * Called after this instance and all of its childrens are mounted.
   */
  protected didMount(): void {
    // EMPTY BLOCK
  }

  /**
   * Additional context passed down to children.
   */
  protected getChildContext(): {} {
    return undefined;
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
   * Called when a parent entity was updated.
   */
  protected parentUpdated(isParentMounted: boolean): void {
    // EMPTY BLOCK
  }

  /**
   * Called before render.
   */
  protected onUpdate(): void {
    // EMPTY BLOCK
  }

  /**
   * Called before unmounting.
   */
  protected willUnmount(): void {
    // EMPTY BLOCK
  }

  private _notifyChildren(): void {
    this.children.forEach(child => {
      child._parentContext = this.getChildContext();
      child.parentUpdated(this._isMounted);
    });
  }

  private _mount(context: IEntityContext, parentNode?: BABYLON.Mesh): void {
    if (this._isMounted) {
      throw new Error('Entity already mounted');
    }

    this._context = context;
    this._node = this.onMount();

    // Set to parent
    if (!this._node.parent) {
      if (parentNode) {
        this._node.parent = parentNode;
      } else if (this.parent) {
        this._node.parent = this.parent._node;
      }
    }

    this._isMounted = true;

    // Mount children
    this.children.forEach(child => {
      child._parentContext = this.getChildContext();
      child._mount(this.context);
    });

    // Mount components
    this._components.mount(this, this.context.engine, this.context.scene);

    this.didMount();
    this._onBeforeRenderObservable = this.context.scene.onBeforeRenderObservable.add(this._onBeforeRender);
  }

  private _onBeforeRender(): void {
    if (this.components) {
      this.components.filter(component => component.isEnabled)
        .forEach(component => {
          this._tryExecute((component as any).onUpdate.bind(component)); // tslint:disable-line:no-any
        });
    }

    this._tryExecute(this.onUpdate.bind(this));
  }

  private _tryExecute(func: () => void): void {
    try {
      func();
    } catch (e) {
      console.log(e); // tslint:disable-line no-console
    }
  }
}
