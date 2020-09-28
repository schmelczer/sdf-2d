import { mat2d, vec2, vec3 } from 'gl-matrix';
import { Drawable } from '../../main';

/** @internal */
export class LightDrawable extends Drawable {
  protected lightnessRatio = 1;

  constructor(public center: vec2, public color: vec3, public intensity: number) {
    super();
  }

  public setLightnessRatio(ratio: number) {
    this.lightnessRatio = ratio;
  }

  public minDistance(target: vec2): number {
    return vec2.dist(this.center, target);
  }

  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    return {
      center: vec2.transformMat2d(vec2.create(), this.center, transform2d),
      color: this.color,
      intensity: this.intensity * this.lightnessRatio * transform1d * 1500,
    };
  }
}
