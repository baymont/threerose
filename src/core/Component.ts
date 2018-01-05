import * as BABYLON from 'babylonjs';
import Component from './Behavior';
import IControlProps from './common/IComponentProps';
import IComponentContext from './common/IComponentContext';
import Vector3 from './common/Vector3';

/**
 * bframe entity
 */
export default class EntityBase<TProps extends IControlProps> {
    constructor(
        props?: TProps,
        key?: string,
        ref?: (entity: EntityBase<TProps>) => void
    ) {
        this._props = props || <TProps>{};
        this.key = key;
        this.ref = ref;
    }

    private _isMounted: boolean;
    private _node: BABYLON.Mesh;
    private _props: TProps;
    private _parent?: EntityBase<{}>;
    private _size: Vector3 = new Vector3();
    protected context: IComponentContext;
    childContext?: {};
    readonly children: EntityBase<IControlProps>[] = [];
    readonly key: string;
    readonly ref: (component: EntityBase<TProps>) => void;

    protected get isMounted(): boolean {
        return this._isMounted;
    }

    public get node(): BABYLON.Mesh {
        return this._node;
    }
    public get parent(): EntityBase<{}> {
        return this._parent;
    }
    public get props(): TProps {
        return this._props;
    }

    public get size(): Vector3 {
        return this._size;
    }

    /**
     * Mounts the component with the returned Babylon.JS Node
     */
    protected onMount(): BABYLON.Mesh {
        return new BABYLON.Mesh(this.key || "Entity", this.context.scene);
    }

    /**
     * Called after this instance and all of its childrens are mounted.
     */
    protected didMount(): void {}

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
    protected onUpdated(oldProps: TProps): void {}

    /**
     * Called on size changed.
     */
    protected onSizeChanged(): void {}

    /**
     * Called when child components gets added.
     */
    protected onChildrenUpdated(): void {}

    /**
     * Called when a parent component was updated.
     */
    protected parentUpdated(isParentMounted: boolean): void {}

    /**
     * Called before render.
     */
    protected tick(): void {}

    /**
     * Called before unmounting.
     */
    protected willUnmount(): void {}

    /**
     * Unmount the component and it's children.
     */
    public unmount(): void {
        this.willUnmount();

        // Unmount all children first.
        this.children.forEach(child => {
            child.unmount();
        });

        // unmount behaviors
        if (this.props.components) {
            this.props.components.forEach((behavior: Component) => {
                behavior.unmount();
            });
        }

        this.context.scene.unregisterBeforeRender(
            this._onBeforeRender.bind(this)
        );

        this._node.dispose();
        this._node = undefined;
        this._isMounted = false;

        this.parent.onChildrenUpdated();
    }

    /**
     * Unmounts and remounts the component and it's children.
     */
    public remount(): void {
        if (!this._isMounted) {
            return;
        }

        this.unmount();
        this._mount(this.context);
    }

    public mountChild(child: EntityBase<{}>) {
        if (child._isMounted) {
            throw new Error('Child already mounted.');
        }

        this.children.push(child);
        child._parent = this;
        child.parentUpdated(this._isMounted);

        // Mount child
        if (this._isMounted) {
            child.childContext = this.getChildContext();
            child._mount(this.context);
            this.onChildrenUpdated();
        }
    }

    private _mount(context: IComponentContext, parentNode?: BABYLON.Mesh): void {
        if (!this._isMounted) {
            this.context = context;
            this._node = this.onMount();
            this._updateCoreProps();
        }

        // Set to parent
        if (!this._node.parent) {
            if (parentNode) {
                this._node.parent = parentNode;
            } else if (this.parent) {
                this._node.parent = this.parent._node;
            }
        }

        // Mount children
        this.children.forEach(child => {
            child.childContext = this.getChildContext();
            child._mount(this.context);
        });

        if (!this._isMounted) {
            this.didMount();
            if (this.ref) {
                this.ref(this);
            }
            this.context.scene.registerBeforeRender(
                this._onBeforeRender.bind(this)
            );
            this._isMounted = true;

            // Run behaviors after mounting
            if (this.props.components) {
                this.props.components.forEach((behavior: Component) => {
                    this._mountBehavior(behavior);
                });
            }
        }
    }

    public updateProps(props: TProps) {
        if (this.willUpdate(props)) {
            const oldProps = this.props;
            this._props = Object.assign(this.props, props);

            // run behaviors
            if (this.props.components) {
                this.props.components.forEach((behavior: Component) => {
                    if (behavior.loaded) {
                        behavior.onComponentUpdated();
                    } else {
                        this._mountBehavior(behavior);
                    }
                });
            }

            // finally let the implemantation update itself
            this.onUpdated(oldProps);
            this.notifyChildren();
        }
    }

    protected notifyChildren() {
        this.children.forEach(child => {
            child.parentUpdated(this._isMounted);
            child.notifyChildren();
        });
    }

    private _mountBehavior(behavior: Component): void {
        behavior.context = {
            engine: this.context.engine,
            scene: this.context.scene,
            node: this._node
        };
        behavior.didMount();
    }

    private _onBeforeRender(): void {
        // go through behaviors
        if (this.props.components) {
            this.props.components.forEach(behavior => behavior.tick());
        }

        // tick the componenet
        this.tick();

        // update size
        try {
            const bounds = this._node.getHierarchyBoundingVectors(true);
            const newSize = bounds.max.subtract(bounds.min);

            if (
                this._size.x !== newSize.x ||
                this._size.y !== newSize.y ||
                this._size.z !== newSize.z
            ) {
                this._size = newSize;
                this.onSizeChanged();
            }
        } catch (err) {
            // Workaround for v3.1.0, TODO: https://github.com/BabylonJS/Babylon.js/issues/3406
        }

        // update pos props
        if (this.props.position) {
            this.props.position.x = this._node.position.x;
            this.props.position.y = this._node.position.y;
            this.props.position.z = this._node.position.z;
        }

        // update rot props
        if (this.props.rotation) {
            this.props.rotation.x = this._node.rotation.x;
            this.props.rotation.y = this._node.rotation.y;
            this.props.rotation.z = this._node.rotation.z;
        }

        // update rot props
        if (this.props.scaling) {
            this.props.scaling.x = this._node.scaling.x;
            this.props.scaling.y = this._node.scaling.y;
            this.props.scaling.z = this._node.scaling.z;
        }
    }

    private _updateCoreProps(): void {
        if (this.props.position) {
            this._node.position = new BABYLON.Vector3(
                this.props.position.x,
                this.props.position.y,
                this.props.position.z
            );
        }
        if (this.props.rotation) {
            this._node.rotation = new BABYLON.Vector3(
                this.props.rotation.x,
                this.props.rotation.y,
                this.props.rotation.z
            );
        }

        if (this.props.scaling) {
            this._node.scaling = new BABYLON.Vector3(
                this.props.scaling.x,
                this.props.scaling.y,
                this.props.scaling.z
            );
        }
    }
}


export class Entity extends EntityBase<IControlProps> { 
}
