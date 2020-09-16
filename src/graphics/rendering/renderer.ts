import { vec2 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';

export interface Renderer {
  setViewArea(topLeft: vec2, size: vec2): void;

  addDrawable(drawable: Drawable): void;
  renderDrawables(): void;

  autoscaleQuality(deltaTime: DOMHighResTimeStamp): void;

  readonly canvasSize: vec2;
  setCursorPosition(position: vec2): void;
}
