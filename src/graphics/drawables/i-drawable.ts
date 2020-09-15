import { vec2, mat2d } from 'gl-matrix';

export interface IDrawable {
  distance(target: vec2): number;
  serializeToUniforms(uniforms: any, scale: number, transform: mat2d): void;
}
