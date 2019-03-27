import { Engine, Scene } from 'babylonjs';

import SystemRegistrar from './SystemRegistrar';

/**
 * The Nucleus context.
 * @public
 */
export default interface INucleusContext {
  /**
   * The engine
   */
  readonly engine: Engine;
  /**
   * The scene
   */
  readonly scene: Scene;
  /**
   * The system registrar.
   */
  readonly systemRegistrar: SystemRegistrar;
}
