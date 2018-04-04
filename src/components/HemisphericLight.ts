import Component from '../core/Component';

/**
 * nucleus3d hemispheric light
 */
export default class HemisphericLight extends Component {
  protected didMount(): void {
    const light = new BABYLON.HemisphericLight(
      'skyLight',
      new BABYLON.Vector3(0, 1, 0),
      this.context.scene
    );

    this.setParent(light);
  }
}
