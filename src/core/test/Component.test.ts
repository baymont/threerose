/**
 * @copyright Microsoft Corporation. All rights reserved.
 */

import * as BABYLON from 'babylonjs';

import Entity from '../Entity';
import Component from '../Component';
import SceneEntity from '../common/SceneEntity';

describe('Component class', () => {
  const engine: BABYLON.Engine = new BABYLON.NullEngine();
  const sceneEntity: SceneEntity = new SceneEntity();
  const emptyEntity: Entity = new Entity();

  class FakeComponent extends Component {
    public didMountCalled: boolean;
    public onEntityWillUpdateCalled: boolean;
    public onEntityUpdatedCalled: boolean;
    public unmountCalled: boolean;

    public didMount(): void {
      this.didMountCalled = true;
    }

    public onEntityWillUpdate(oldProps: {}, newProps: {}): void {
      this.onEntityWillUpdateCalled = true;
    }

    public onEntityUpdated(): void {
      this.onEntityUpdatedCalled = true;
    }

    public unmount(): void {
      this.unmountCalled = true;
    }
  }

  beforeEach(() => {
    sceneEntity.mountChild(emptyEntity);
    sceneEntity.mount(engine);
  });

  afterEach(() => {
    sceneEntity.unmount();
  });

  describe('Mounting behavior', () => {
    it('should have a valid context if mounted', () => {
      const fakeComponent: FakeComponent = emptyEntity.addComponent(new FakeComponent());
      expect(fakeComponent.context).toBeTruthy();
      expect(fakeComponent.context.node).toBeTruthy();
      expect(fakeComponent.context.engine).toBeTruthy();
      expect(fakeComponent.context.scene).toBeTruthy();
      expect(fakeComponent.context.entity).toBe(emptyEntity);
    });

    it('should be unmounted if removed', () => {
      const fakeComponent: FakeComponent = emptyEntity.addComponent(new FakeComponent());
      emptyEntity.removeComponent(fakeComponent);
      expect(fakeComponent.isMounted).toBeFalsy();
    });
  });

  describe('Lifecycle', () => {
    it('should call didMount', () => {
      const fakeComponent: FakeComponent = emptyEntity.addComponent(new FakeComponent());
      expect(fakeComponent.didMountCalled).toBeTruthy();
    });

    it('should call update', () => {
      const fakeComponent: FakeComponent = emptyEntity.addComponent(new FakeComponent());
      emptyEntity.updateProps({});
      expect(fakeComponent.onEntityWillUpdateCalled).toBeTruthy();
      expect(fakeComponent.onEntityUpdatedCalled).toBeTruthy();
    });

    it('should call unmount', () => {
      const fakeComponent: FakeComponent = emptyEntity.addComponent(new FakeComponent());
      emptyEntity.removeComponent(fakeComponent);
      expect(fakeComponent.unmountCalled).toBeTruthy();
    });
  });
});