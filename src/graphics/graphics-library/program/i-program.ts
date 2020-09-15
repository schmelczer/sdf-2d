import { vec2 } from 'gl-matrix';

export interface IProgram {
  initialize(): Promise<void>;
  setDrawingRectangleUV(bottomLeft: vec2, size: vec2): void;
  bindAndSetUniforms(values: { [name: string]: any }): void;
  draw(): void;
  delete(): void;
}
