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

const canvas: HTMLCanvasElement = document.getElementById(
    'canvas'
) as HTMLCanvasElement;
const engine: BABYLON.Engine = new BABYLON.Engine(canvas);

const simpleAnimation = new Animation('position.z', [
    { frame: 0, value: 0 },
    { frame: 50, value: 5 },
    { frame: 100, value: 0 }
])
    .speedRatio(0.5)
    .loop(true);

const anotherSimpleAnimation = new Animation(
    'position.x',
    Animation.threeFrame(-10, 3, -10)
)
.easingFunction(EasingFunction.circleEase())
.loop(true);

const bigger = new Animation(
    'scaling.y',
    Animation.threeFrame(1, 1.5, 1)
)
    .easingFunction(EasingFunction.circleEase())
    .loop(true);

var imageControl: ImageScreen;

var scene: Scene = (
    <Scene>
        <Camera />
        <HemisphericLight />
        <Ground>
            <StackContainer orientation={StackOrientation.Y}>
                <ImageScreen
                    ref={(image: ImageScreen) => {
                        imageControl = image;
                    }}
                    url="https://az835927.vo.msecnd.net/sites/mixed-reality/Resources/images/Hero-MixedReality-230px.jpg"
                />
                <Sphere diameter={2} segments={16} position={{ x: 0, y: 2, z: 0 }}>
                    <Sphere
                        diameter={1.5}
                        segments={16}
                        position={{ x: 2, y: 0, z: 0 }}
                    />
                </Sphere>
                <Sphere components={[bigger]} diameter={2} segments={16} position={new Vector3(2, 2)} />
                <Sphere diameter={2} segments={16} position={{ x: -2, y: 2, z: 0 }} />

                <Box
                    components={[simpleAnimation]}
                    size={3}
                    position={new Vector3(-5)}
                />
                <Box
                    components={[anotherSimpleAnimation, new Spinning(false)]}
                    size={3}
                    position={new Vector3(-10)}
                />
                <Box
                    components={[
                        simpleAnimation.clone().speedRatio(2),
                        anotherSimpleAnimation.clone().speedRatio(0.5),
                        new Spinning(false, 0.01)
                    ]}
                    size={3}
                    position={new Vector3(-15)}
                />
            </StackContainer>
        </Ground>
    </Scene>
) as Scene;

scene.mount(engine);

canvas.addEventListener('click', e => {
    // imageControl.updateProps({
    //     url:
    //         'http://thenerdstash.com/wp-content/uploads/2017/06/fallout-4-VR.jpg'
    // });

    var newSphere: Sphere = new Sphere('key_sphere', undefined, {
        diameter: 2,
        segments: 16,
        position: { x: 2, y: 0, z: 0 }
    });
    scene.mountChild(newSphere);
});
