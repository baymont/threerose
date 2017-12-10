import * as BABYLON from 'babylonjs';
import BBehavior from './BBehavior';
import IComponentProps from './common/IComponentProps';
import IComponentContext from './common/IComponentContext';

/**
 * b-frame component 
 */
export default abstract class BComponent<TProps extends IComponentProps, TState> {
    constructor(key: string, props: TProps) {
        this.key = key;
        this.props = props;
    }

    private _isMounted: boolean;
    private _node: BABYLON.Mesh;
    readonly children: BComponent<IComponentProps, {}>[] = [];
    parent?: BComponent<{}, {}>;
    readonly key: string;
    context: IComponentContext;
    childContext?: {};
    readonly props: TProps;
    state: TState;

    /**
     * Mounts the component with the returned Babylon.JS Node
     */
    protected abstract onMount(): BABYLON.Mesh;

    /**
     * Called after this instance and all of its childrens are mounted.
     */
    protected didMount(): void {
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
    protected willUpdate(newState: TState): boolean {
        return true;
    }

    /**
     * Called after state being updated.
     */
    protected update(): void {
    }

    /**
     * Called when a parent component was updated.
     */
    protected parentUpdated(isMounted: boolean): void {
    }

    /**
     * Called before unmounting.
     */
    protected willUnmount(): void {
    }

    /**
     * Unmount the component and it's children.
     */
    public unmount(): void {
        this.willUnmount();

        // Unmount all children first.
        this.children.forEach((child) => {
            child.unmount();
        });

        this._node.dispose();
        this._node = undefined;
        this._isMounted = false;
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

    public mountChild(child: BComponent<{}, {}>) {
        if (child._isMounted) {
            throw new Error("Child already mounted.");
        }

        this.children.push(child);
        child.parent = this;
        child.parentUpdated(this._isMounted);

        // Mount child
        if (this._isMounted) {
            child.childContext = this.getChildContext();
            child.mount(this.context);
        }
    }

    public mount(context: IComponentContext, parentNode?: BABYLON.Mesh){
        if (!this._isMounted) {
            this.context = context;
            this._node = this.onMount();
            this.updateCoreProps();
        }

        // Set to parent
        if (this.parent !== undefined) {
            this._node.parent = this.parent._node;
        } else if (parentNode !== undefined) {
            this._node.parent = parentNode;
        }

        // Mount children
        this.children.forEach((child) => {
            child.childContext = this.getChildContext();
            child.mount(this.context);
        });

        if (!this._isMounted) {
            this.didMount();
            this._isMounted = true;

            // Run behaviors after mounting
            if (this.props.behaviors !== undefined) {
                this.props.behaviors.forEach((behavior: BBehavior) => {
                    this.mountBehavior(behavior);
                });
            }
        }
    }

    public setState(state: TState) {
        if (this.willUpdate(state)) {
            this.state = Object.assign(this.state, state);

            // run behaviors
            if (this.props.behaviors !== undefined) {
                this.props.behaviors.forEach((behavior: BBehavior) => {
                    if (behavior.loaded) {
                        behavior.onComponentUpdated();
                    } else {
                        this.mountBehavior(behavior);
                    }
                });
            }

            // finally let the implemantation update itself
            this.update();
            this.notifyChildren();
        }
    }

    protected notifyChildren() {
        this.children.forEach((child) => {
            child.parentUpdated(this._isMounted);
            child.notifyChildren();
        });
    }
    
    private mountBehavior(behavior: BBehavior): void {
        behavior.context = { engine: this.context.engine, scene: this.context.scene, node: this._node };
        behavior.didMount();
        if (behavior.runOnRenderLoop) {
            this.context.scene.registerBeforeRender(behavior.tick.bind(behavior));
        }
    }

    private updateCoreProps(): void {
        if (this.props.position !== undefined) {
            this._node.position = new BABYLON.Vector3(this.props.position.x, this.props.position.y, this.props.position.z);
        }
        if (this.props.rotation !== undefined) {
            this._node.rotation = new BABYLON.Vector3(this.props.rotation.x, this.props.rotation.y, this.props.rotation.z);
        }
    }
}
  