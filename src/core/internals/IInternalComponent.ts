import { TransformNode } from 'babylonjs';

import Entity from '../Entity';
import System from '../System';

export default interface IInternalComponent {
  _system: System;
  isEnabled: boolean;
  _internalMount<TNode extends TransformNode>(entity: Entity<TNode>, system?: System): void;
  _internalUnmount(disposeMaterialAndTextures: boolean): void;
  onEntityPropsWillUpdate(oldProps: {}): void;
  onEntityPropsUpdated(): void;
}
