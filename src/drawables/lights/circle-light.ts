import { mat2d, vec2, vec3 } from 'gl-matrix';
import { settings } from '../../graphics/settings';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

export class CircleLight extends Drawable {
  public static get descriptor(): DrawableDescriptor {
    return {
      uniformName: 'circleLights',
      uniformCountMacroName: 'CIRCLE_LIGHT_COUNT',
      shaderCombinationSteps: settings.shaderCombinations.circleLightSteps,
      empty: new CircleLight(vec2.fromValues(0, 0), 0, vec3.fromValues(0, 0, 0), 0),
    };
  }

  constructor(
    public center: vec2,
    public lightDrop: number,
    public color: vec3,
    public lightness: number
  ) {
    super();
  }

  public distance(_: vec2): number {
    return 0;
  }

  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    return {
      center: vec2.transformMat2d(vec2.create(), this.center, transform2d),
      lightDrop: this.lightDrop,
      value: this.value,
    };
  }

  public get value(): vec3 {
    return vec3.scale(
      vec3.create(),
      vec3.normalize(this.color, this.color),
      this.lightness
    );
  }
}
