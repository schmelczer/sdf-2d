import { mat2d, vec2, vec3 } from 'gl-matrix';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

export class CircleLight extends Drawable {
  public static get descriptor(): DrawableDescriptor {
    return {
      uniformName: 'circleLights',
      uniformCountMacroName: 'CIRCLE_LIGHT_COUNT',
      shaderCombinationSteps: [0, 1, 2, 4],
      empty: new CircleLight(vec2.fromValues(0, 0), vec3.fromValues(0, 0, 0), 0),
    };
  }

  constructor(public center: vec2, public color: vec3, public intensity: number) {
    super();
  }

  public distance(target: vec2): number {
    return vec2.dist(this.center, target);
  }

  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    return {
      center: vec2.transformMat2d(vec2.create(), this.center, transform2d),
      color: this.color,
      intensity: this.intensity,
    };
  }
}
