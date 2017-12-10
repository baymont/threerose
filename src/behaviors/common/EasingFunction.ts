import * as BABYLON from 'babylonjs';

export default abstract class EasingFunction extends BABYLON.EasingFunction {
    public static circleEase(): EasingFunction {
        return new BABYLON.CircleEase();
    }
    
    public static backEase(amplitude?: number): EasingFunction {
        return new BABYLON.BackEase(amplitude);
    }
    
    public static bounceEase(bounces?: number, bounciness?: number): EasingFunction {
        return new BABYLON.BounceEase(bounces, bounciness);
    }
    
    public static cubicEase(): EasingFunction {
        return new BABYLON.CubicEase();
    }
    
    public static elasticEase(oscillations?: number, springiness?: number): EasingFunction {
        return new BABYLON.ElasticEase(oscillations, springiness);
    }
    
    public static exponentialEase(exponent?: number): EasingFunction {
        return new BABYLON.ExponentialEase();
    }
    
    public static powerEase(power?: number): EasingFunction {
        return new BABYLON.PowerEase(power);
    }
    
    public static quadraticEase(): EasingFunction {
        return new BABYLON.QuadraticEase();
    }

    public static quarticEase(): EasingFunction {
        return new BABYLON.QuarticEase();
    }

    public static quinticEase(): EasingFunction {
        return new BABYLON.QuinticEase();
    }

    public static sineEase(): EasingFunction {
        return new BABYLON.SineEase();
    }

    public static bezierCurveEase(x1?: number, y1?: number, x2?: number, y2?: number): EasingFunction {
        return new BABYLON.BezierCurveEase(x1, y1, x2, y2);
    }
}