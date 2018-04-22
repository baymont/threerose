import * as BABYLON from 'babylonjs';

/**
 * Representation of 2D vectors and points.
 * @public
 */
export default class Vector2 extends BABYLON.Vector2 {
  public static uniform(num: number): Vector2 {
    return new Vector2(num, num);
  }
}
