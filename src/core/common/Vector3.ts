import * as BABYLON from 'babylonjs';

/**
 * Representation of 3D vectors and points.
 * @public
 */
export default class Vector3 extends BABYLON.Vector3 {
  public static uniform(num: number): Vector3 {
    return new Vector3(num, num, num);
  }
}
