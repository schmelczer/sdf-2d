import { mat2d, vec2 } from 'gl-matrix';
import { Drawable } from './drawable';
import { DrawableDescriptor } from './drawable-descriptor';

/**
 * Required for specifying the correct TS types.
 *
 * @internal
 */
export class EmptyDrawable extends Drawable {
  public static readonly descriptor: DrawableDescriptor;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public minDistance(target: vec2): number {
    throw new Error('Unimplemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    throw new Error('Unimplemented');
  }
}
