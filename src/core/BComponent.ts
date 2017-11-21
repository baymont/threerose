import * as BABYLON from 'babylonjs';

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
}

/**
 * b-frame component 
 */
export default abstract class BComponent<TProps extends IComponentProps> {
    constructor( props: TProps, children?: BComponent<any>[]) {
        this.props = props;
        this.children = children === undefined ? [] : children;
    }

    private _isMounted: boolean;
    private _node: BABYLON.TransformNode;
    readonly children: BComponent<any>[];
    parent?: BComponent<any>;
    readonly key: string;
    context: IComponentContext;
    childContext?: any;
    props: TProps;

    /**
     * Mounts the component with the returned Babylon.JS Node
     */
    protected abstract create(): BABYLON.TransformNode;

    /**
     * Called after this instance and all of its childrens are mounted.
     */
    protected didMount(): void {
    }

    /**
     * Additional context passed down to children.
     */
    protected getChildContext(): any {
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

    public addChild(child: BComponent<any>) {
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
        }
    }

    public updateProps(props: TProps) {
        if (this.willUpdate(props)) {
            this.props = Object.assign(this.props, props);

            this.updateCoreProps();
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
    
    private updateCoreProps(): void {
        if (this.props.position !== undefined) {
            this._node.position = new BABYLON.Vector3(this.props.position.x, this.props.position.y, this.props.position.z);
        }
        if (this.props.rotation !== undefined) {
            this._node.rotation = new BABYLON.Vector3(this.props.rotation.x, this.props.rotation.y, this.props.rotation.z);
        }
    }
}
  