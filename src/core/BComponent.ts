import * as BABYLON from 'babylonjs';
import BSystem from './BSystem';
import IComponentState from './common/IComponentState';
import IComponentContext from './common/IComponentContext';

/**
 * b-frame component 
 */
export default abstract class BComponent<TState extends IComponentState> {
    constructor(state: TState, children?: BComponent<{}>[]) {
        this.state = state;
        this.children = children === undefined ? [] : children;
    }

    private _isMounted: boolean;
    private _node: BABYLON.Mesh;
    readonly children: BComponent<{}>[];
    parent?: BComponent<{}>;
    readonly key: string;
    context: IComponentContext;
    childContext?: {};
    state: TState;

    /**
     * Mounts the component with the returned Babylon.JS Node
     */
    protected abstract create(): BABYLON.Mesh;

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

    public addChild(child: BComponent<{}>) {
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
            this._node = this.create();
            this.updateCoreState();
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

            // Run systems after mounting
            if (this.state.systems !== undefined) {
                this.state.systems.forEach((system: BSystem) => {
                    this.mountSystem(system);
                });
            }
        }
    }

    public setState(state: TState) {
        if (this.willUpdate(state)) {
            this.state = Object.assign(this.state, state);

            // run systems
            if (this.state.systems !== undefined) {
                this.state.systems.forEach((system: BSystem) => {
                    if (system.loaded) {
                        system.onStateChanged();
                    } else {
                        this.mountSystem(system);
                    }
                });
            }

            // update core props from state after systems
            this.updateCoreState();

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
    
    private mountSystem(system: BSystem): void {
        system.context = { engine: this.context.engine, scene: this.context.scene, node: this._node };
        system.didMount();
        if (system.runOnRenderLoop) {
            this.context.scene.registerBeforeRender(system.tick.bind(system));
        }
    }

    private updateCoreState(): void {
        if (this.state.position !== undefined) {
            this._node.position = new BABYLON.Vector3(this.state.position.x, this.state.position.y, this.state.position.z);
        }
        if (this.state.rotation !== undefined) {
            this._node.rotation = new BABYLON.Vector3(this.state.rotation.x, this.state.rotation.y, this.state.rotation.z);
        }
    }
}
  