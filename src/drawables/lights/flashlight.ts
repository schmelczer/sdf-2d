import { mat2d, vec2, vec3 } from 'gl-matrix';
import { DrawableDescriptor } from '../drawable-descriptor';
import { LightDrawable } from './light-drawable';

/**
 * @category Drawable
 */
export class Flashlight extends LightDrawable {
  public static readonly descriptor: DrawableDescriptor = {
    propertyUniformMapping: {
      center: 'flashlightCenters',
      color: 'flashlightColors',
      intensity: 'flashlightIntensities',
      direction: 'flashlightDirections',
    },
    uniformCountMacroName: 'FLASHLIGHT_COUNT',
    shaderCombinationSteps: [0, 1, 2, 4],
    empty: new Flashlight(
      vec2.fromValues(0, 0),
      vec3.fromValues(0, 0, 0),
      0,
      vec2.fromValues(0, 0)
    ),
  };

  public constructor(
    center: vec2,
    color: vec3,
    intensity: number,
    public direction: vec2
  ) {
    super(center, color, intensity);
  }

  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    return {
      ...super.getObjectToSerialize(transform2d, transform1d),
      direction: this.direction,
    };
  }
}
