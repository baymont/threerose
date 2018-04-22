import Component from '../core/Component';

/**
 * A hemispheric light.
 * @beta
 */
export default class HemisphericLight extends Component {
  protected didMount(): void {
    const light = new BABYLON.HemisphericLight(
      'skyLight',
      new BABYLON.Vector3(0, 1, 0),
      this.context.scene
    );

    this.addNode(light);
  }
}
