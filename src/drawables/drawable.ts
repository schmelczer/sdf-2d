import { mat2d, vec2 } from 'gl-matrix';
import { DrawableDescriptor } from './drawable-descriptor';

export abstract class Drawable {
  // This should be overriden by inherited classes
  public static readonly descriptor: DrawableDescriptor;

  public abstract minDistance(target: vec2): number;

  protected abstract getObjectToSerialize(transform2d: mat2d, transform1d: number): any;

  public serializeToUniforms(
    uniforms: any,
    transform2d: mat2d,
    transform1d: number
  ): void {
    const { uniformName } = (this.constructor as typeof Drawable).descriptor;

    if (!Object.prototype.hasOwnProperty.call(uniforms, uniformName)) {
      uniforms[uniformName] = [];
    }

    uniforms[uniformName].push(this.getObjectToSerialize(transform2d, transform1d));
  }
}
