import * as BABYLON from 'babylonjs';
import BSystem from './BSystem';

export class Vector3 {
    constructor(x: number = 0, y: number = 0, z: number = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    x: number;
    y: number;
    z: number;
}

export interface IComponentContext {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
}

export interface IComponentProps {
    position?: Vector3;
    rotation?: Vector3;
    systems?: BSystem[];
}

/**
 * b-frame component 
 */
export default abstract class BComponent<TProps extends IComponentProps> {
    constructor( props: TProps, children?: BComponent<{}>[]) {
        this.props = props;
        this.children = children === undefined ? [] : children;
    }

    private _isMounted: boolean;
    private _node: BABYLON.Mesh;
    readonly children: BComponent<{}>[];
    parent?: BComponent<{}>;
    readonly key: string;
    context: IComponentContext;
    childContext?: {};
    props: TProps;

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
    protected willUpdate(newProps: TProps): boolean {
        return true;
    }

    /**
     * Called after props being updated.
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

    public mount(context: IComponentContext){
        if (!this._isMounted) {
            this.context = context;
            this._node = this.create();
            this.updateCoreProps();
        }

        // Set to parent
        if (this.parent !== undefined) {
            this._node.parent = this.parent._node;
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
            if (this.props.systems !== undefined) {
                this.props.systems.forEach((system: BSystem) => {
                    this.mountSystem(system);
                });
            }
        }
    }

    public updateProps(props: TProps) {
        if (this.willUpdate(props)) {
            this.props = Object.assign(this.props, props);

            // run systems
            if (this.props.systems !== undefined) {
                this.props.systems.forEach((system: BSystem) => {
                    if (system.loaded) {
                        system.onPropsUpdated();
                    } else {
                        this.mountSystem(system);
                    }
                });
            }

            // update core props after systems
            this.updateCoreProps();

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

    private updateCoreProps(): void {
        if (this.props.position !== undefined) {
            this._node.position = new BABYLON.Vector3(this.props.position.x, this.props.position.y, this.props.position.z);
        }
        if (this.props.rotation !== undefined) {
            this._node.rotation = new BABYLON.Vector3(this.props.rotation.x, this.props.rotation.y, this.props.rotation.z);
        }
    }
}
  