import * as BABYLON from 'babylonjs';

import Component from './Component';
import IEntityContext from './common/IEntityContext';

/**
 * nucleus entity
 *
 * @alpha
 */
export default class Entity<TProps = {}, TParentContext = {}> {
  public readonly children: Entity[] = [];
  public readonly key: string;

  protected context: IEntityContext;
  protected parentContext?: TParentContext;
  protected readonly components: Component[] = [];

  private _onBeforeRenderObservable: BABYLON.Observer<BABYLON.Scene>;
  private _isMounted: boolean;
  private _node: BABYLON.Mesh;
  private _props: TProps;
  private _parent?: Entity<{}>;

  constructor(
      props?: TProps,
      key?: string
  ) {
      this._props = Object.assign({}, props) || <TProps>{};
      this.key = key;
  }

  public get node(): BABYLON.Mesh {
    return this._node;
  }

  public get parent(): Entity<{}> {
      return this._parent;
  }

  public get props(): TProps {
      return this._props;
  }

  protected get isMounted(): boolean {
      return this._isMounted;
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
    if (this.components) {
        this.components.forEach((component: Component) => {
          this.removeComponent(component);
        });
    }

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
   * Unmounts and remounts the component and it's children.
   */
  public remount(): void {
    if (!this._isMounted) {
        console.log('Not mounted.');
        return;
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
        child.parentContext = this.getChildContext();
        child._mount(this.context);
    }

    return child;
  }

  public addComponent<T extends Component>(component: T): T {
    this.addComponents([component]);
    return component;
  }

  public addComponents(components: Component[]): void {
    components.forEach((component) => {
        if (this.components.indexOf(component) === -1) {
            this.components.push(component);
            if (this._isMounted) {
                this._mountComponent(component);
            }
        } else {
          throw new Error('An instance of this component already exists.');
        }
    });
  }

  public removeComponent(component: Component): Entity {
    const index: number = this.components.indexOf(component);
    this.components.splice(index, 1);
    component.unmount();
    component.isMounted = false;
    return this;
  }

  /**
   * Update properties
   * @param props The new properties
   */
  public updateProps(props: TProps): void {
    if (!this._isMounted || this.willUpdate(props)) {
      const oldProps: TProps = Object.assign({}, this.props);
      this._props = Object.assign(this.props, props);

      if (this._isMounted) {
        if (this.components) {
          this.components.forEach((component: Component) => {
            component.onEntityWillUpdate(oldProps, this.props);
          });
        }

        // finally let the implemantation update itself
        this.onUpdated(oldProps);

        if (this.components) {
          this.components.forEach((component: Component) => {
            component.onEntityUpdated();
          });
        }
        this._notifyChildren();
      }
    }
  }

  /**
   * Mounts the entity with the returned Babylon.JS Node
   */
  protected onMount(): BABYLON.Mesh {
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
  protected willUpdate(newProps: TProps): boolean {
    return true;
  }

  /**
   * Called after props updated.
   */
  protected onUpdated(oldProps: TProps): void {
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
  protected tick(): void {
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
      child.parentContext = this.getChildContext();
      child.parentUpdated(this._isMounted);
    });
  }

  private _mount(context: IEntityContext, parentNode?: BABYLON.Mesh): void {
    if (this._isMounted) {
      throw new Error('Entity already mounted');
    }

    this.context = context;
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
        child.parentContext = this.getChildContext();
        child._mount(this.context);
    });

    // Mount components
    if (this.components) {
      this.components.forEach((component: Component) => {
          this._mountComponent(component);
      });
    }

    this.didMount();
    this._onBeforeRenderObservable = this.context.scene.onBeforeRenderObservable.add(this._onBeforeRender.bind(this));
  }

  private _mountComponent(component: Component): void {
    component.context = {
      engine: this.context.engine,
      scene: this.context.scene,
      node: this._node,
      entity: this
    };
    component.didMount();
    component.isMounted = true;
  }

  private _onBeforeRender(): void {
    // go through components
    if (this.components) {
        this.components.forEach(component => component.tick());
    }

    // tick the componenet
    this.tick();
  }
}