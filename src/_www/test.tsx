import { React } from '../core/rsx';
import * as BABYLON from 'babylonjs';
import Scene from '../core/common/Scene';
import Camera from '../entities/common/Camera';
import HemisphericLight from '../entities/common/HemisphericLight';
import Ground from '../entities/common/Ground';
import Entity from '../core/Entity';
import Vector3 from '../core/common/Vector3';
import ModelLoader from '../components/ModelLoader';
import StackContainer from '../entities/StackContainer';
import { StackOrientation } from '../entities/StackContainer';
import Sphere from '../primitives/Sphere';
import ImageViewer from '../entities/ImageViewer';
import Animation from '../components/Animation';
import EasingFunction from '../components/common/EasingFunction';
import Box from '../primitives/Box';
import Spinning from '../components/Spinning';
import OnClick from '../components/OnClick';
import OnHover from '../components/OnHover';

const canvas: HTMLCanvasElement = document.getElementById(
    'canvas'
) as HTMLCanvasElement;
const engine: BABYLON.Engine = new BABYLON.Engine(canvas);

var scene: Scene = (
    <Scene>
        <Camera />
        <HemisphericLight />
        <Ground>
            <Entity
                scaling={new Vector3(100, 100, 100)}
                position={new Vector3(0, 3, -5)}
                components={[
                    new ModelLoader(
                        'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF/BoomBox.gltf'
                    ),
                    new OnClick(() => {
                        alert('Clicked!');
                    })
                ]}
            />
            <StackContainer orientation={StackOrientation.Y}>
                <ImageViewer url="https://az835927.vo.msecnd.net/sites/mixed-reality/Resources/images/Hero-MixedReality-230px.jpg" />
                <Sphere
                    components={[
                        new Animation(
                            'scaling.y',
                            Animation.threeFrame(1, 1.5, 1)
                        )
                            .easingFunction(EasingFunction.circleEase())
                            .loop(true)
                    ]}
                    diameter={2}
                    segments={16}
                />
                <Box
                    components={[
                        new Animation(
                            'position.x',
                            Animation.threeFrame(0, -1, 0)
                        )
                            .loop(true)
                            .speedRatio(0.5),
                        new Spinning(false),
                        new OnHover((out: boolean) => {
                            alert(out ? 'Out!' : 'Hover!');
                        })
                    ]}
                    size={1}
                />
                <Sphere
                    components={[
                        new Animation('position.z', [
                            { frame: 0, value: 0 },
                            { frame: 50, value: 5 },
                            { frame: 100, value: 0 }
                        ]).loop(true),
                        new Spinning(false)
                    ]}
                />
            </StackContainer>
        </Ground>
    </Scene>
) as Scene;

scene.mount(engine);
