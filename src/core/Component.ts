import * as BABYLON from 'babylonjs';
import Behavior from './Behavior';
import IControlProps from './common/IComponentProps';
import IComponentContext from './common/IComponentContext';
import Vector3 from './common/Vector3';

/**
 * bframe component
 */
export default abstract class Component<TProps extends IControlProps> {
    constructor(
        key: string,
        ref: (component: Component<TProps>) => void,
        props: TProps
    ) {
        this.key = key;
        this.ref = ref;
        this._props = props;
    }

    private _isMounted: boolean;
    private _node: BABYLON.Mesh;
    private _props: TProps;
    private _parent?: Component<{}>;
    private _size: Vector3 = new Vector3();
    protected context: IComponentContext;
    childContext?: {};
    readonly children: Component<IControlProps>[] = [];
    readonly key: string;
    readonly ref: (component: Component<TProps>) => void;

    protected get isMounted(): boolean {
        return this._isMounted;
    }

    public get node(): BABYLON.Mesh {
        return this._node;
    }
    public get parent(): Component<{}> {
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
    protected abstract onMount(): BABYLON.Mesh;

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
    protected abstract onUpdated(): void;

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
        if (this.props.behaviors !== undefined) {
            this.props.behaviors.forEach((behavior: Behavior) => {
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
        this.mount(this.context);
    }

    public mountChild(child: Component<{}>) {
        if (child._isMounted) {
            throw new Error('Child already mounted.');
        }

        this.children.push(child);
        child._parent = this;
        child.parentUpdated(this._isMounted);

        // Mount child
        if (this._isMounted) {
            child.childContext = this.getChildContext();
            child.mount(this.context);
            this.onChildrenUpdated();
        }
    }

    public mount(context: IComponentContext, parentNode?: BABYLON.Mesh) {
        if (!this._isMounted) {
            this.context = context;
            this._node = this.onMount();
            this._updateCoreProps();
        }

        // Set to parent
        if (this.parent !== undefined) {
            this._node.parent = this.parent._node;
        } else if (parentNode !== undefined) {
            this._node.parent = parentNode;
        }

        // Mount children
        this.children.forEach(child => {
            child.childContext = this.getChildContext();
            child.mount(this.context);
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
            if (this.props.behaviors !== undefined) {
                this.props.behaviors.forEach((behavior: Behavior) => {
                    this._mountBehavior(behavior);
                });
            }
        }
    }

    public updateProps(props: TProps) {
        if (this.willUpdate(props)) {
            this._props = Object.assign(this.props, props);

            // run behaviors
            if (this.props.behaviors !== undefined) {
                this.props.behaviors.forEach((behavior: Behavior) => {
                    if (behavior.loaded) {
                        behavior.onComponentUpdated();
                    } else {
                        this._mountBehavior(behavior);
                    }
                });
            }

            // finally let the implemantation update itself
            this.onUpdated();
            this.notifyChildren();
        }
    }

    protected notifyChildren() {
        this.children.forEach(child => {
            child.parentUpdated(this._isMounted);
            child.notifyChildren();
        });
    }

    private _mountBehavior(behavior: Behavior): void {
        behavior.context = {
            engine: this.context.engine,
            scene: this.context.scene,
            node: this._node
        };
        behavior.didMount();
    }

    private _onBeforeRender(): void {
        // go through behaviors
        if (this.props.behaviors !== undefined) {
            this.props.behaviors.forEach(behavior => behavior.tick());
        }

        // tick the componenet
        this.tick();

        // update size
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

        // update pos props
        if (this.props.position != undefined) {
            this.props.position.x = this._node.position.x;
            this.props.position.y = this._node.position.y;
            this.props.position.z = this._node.position.z;
        }

        // update rot props
        if (this.props.rotation !== undefined) {
            this.props.rotation.x = this._node.rotation.x;
            this.props.rotation.y = this._node.rotation.y;
            this.props.rotation.z = this._node.rotation.z;
        }
    }

    private _updateCoreProps(): void {
        if (this.props.position !== undefined) {
            this._node.position = new BABYLON.Vector3(
                this.props.position.x,
                this.props.position.y,
                this.props.position.z
            );
        }
        if (this.props.rotation !== undefined) {
            this._node.rotation = new BABYLON.Vector3(
                this.props.rotation.x,
                this.props.rotation.y,
                this.props.rotation.z
            );
        }
    }
}
