import { React } from '../core/rsx';
import * as BABYLON from 'babylonjs';
import Sphere from '../primitives/Sphere';
import Box from '../primitives/Box';
import StackContainer, { StackOrientation } from '../entities/StackContainer';
import ImageScreen, { IImageProps } from '../entities/ImageScreen';
import Vector3 from '../core/common/Vector3';
import Animation from '../components/AnimationBehavior';
import EasingFunction from '../components/common/EasingFunction';
import IComponentProps from '../core/common/IComponentProps';
import Spinning from '../components/SpinningBehavior';
import Scene from '../core/common/Scene';
import Camera from '../core/common/Camera';
import HemisphericLight from '../core/common/HemisphericLight';
import Ground from '../core/common/Ground';
import { Entity } from '../core/Component';
import ModelLoader from '../components/ModelLoader';

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
                    )
                ]}
            />
            <StackContainer orientation={StackOrientation.Y}>
                <ImageScreen url="https://az835927.vo.msecnd.net/sites/mixed-reality/Resources/images/Hero-MixedReality-230px.jpg" />
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
                        new Spinning(false)
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
engine.scenes[0].debugLayer.show();
