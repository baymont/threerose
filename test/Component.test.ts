import * as BABYLON from 'babylonjs';

import SceneEntity from '../src/core/common/SceneEntity';
import Component from '../src/core/Component';
import Entity from '../src/core/Entity';

describe('Component class', () => {
  const engine: BABYLON.Engine = new BABYLON.NullEngine();
  const sceneEntity: SceneEntity = new SceneEntity();
  const emptyEntity: Entity = new Entity();
  let scene: BABYLON.Scene;

  class FakeComponent extends Component {
    public didMountCalled: boolean;
    public willUpdateCalled: boolean;
    public onUpdatedCalled: boolean;
    public onEntityWillUpdateCalled: boolean;
    public onEntityUpdatedCalled: boolean;
    public willUnmountCalled: boolean;

    protected didMount(): void {
      this.didMountCalled = true;
    }

    protected willPropsUpdate(oldProps: {}): boolean {
      this.willUpdateCalled = true;
      return true;
    }

    protected onPropsUpdated(): void {
      this.onUpdatedCalled = true;
    }

    protected onEntityPropsWillUpdate(oldProps: {}): void {
      this.onEntityWillUpdateCalled = true;
    }

    protected onEntityPropsUpdated(): void {
      this.onEntityUpdatedCalled = true;
    }

    protected willUnmount(): void {
      this.willUnmountCalled = true;
    }
  }

  beforeEach(() => {
    scene = new BABYLON.Scene(engine);
    sceneEntity.mountChild(emptyEntity);
    sceneEntity.mount(engine, scene);
  });

  afterEach(() => {
    sceneEntity.unmount();
    scene.dispose();
    scene = undefined;
  });

  describe('Mounting behavior', () => {
    it('should have a valid context if mounted', () => {
      const fakeComponent: FakeComponent = emptyEntity.mountComponent(new FakeComponent());
      expect(fakeComponent.context).toBeTruthy();
      expect(fakeComponent.context.entity.node).toBeTruthy();
      expect(fakeComponent.context.engine).toBeTruthy();
      expect(fakeComponent.context.scene).toBeTruthy();
      expect(fakeComponent.context.entity).toBe(emptyEntity);
    });

    it('should be unmounted if removed', () => {
      const fakeComponent: FakeComponent = emptyEntity.mountComponent(new FakeComponent());
      emptyEntity.unmountComponent(fakeComponent);
      expect(fakeComponent.isMounted).toBeFalsy();
    });
  });

  describe('Lifecycle', () => {
    it('should call didMount', () => {
      const fakeComponent: FakeComponent = emptyEntity.mountComponent(new FakeComponent());
      expect(fakeComponent.didMountCalled).toBeTruthy();
    });

    it('should not call didMount', () => {
      const fakeComponent: FakeComponent = new FakeComponent();
      fakeComponent.disable();
      emptyEntity.mountComponent(fakeComponent);
      expect(fakeComponent.didMountCalled).toBeFalsy();
    });

    it('should call update', () => {
      const fakeComponent: FakeComponent = emptyEntity.mountComponent(new FakeComponent());
      fakeComponent.updateProps({});
      expect(fakeComponent.willUpdateCalled).toBeTruthy();
      expect(fakeComponent.onUpdatedCalled).toBeTruthy();
    });

    it('should not call update', () => {
      const fakeComponent: FakeComponent = new FakeComponent();
      fakeComponent.disable();
      emptyEntity.mountComponent(fakeComponent);
      emptyEntity.updateProps({});
      expect(fakeComponent.onEntityWillUpdateCalled).toBeFalsy();
      expect(fakeComponent.onEntityUpdatedCalled).toBeFalsy();
    });

    it('should call update if entity updated', () => {
      const fakeComponent: FakeComponent = emptyEntity.mountComponent(new FakeComponent());
      emptyEntity.updateProps({});
      expect(fakeComponent.onEntityWillUpdateCalled).toBeTruthy();
      expect(fakeComponent.onEntityUpdatedCalled).toBeTruthy();
    });

    it('should not call update if entity updated', () => {
      const fakeComponent: FakeComponent = new FakeComponent();
      fakeComponent.disable();
      emptyEntity.mountComponent(fakeComponent);
      fakeComponent.updateProps({});
      expect(fakeComponent.willUpdateCalled).toBeFalsy();
      expect(fakeComponent.onUpdatedCalled).toBeFalsy();
    });

    it('should call unmount', () => {
      const fakeComponent: FakeComponent = emptyEntity.mountComponent(new FakeComponent());
      emptyEntity.unmountComponent(fakeComponent);
      expect(fakeComponent.willUnmountCalled).toBeTruthy();
    });
  });
});
