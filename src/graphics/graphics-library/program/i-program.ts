import { vec2 } from 'gl-matrix';

export interface IProgram {
  setDrawingRectangleUV(bottomLeft: vec2, size: vec2): void;
  draw(values: { [name: string]: any }): void;
  destroy(): void;
}
