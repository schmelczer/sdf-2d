import { vec2, vec3 } from 'gl-matrix';
import { DrawableDescriptor } from '../drawable-descriptor';
import { LightDrawable } from './light-drawable';

export class CircleLight extends LightDrawable {
  public static readonly descriptor: DrawableDescriptor = {
    uniformName: 'circleLights',
    uniformCountMacroName: 'CIRCLE_LIGHT_COUNT',
    shaderCombinationSteps: [0, 1, 2, 4],
    empty: new CircleLight(vec2.fromValues(0, 0), vec3.fromValues(0, 0, 0), 0),
  };

  constructor(center: vec2, color: vec3, intensity: number) {
    super(center, color, intensity);
  }
}
