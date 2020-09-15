import { vec2 } from 'gl-matrix';
import { Drawable } from '../drawables/drawable';

export interface IRenderer {
  initialize(): Promise<void>;

  startFrame(deltaTime: DOMHighResTimeStamp): void;
  finishFrame(): void;

  drawShape(drawable: Drawable): void;
  drawLight(light: Drawable): void;

  readonly canvasSize: vec2;
  setViewArea(topLeft: vec2, size: vec2): void;
  setCursorPosition(position: vec2): void;
}
