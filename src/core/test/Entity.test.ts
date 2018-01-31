/**
 * @copyright Microsoft Corporation. All rights reserved.
 */

import * as BABYLON from 'babylonjs';

import Entity from '../Entity';
import SceneEntity from '../common/SceneEntity';

describe('Entity class', () => {
  const engine: BABYLON.Engine = new BABYLON.NullEngine();
  const sceneEntity: SceneEntity = new SceneEntity();

  beforeEach(() => {
    sceneEntity.mount(engine);
  });

  afterEach(() => {
    sceneEntity.unmount();
  });

  describe('Mounting behavior', () => {
    it('should have a node if mounted', () => {
      const entity: Entity = new Entity();
      sceneEntity.mountChild(entity);
      expect(entity.node).toBeTruthy();
    });

    it('should not have a node if unmounted', () => {
      const entity: Entity = new Entity();
      sceneEntity.mountChild(entity);
      entity.unmount();
      expect(entity.node).toBeFalsy();
    });

    it('should dispose of a node if unmounted', () => {
      const entity: Entity = new Entity();
      sceneEntity.mountChild(entity);
      const node: BABYLON.Mesh = entity.node;
      entity.unmount();
      expect(node.isDisposed()).toBeTruthy();
    });

    it('should throw on unmount if not mounted', () => {
      const entity: Entity = new Entity();
      expect(entity.unmount).toThrow();
    });

    it('should have a custom node if onMount overriden', () => {
      const customNode: BABYLON.Mesh = new BABYLON.Mesh('CustomNode');
      const entity: Entity = new Entity();
      (<any>entity).onMount = () => { // tslint:disable-line:no-any
        return customNode;
      };
      sceneEntity.mountChild(entity);
      expect(entity.node).toBe(customNode);
    });
  });

  describe('Lifecycle', () => {
    class FakeEntity extends Entity {
      public didMountCalled: boolean;
      public getChildContextCalled: boolean;
      public willUpdateCalled: boolean;
      public onUpdatedCalled: boolean;
      public onChildrenUpdatedCalled: boolean;
      public parentUpdatedCalled: boolean;
      public willUnmountCalled: boolean;

      private _shouldUpdate: boolean;

      constructor(shouldNotUpdate?: boolean) {
        super();
        this._shouldUpdate = shouldNotUpdate;
      }

      protected didMount(): void {
        this.didMountCalled = true;
      }

      protected getChildContext(): {} {
        this.getChildContextCalled = true;
        return undefined;
      }

      protected willUpdate(newProps: {}): boolean {
        this.willUpdateCalled = true;
        return this._shouldUpdate;
      }

      protected onUpdated(oldProps: {}): void {
        this.onUpdatedCalled = true;
      }

      protected onChildrenUpdated(): void {
        this.onChildrenUpdatedCalled = true;
      }

      protected parentUpdated(isParentMounted: boolean): void {
        this.parentUpdatedCalled = true;
      }

      protected willUnmount(): void {
        this.willUnmountCalled = true;
      }
    }

    it('should call didMount', () => {
      const fakeEntity: FakeEntity = sceneEntity.mountChild(new FakeEntity());
      expect(fakeEntity.didMountCalled).toBeTruthy();
    });

    it('should call getChildContext', () => {
      const fakeEntity: FakeEntity = sceneEntity.mountChild(new FakeEntity());
      fakeEntity.mountChild(new FakeEntity());
      expect(fakeEntity.getChildContextCalled).toBeTruthy();
    });

    it('should call willUpdate', () => {
      const fakeEntity: FakeEntity = sceneEntity.mountChild(new FakeEntity());
      fakeEntity.updateProps({});
      expect(fakeEntity.willUpdateCalled).toBeTruthy();
    });

    it('should call onUpdated', () => {
      const fakeEntity: FakeEntity = sceneEntity.mountChild(new FakeEntity(true));
      fakeEntity.updateProps({});
      expect(fakeEntity.onUpdatedCalled).toBeTruthy();
    });

    it('should not call onUpdated', () => {
      const fakeEntity: FakeEntity = sceneEntity.mountChild(new FakeEntity());
      fakeEntity.updateProps({});
      expect(fakeEntity.onUpdatedCalled).toBeFalsy();
    });

    it('should call child/parent updated', () => {
      const fakeEntity: FakeEntity = sceneEntity.mountChild(new FakeEntity());
      const fakeChildEntity: FakeEntity = fakeEntity.mountChild(new FakeEntity());
      expect(fakeEntity.onChildrenUpdatedCalled).toBeTruthy();
      expect(fakeChildEntity.parentUpdatedCalled).toBeTruthy();
    });

    it('should call willUnmount', () => {
      const fakeEntity: FakeEntity = sceneEntity.mountChild(new FakeEntity());
      fakeEntity.unmount();
      expect(fakeEntity.willUnmountCalled).toBeTruthy();
    });
  });
});