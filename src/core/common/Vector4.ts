import * as BABYLON from 'babylonjs';

/**
 * Representation of 4D vectors and points.
 * @public
 */
export default class Vector4 extends BABYLON.Vector4 {
  public static uniform(num: number): Vector4 {
    return new Vector4(num, num, num, num);
  }
}
