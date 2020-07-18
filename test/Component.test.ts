import { Engine, Scene, NullEngine, TransformNode } from 'babylonjs';

import INucleusContext from '../src/core/common/INucleusContext';
import Component from '../src/core/Component';
import Entity from '../src/core/Entity';

describe('Component class', () => {
  const engine: Engine = new NullEngine();
  let emptyEntity: Entity;
  let scene: Scene;

  class FakeComponent<TNode extends TransformNode = TransformNode> extends Component<{}, TNode> {
    public didMountCalled: boolean;
    public willUpdateCalled: boolean;
    public onUpdatedCalled: boolean;
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

    protected willUnmount(): void {
      this.willUnmountCalled = true;
    }
  }

  beforeEach(() => {
    scene = new Scene(engine);
    emptyEntity = new Entity(scene);
  });

  afterEach(() => {
    scene.dispose();
  });

  describe('Mounting behavior', () => {
    it('should have a valid context if mounted', () => {
      const fakeComponent: FakeComponent = new FakeComponent().mountTo(emptyEntity);
      const context: INucleusContext = fakeComponent.context;
      expect(context).toBeTruthy();
      expect(context.engine).toBeTruthy();
      expect(context.scene).toBeTruthy();
      expect(fakeComponent.entity.node).toBeTruthy();
      expect(fakeComponent.entity).toBe(emptyEntity);
    });

    it('should be unmounted if removed', () => {
      const fakeComponent: FakeComponent = new FakeComponent().mountTo(emptyEntity);
      fakeComponent.unmount();
      expect(fakeComponent.isMounted).toBeFalsy();
    });
  });

  describe('Lifecycle', () => {
    it('should call didMount', () => {
      const fakeComponent: FakeComponent = new FakeComponent().mountTo(emptyEntity);
      expect(fakeComponent.didMountCalled).toBeTruthy();
    });

    it('should call update', () => {
      const fakeComponent: FakeComponent = new FakeComponent().mountTo(emptyEntity);
      fakeComponent.updateProps({});
      expect(fakeComponent.willUpdateCalled).toBeTruthy();
      expect(fakeComponent.onUpdatedCalled).toBeTruthy();
    });

    it('should not call update if entity updated', () => {
      const fakeComponent: FakeComponent = new FakeComponent();
      fakeComponent.disable();
      fakeComponent.mountTo(emptyEntity);
      fakeComponent.updateProps({});
      expect(fakeComponent.willUpdateCalled).toBeFalsy();
      expect(fakeComponent.onUpdatedCalled).toBeFalsy();
    });

    it('should call unmount', () => {
      const fakeComponent: FakeComponent = new FakeComponent().mountTo(emptyEntity);
      fakeComponent.unmount();
      expect(fakeComponent.willUnmountCalled).toBeTruthy();
    });
  });

  describe('Misc', () => {
    it('should retrive component by type', () => {
      const fakeComponent: FakeComponent = new FakeComponent().mountTo(emptyEntity);

      expect(emptyEntity.hasComponent(FakeComponent)).toBeTruthy();
      expect(emptyEntity.getComponent(FakeComponent)).toBe(fakeComponent);
    });

    it('should throw if component type already mounted', () => {
      new FakeComponent().mountTo(emptyEntity);
      expect(() => new FakeComponent({x: 3}).mountTo(emptyEntity)).toThrow();
    });
  });
});
