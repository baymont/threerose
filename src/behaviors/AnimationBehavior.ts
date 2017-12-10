import BBehavior from '../core/BBehavior';

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

    /**
     * Animation behavior for number
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
        var animationBox = new BABYLON.Animation(this._name, this._targetPath, 30, this._dataType,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        var easingFunction = new BABYLON.CircleEase();
        
        // For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    
        // Adding easing function to my animation
        animationBox.setEasingFunction(easingFunction);
        
        animationBox.setKeys(this._frames);

        this.context.node.animations.push(animationBox);
        
        this.context.scene.beginAnimation(this.context.node, this._from, this._to, this._loop, this._speedRatio);
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