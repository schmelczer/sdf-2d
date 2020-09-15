import { mat2d, vec2 } from 'gl-matrix';
import { DrawableDescriptor } from './drawable-descriptor';

export abstract class Drawable {
  static get descriptor(): DrawableDescriptor {
    throw new Error('This getter should be overriden');
  }

  public abstract distance(target: vec2): number;
  public abstract serializeToUniforms(
    uniforms: any,
    scale: number,
    transform: mat2d
  ): void;
}
