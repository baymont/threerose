import { Vector3, HemisphericLight as BHemisphericLight } from 'babylonjs';
import Component from '../core/Component';

/**
 * A hemispheric light.
 * @beta
 */
export default class HemisphericLight extends Component {
  protected didMount(): void {
    const light = new BHemisphericLight(
      'skyLight',
      new Vector3(0, 1, 0),
      this.context.scene
    );

    this.addNode(light);
  }
}
