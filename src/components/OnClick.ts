import * as BABYLON from 'babylonjs';
import Component from '../core/Component';

export default class OnClick extends Component {
  private _wasPickable: boolean;
  private _callback: () => void;
  private _action: BABYLON.ExecuteCodeAction;

  constructor(callback: () => void) {
    super();
    this._callback = callback;
  }

  protected didMount() {
    if (!this.context.entity.node.actionManager) {
      this.context.entity.node.actionManager = new BABYLON.ActionManager(this.context.scene);
    }

    this._wasPickable = this.context.entity.node.isPickable;
    this.context.entity.node.isPickable = true;

    this._action = new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger,
      event => {
        if (this._callback) {
          this._callback();
        }
      },
    );
    this.context.entity.node.actionManager.registerAction(this._action);
  }

  protected willUnmount() {
    const index: number = this.context.entity.node.actionManager.actions.indexOf(this._action);
    this.context.entity.node.actionManager.actions.splice(index, 1);
    this._callback = undefined;
    this.context.entity.node.isPickable = this._wasPickable;
  }
}
