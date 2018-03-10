import * as BABYLON from 'babylonjs';
import Component from '../core/Component';

export default class OnHover extends Component {
  private _callback: (out: boolean) => void;
  private _overAction: BABYLON.ExecuteCodeAction;
  private _outAction: BABYLON.ExecuteCodeAction;

  constructor(callback: (out: boolean) => void) {
    super();
    this._callback = callback;
  }

  protected didMount() {
    if (!this.context.entity.node.actionManager) {
      this.context.entity.node.actionManager = new BABYLON.ActionManager(this.context.scene);
    }

    this._overAction = new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPointerOverTrigger,
      event => {
        if (this._callback) {
          this._callback(false);
        }
      }
    );
    this._outAction = new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPointerOutTrigger,
      event => {
        if (this._callback) {
          this._callback(true);
        }
      }
    );
    this.context.entity.node.actionManager.registerAction(this._overAction);
    this.context.entity.node.actionManager.registerAction(this._outAction);
  }

  protected willUnmount() {
    let index: number = this.context.entity.node.actionManager.actions.indexOf(this._overAction);
    this.context.entity.node.actionManager.actions.splice(index, 1);
    index = this.context.entity.node.actionManager.actions.indexOf(this._outAction);
    this.context.entity.node.actionManager.actions.splice(index, 1);
    this._callback = undefined;
  }
}
