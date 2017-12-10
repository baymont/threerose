import BBehavior from '../core/BBehavior';
import EasingFunction from './common/EasingFunction';

export class AnimationKey<T> {
    frame: number;
    value: T;
}

export default class AnimationBehavior extends BBehavior {
    runOnRenderLoop: boolean = false;

    private _name: string;
    private _targetPath: string;
    private _dataType: number;
    private _frames: AnimationKey<any>[];
    private _from: number;
    private _to: number;
    private _loop: boolean;
    private _speedRatio: number;
    private _easingFunction: BABYLON.EasingFunction;

    /**
     * Animation behavior for numbers
     */
    constructor(targetPath: string, frames: AnimationKey<number>[], from: number = 0, to: number = 100) {
        super();
        this._targetPath = targetPath;
        this._dataType = BABYLON.Animation.ANIMATIONTYPE_FLOAT;
        this._frames = frames;
        this._from = from;
        this._to = to;
    }

    public didMount(): void {
        var animation = new BABYLON.Animation(this._name, this._targetPath, 30, this._dataType,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        
        if (this._easingFunction !== undefined) {
            // For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
            this._easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        
            // Adding easing function to my animation
            animation.setEasingFunction(this._easingFunction);
        }
        
        animation.setKeys(this._frames);

        this.context.node.animations.push(animation);
        
        this.context.scene.beginAnimation(this.context.node, this._from, this._to, this._loop, this._speedRatio);
    }

    public easingFunction(value: EasingFunction): AnimationBehavior {
        this._easingFunction = value;
        return this;
    }

    public loop(value: boolean): AnimationBehavior {
        this._loop = value;
        return this;
    }

    public speedRatio(value: number): AnimationBehavior {
        this._speedRatio = value;
        return this;
    }

    public static twoFrame(first: number, second: number, start: number = 0, end: number = 100): AnimationKey<number>[] {
        return [{ frame: start, value: first }, { frame: end, value: second }];
    }

    public static threeFrame(first: number, second: number, third: number, start: number = 0, end: number = 100): AnimationKey<number>[] {
        return [{ frame: start, value: first }, { frame: (end - start) / 2, value: second }, { frame: end, value: third }];
    }
}