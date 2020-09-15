import { mat2d, vec2, vec3 } from 'gl-matrix';
import { settings } from '../../settings';
import { IDrawableDescriptor } from '../i-drawable-descriptor';
import { ILight } from './i-light';

export class Flashlight implements ILight {
  public static descriptor: IDrawableDescriptor = {
    uniformName: 'flashlights',
    countMacroName: 'flashlightCount',
    shaderCombinationSteps: settings.shaderCombinations.flashlightSteps,
    empty: new Flashlight(
      vec2.fromValues(0, 0),
      vec2.fromValues(0, 0),
      0,
      vec3.fromValues(0, 0, 0),
      0
    ),
  };

  public constructor(
    public center: vec2,
    public direction: vec2,
    public lightDrop: number,
    public color: vec3,
    public lightness: number
  ) {}

  public distance(_: vec2): number {
    return 0;
  }

  public serializeToUniforms(uniforms: any, scale: number, transform: mat2d): void {
    const listName = Flashlight.descriptor.uniformName;

    if (!Object.prototype.hasOwnProperty.call(uniforms, listName)) {
      uniforms[listName] = [];
    }

    uniforms[listName].push({
      center: vec2.transformMat2d(vec2.create(), this.center, transform),
      direction: this.direction,
      lightDrop: this.lightDrop,
      value: this.value,
    });
  }

  public get value(): vec3 {
    return vec3.scale(vec3.create(), this.color, this.lightness);
  }
}
