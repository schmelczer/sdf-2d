import { vec2, vec3 } from 'gl-matrix';
import { DrawableDescriptor } from '../drawable-descriptor';
import { LightDrawable } from './light-drawable';

/**
 * @category Drawable
 */
export class CircleLight extends LightDrawable {
  public static readonly descriptor: DrawableDescriptor = {
    propertyUniformMapping: {
      center: 'circleLightCenters',
      color: 'circleLightColors',
      intensity: 'circleLightIntensities',
    },
    uniformCountMacroName: 'CIRCLE_LIGHT_COUNT',
    shaderCombinationSteps: [0, 1, 2, 4, 8, 16],
    empty: new CircleLight(vec2.create(), vec3.create(), 0),
  };

  constructor(center: vec2, color: vec3, intensity: number) {
    super(center, color, intensity);
  }
}
