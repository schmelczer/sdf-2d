import { vec2 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { RuntimeSettings } from './settings/runtime-settings';

export interface Renderer {
  readonly canvasSize: vec2;
  readonly viewAreaSize: vec2;
  readonly insights: any;

  setViewArea(topLeft: vec2, size: vec2): void;
  setRuntimeSettings(overrides: Partial<RuntimeSettings>): void;
  addDrawable(drawable: Drawable): void;
  autoscaleQuality(deltaTime: DOMHighResTimeStamp): void;
  renderDrawables(): void;
  destroy(): void;
}
