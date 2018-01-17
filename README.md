# nucleus3d (alpha)

A 3d framework for web devs. Powered by Babylon.JS. TypeScript first. Entity-Component architecture.

## Set Up

`npm install nucleus3d`

## Quick start

class Sphere extends Entity {
   protected onMount(): BABYLON.Mesh {
    return BABYLON.MeshBuilder.CreateSphere(
      this.key,
      this.props,
      this.context.scene
    );
  }
}

const sceneEntity = new SceneEntity();

sceneEntity.mountChild(new Sphere());

sceneEntity.mount(new BABYLON.Engine());