import { mat2d, vec2 } from 'gl-matrix';
import { Drawable } from './drawable';
import { DrawableDescriptor } from './drawable-descriptor';

/**
 * @internal
 */
export class EmptyDrawable extends Drawable {
  public static readonly descriptor: DrawableDescriptor;

  public minDistance(target: vec2): number {
    throw new Error('Unimplemented');
  }

  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    throw new Error('Unimplemented');
  }
}
