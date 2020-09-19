import { mat2d, vec2, vec3 } from 'gl-matrix';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

export class Flashlight extends Drawable {
  public static readonly descriptor: DrawableDescriptor = {
    uniformName: 'flashlights',
    uniformCountMacroName: 'FLASHLIGHT_COUNT',
    shaderCombinationSteps: [0, 1, 2, 4],
    empty: new Flashlight(
      vec2.fromValues(0, 0),
      vec2.fromValues(0, 0),
      vec3.fromValues(0, 0, 0),
      0
    ),
  };

  public constructor(
    public center: vec2,
    public direction: vec2,
    public color: vec3,
    public intensity: number
  ) {
    super();
  }

  public distance(_: vec2): number {
    return 0;
  }

  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    return {
      center: vec2.transformMat2d(vec2.create(), this.center, transform2d),
      direction: this.direction,
      intensity: this.intensity,
      color: this.color,
    };
  }
}
