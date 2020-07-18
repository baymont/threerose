import { TransformNode, NullEngine, Engine, Scene } from 'babylonjs';

import SystemRegistrar from '../src/core/common/SystemRegistrar';
import System from '../src/core/System';
import INucleusContext from '../src/core/common/INucleusContext';
import Component from '../src/core/Component';
import Entity from '../src/core/Entity';

describe('Component class', () => {
  const engine: Engine = new NullEngine();
  let systemRegistrar: SystemRegistrar;
  let emptyEntity: Entity;
  let scene: Scene;

  class FakeComponent extends Component<{}, TransformNode, FakeSystem> {
  }

  // tslint:disable-next-line
  class FakeSystem extends System {
    public didMountCalled: boolean;
    public willUpdateCalled: boolean;
    public onUpdatedCalled: boolean;
    public onBeforeRenderCalled: boolean;

    constructor() {
      super(FakeComponent);
    }

    protected onInit(): void {
      this.didMountCalled = true;
    }

    protected willPropsUpdate(oldProps: {}): boolean {
      this.willUpdateCalled = true;
      return true;
    }

    protected onPropsUpdated(): void {
      this.onUpdatedCalled = true;
    }

    protected onBeforeRender(): void {
      this.onBeforeRenderCalled = true;
    }
  }

  beforeEach(() => {
    scene = new Scene(engine);
    systemRegistrar = SystemRegistrar.for(scene);
    emptyEntity = new Entity(scene);
  });

  afterEach(() => {
    scene.dispose();
  });

  describe('Lifecycle', () => {
    it('should have a valid context if registered', () => {
      const fakeSystem: FakeSystem = systemRegistrar.registerSystem(new FakeSystem());
      const context: INucleusContext = (fakeSystem as any).context; // tslint:disable-line:no-any
      expect(context).toBeTruthy();
      expect(context.engine).toBeTruthy();
      expect(context.scene).toBeTruthy();
    });

    it('should be present in related component', () => {
      const fakeSystem: FakeSystem = systemRegistrar.registerSystem(new FakeSystem());
      const fakeComponent: FakeComponent = new FakeComponent().mountTo(emptyEntity);
      expect(fakeComponent.system).toBe(fakeSystem);
    });

    it('should call update', () => {
      const fakeSystem: FakeSystem = systemRegistrar.registerSystem(new FakeSystem());
      fakeSystem.updateProps({});
      expect(fakeSystem.willUpdateCalled).toBeTruthy();
      expect(fakeSystem.onUpdatedCalled).toBeTruthy();
    });
  });
});
