import Behavior from '../core/Behavior';

export default class SpinningBehavior extends Behavior {
    runOnRenderLoop: boolean = true;
    private _clockwise: boolean;
    private _speed: number;

    constructor(clockwise: boolean = true, speed: number = 0.005) {
        super();
        this._clockwise = clockwise;
        this._speed = speed;
    }

    public tick() {
        this.context.node.rotation.y +=
            (this._clockwise ? 1 : -1) * Math.abs(this._speed);
    }
}
