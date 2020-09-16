import { vec2 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';

export interface Renderer {
  readonly canvasSize: vec2;
  readonly insights: any;

  setViewArea(topLeft: vec2, size: vec2): void;
  setCursorPosition(position: vec2): void;
  addDrawable(drawable: Drawable): void;
  autoscaleQuality(deltaTime: DOMHighResTimeStamp): void;
  renderDrawables(): void;
  destroy(): void;
}
