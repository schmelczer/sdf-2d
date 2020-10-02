import { mat2d, vec2 } from 'gl-matrix';
import { DrawableDescriptor } from './drawable-descriptor';

/**
 * Base class of every drawable object.
 *
 * To create your own drawables, you need to subclass from this.
 *
 * > Although lights are also subclasses of Drawable, you cannot create your own light sources.
 */
export abstract class Drawable {
  /**
   * This should be defined in inherited classes.
   */
  public static readonly descriptor: DrawableDescriptor;

  /**
   * The lower bound of the distance between the target and the object.
   *
   * It can return 0 by default, the only consequence of this, is a reduced performance.
   * Because this object won't benefit from tile-based rendering.
   * @param target
   */
  public abstract minDistance(target: vec2): number;

  /**
   * Return the values that should be given to the shaders through uniform inputs.
   *
   * @param transform2d position-like properties should be transformed by this matrix
   * before being returned.
   * @param transform1d scalar properties should be transformed by this number
   * before being returned.
   */
  protected abstract getObjectToSerialize(transform2d: mat2d, transform1d: number): any;

  /** @internal */
  public serializeToUniforms(
    uniforms: any,
    transform2d: mat2d,
    transform1d: number
  ): void {
    const { propertyUniformMapping } = (this.constructor as typeof Drawable).descriptor;

    const serialized = this.getObjectToSerialize(transform2d, transform1d);
    Object.entries(propertyUniformMapping).forEach(([k, v]) => {
      if (!Object.prototype.hasOwnProperty.call(uniforms, v)) {
        uniforms[v] = [];
      }

      uniforms[v].push(serialized[k]);
    });
  }
}
