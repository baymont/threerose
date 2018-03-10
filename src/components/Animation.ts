import Component from '../core/Component';
import EasingFunction from './common/EasingFunction';

export interface IAnimationKey<T> {
  frame: number;
  value: T;
}

export default class Animation extends Component {

  public static twoFrame(
    first: number,
    second: number,
    start: number = 0,
    end: number = 100
  ): Array<IAnimationKey<number>> {
    return [{ frame: start, value: first }, { frame: end, value: second }];
  }

  public static threeFrame(
    first: number,
    second: number,
    third: number,
    start: number = 0,
    end: number = 100
  ): Array<IAnimationKey<number>> {
    return [
      { frame: start, value: first },
      { frame: (end - start) / 2, value: second },
      { frame: end, value: third }
    ];
  }

  private _name: string;
  private _targetPath: string;
  private _dataType: number;
  private _frames: Array<IAnimationKey<{}>>;
  private _from: number;
  private _to: number;
  private _loop: boolean;
  private _speedRatio: number;
  private _easingFunction: BABYLON.EasingFunction;

  /**
   * Animation behavior for numbers
   */
  constructor(
    targetPath: string,
    frames: Array<IAnimationKey<number>>,
    from: number = 0,
    to: number = 100
  ) {
    super();
    this._targetPath = targetPath;
    this._dataType = BABYLON.Animation.ANIMATIONTYPE_FLOAT;
    this._frames = frames;
    this._from = from;
    this._to = to;
  }

  public clone(): Animation {
    return Object.create(this);
  }

  public easingFunction(value: EasingFunction): this {
    this._easingFunction = value;
    return this;
  }

  public loop(value: boolean): this {
    this._loop = value;
    return this;
  }

  public speedRatio(value: number): this {
    this._speedRatio = value;
    return this;
  }

  protected didMount(): void {
    const animation = new BABYLON.Animation(
      this._name,
      this._targetPath,
      30,
      this._dataType,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    if (this._easingFunction !== undefined) {
      // For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
      this._easingFunction.setEasingMode(
        BABYLON.EasingFunction.EASINGMODE_EASEINOUT
      );

      // Adding easing function to my animation
      animation.setEasingFunction(this._easingFunction);
    }

    animation.setKeys(this._frames);

    this.context.entity.node.animations.push(animation);

    this.context.scene.beginAnimation(
      this.context.entity.node,
      this._from,
      this._to,
      this._loop,
      this._speedRatio
    );
  }
}
