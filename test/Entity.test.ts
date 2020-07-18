import { Engine, Scene, NullEngine, Mesh, TransformNode, AbstractMesh, Observer } from 'babylonjs';

import Entity, { MountingPoint } from '../src/core/Entity';

describe('Entity class', () => {
  const engine: Engine = new NullEngine();
  let scene: Scene;

  const fakeRenderLoop: () => void = () => {
    scene.onBeforeRenderObservable.notifyObservers(scene);
  };

  beforeEach(() => {
    scene = new Scene(engine);
    engine.runRenderLoop(fakeRenderLoop);
  });

  afterEach(() => {
    engine.stopRenderLoop(fakeRenderLoop);
    scene.dispose();
  });

  describe('Mounting behavior', () => {
    it('should have a node when constructed', () => {
      const entity: Entity = new Entity(scene);
      expect(entity.node).toBeTruthy();
    });

    it('should have a node with specified name', () => {
      const nodeName: string = 'HoneyGarlic';
      const entity: Entity = new Entity({ mountingPoint: scene, nodeName });
      expect(entity.node.name).toBe(nodeName);
    });

    it('should have a node with specified name when using parent', () => {
      const parent: Entity = new Entity(scene);
      const nodeName: string = 'HoneyGarlic';
      const entity: Entity = new Entity({ mountingPoint: parent, nodeName });
      expect(entity.node.name).toBe(nodeName);
    });

    it('should have the same mesh when constructed', () => {
      const mesh: AbstractMesh = new AbstractMesh('Test', scene);
      const entity: Entity<AbstractMesh> = new Entity(mesh);
      expect(entity.node).toBe(mesh);
    });

    it('should not have a node if disposed', () => {
      const entity: Entity = new Entity(scene);
      entity.dispose();
      expect(() => entity.node).toThrow();
    });

    it('should dispose Entity on dispose of mesh', () => {
      const entity: Entity = new Entity(scene);
      entity.node.dispose();
      expect(entity.isDisposed).toBeTruthy();
    });

    it('should call onDispose before dispose of mesh', done => {
      const entity: Entity = new Entity(scene);
      (entity as any).onDispose = () => { // tslint:disable-line:no-any
        // node shouldn't be dispose yet
        expect(entity.node.isDisposed()).toBeFalsy();
        done();
      };
      entity.node.dispose();
    });

    it('should dispose of a node when disposing', () => {
      const entity: Entity = new Entity(scene);
      const node: TransformNode = entity.node;
      entity.dispose();
      expect(node.isDisposed()).toBeTruthy();
    });

    it('should throw if node disposed', () => {
      const node: TransformNode = new TransformNode('dloraH', scene);
      node.dispose();
      expect(() =>  new Entity(node)).toThrow();
    });
  });

  describe('Lifecycle', () => {
    class FakeEntity extends Entity {
      public willUpdateCalled: boolean;
      public onBeforeRenderCalled: boolean;
      public onUpdatedCalled: boolean;
      public onDisposedCalled: boolean;

      private _shouldUpdate: boolean;

      constructor(mountingPoint: MountingPoint, shouldNotUpdate?: boolean) {
        super(mountingPoint);
        this._shouldUpdate = shouldNotUpdate || false;
      }

      protected willPropsUpdate(newProps: {}): boolean {
        this.willUpdateCalled = true;
        return this._shouldUpdate;
      }

      protected onPropsUpdated(oldProps: {}): void {
        this.onUpdatedCalled = true;
      }

      protected onBeforeRender(): void {
        this.onBeforeRenderCalled = true;
      }

      protected onDispose(): void {
        this.onDisposedCalled = true;
      }
    }

    it('should return same on Entity.for', () => {
      const fakeEntity: FakeEntity = new FakeEntity(scene);
      const forEntity: Entity = Entity.for(fakeEntity.node);
      expect(fakeEntity).toBe(forEntity);
    });

    it('should call willUpdate', () => {
      const fakeEntity: FakeEntity = new FakeEntity(scene);
      fakeEntity.updateProps({});
      expect(fakeEntity.willUpdateCalled).toBeTruthy();
    });

    it('should call onBeforeRender', done => {
      const fakeEntity: FakeEntity = new FakeEntity(scene);
      const observable: Observer<Scene> = scene.onBeforeRenderObservable.addOnce(() => {
        expect(fakeEntity.onBeforeRenderCalled).toBeTruthy();
        done();
      })!;
      setTimeout(() => {
        done.fail('render loop never called.');
      }, 500);
    });

    it('should call onUpdated', () => {
      const fakeEntity: FakeEntity = new FakeEntity(scene, true);
      fakeEntity.updateProps({});
      expect(fakeEntity.onUpdatedCalled).toBeTruthy();
    });

    it('should not call onUpdated', () => {
      const fakeEntity: FakeEntity = new FakeEntity(scene);
      fakeEntity.updateProps({});
      expect(fakeEntity.onUpdatedCalled).toBeFalsy();
    });

    it('should call onDispose', () => {
      const fakeEntity: FakeEntity = new FakeEntity(scene);
      fakeEntity.dispose();
      expect(fakeEntity.onDisposedCalled).toBeTruthy();
    });
  });

  describe('Misc', () => {
    it('should return new entity using Entity.for', () => {
      const mesh: Mesh = new Mesh('Mesh', scene);
      const newEntity: Entity<Mesh> = Entity.for(mesh);

      expect(newEntity).toBeTruthy();
      expect(newEntity.node).toBe(mesh);
    });

    it('should return same entity on second call to Entity.for', () => {
      const mesh: Mesh = new Mesh('Mesh', scene);
      const newEntity: Entity<Mesh> = Entity.for(mesh);
      const secondCall: Entity<Mesh> = Entity.for(mesh);

      expect(newEntity).toBe(secondCall);
    });

    it('should deep copy properties', () => {
      const props: any = { // tslint:disable-line:no-any
        test: {
          a: 1,
          b: {
            c: new Set<number>([1, 2, 3])
          }
        }
      };
      const entity: Entity = new Entity(scene, props);

      expect(entity.props).toEqual(props);
      props.test.a = 5;
      props.test.b.c.delete(1);
      expect(entity.props).not.toEqual(props);
    });
  });
});
