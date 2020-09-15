import { mat2d, vec2 } from 'gl-matrix';
import { settings } from '../../graphics/settings';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

export class Circle extends Drawable {
  public static get descriptor(): DrawableDescriptor {
    return {
      uniformName: 'circles',
      countMacroName: 'circleCount',
      shaderCombinationSteps: settings.shaderCombinations.circleSteps,
      empty: new Circle(vec2.fromValues(0, 0), 0),
    };
  }

  constructor(public center: vec2, public radius: number) {
    super();
  }

  public distance(position: vec2): number {
    return 0;
  }

  public serializeToUniforms(uniforms: any, scale: number, transform: mat2d): void {
    const { uniformName } = Circle.descriptor;

    if (!Object.prototype.hasOwnProperty.call(uniforms, uniformName)) {
      uniforms[uniformName] = [];
    }

    uniforms[uniformName].push({
      center: vec2.transformMat2d(vec2.create(), this.center, transform),
      radius: this.radius * scale,
    });
  }
}
