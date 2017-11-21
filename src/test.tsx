import * as React from './core/bsx';
import BComponent, { IComponentContext, IComponentProps, Vector3 } from './core/BComponent';
import * as BABYLON from 'babylonjs';
import Sphere from './primitives/Sphere';
import Box from './primitives/Box';


const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const engine: BABYLON.Engine = new BABYLON.Engine(canvas);
const scene: BABYLON.Scene = new BABYLON.Scene(engine);

// Create a camera, and set its position to slightly behind our meshes
const camera = new BABYLON.FreeCamera('freeCamera', new BABYLON.Vector3(0, 5,-10), scene);

// Make our camera look at the middle of the scene, where we have placed our items
camera.setTarget(BABYLON.Vector3.Zero());

// Attach the camera to the canvas, this allows us to give input to the camera
camera.attachControl(canvas, false);

// Create lightning in our scene
const light = new BABYLON.HemisphericLight('skyLight', new BABYLON.Vector3(0,1,0), scene);

// Make a plane on the ground
const ground = BABYLON.MeshBuilder.CreateGround('groundPlane',{width: 6, height: 6, subdivisions: 2}, scene);
ground.position.y = -1;


engine.runRenderLoop(() => {
  scene.render();
});

var rootSphere: JSX.Element = 
<Sphere diameter={2} segments={16}>
  <Sphere diameter={2} segments={16} position={{x: 0, y: 2, z:0}}>
    <Sphere diameter={2} segments={16} position={{x: 0, y: 2, z: 0}} />
  </Sphere>
  <Sphere diameter={2} segments={16} position={new Vector3(2, 2)}>
    <Sphere diameter={2} segments={16} position={new Vector3(0, 2, 0)} />
  </Sphere>
  <Sphere diameter={2} segments={16} position={{x: -2, y: 2, z: 0}} />
  <Box size={4} position={new Vector3(-4)} />
</Sphere>;

rootSphere.mount({engine: engine, scene: scene});

canvas.addEventListener('click', (e) => {
  var newSphere: Sphere = new Sphere({diameter:2, segments: 16, position: {x: 2, y: 0, z: 0}});
  rootSphere.addChild(newSphere);
  rootSphere = newSphere;
});