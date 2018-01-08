import * as BABYLON from 'babylonjs';
import Component from '../core/Component';

export default class OnClick extends Component {
    private _wasPickable: boolean;
    private _callback:  () => void;
    private _action: BABYLON.ExecuteCodeAction;

    constructor(callback: () => void) {
        super();
        this._callback = callback;
    }

    public didMount() {
        if (!this.context.node.actionManager) {
            this.context.node.actionManager = new BABYLON.ActionManager(this.context.scene);
        }

        this._wasPickable = this.context.node.isPickable;
        this.context.node.isPickable = true;

        this._action = new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            event => {
                if (this._callback) {
                  this._callback();
                }
            },
          );
        this.context.node.actionManager.registerAction(this._action);
    }

    public unmount() {
        const index: number = this.context.node.actionManager.actions.indexOf(this._action);
        this.context.node.actionManager.actions.splice(index, 1);
        this._callback = undefined;
        this.context.node.isPickable = this._wasPickable;
    }
}
