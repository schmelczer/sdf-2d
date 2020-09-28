import { vec2 } from 'gl-matrix';
import { Drawable } from '../../../drawables/drawable';
import { RuntimeSettings } from '../settings/runtime-settings';

/**
 * The main interface through which rendering can be achieved.
 *
 * Multiple renderers are permitted on a single page.
 */
export interface Renderer {
  /**
   * Get the actual resolution of the canvas.
   */
  readonly canvasSize: vec2;

  /**
   * Get the viewArea size set by the last `setViewArea`.
   *
   * By default, `canvasSize` is used for the view area size.
   */
  readonly viewAreaSize: vec2;

  /**
   * Set the camera transformation.
   *
   * @param topLeft top (!) left. By default, equals to [0, canvasHeight].
   * @param size need not be equal to the canvas size, though their aspect ratio
   * should be the same to avoid stretching.
   */
  setViewArea(topLeft: vec2, size: vec2): void;

  /**
   * Patch the current runtime settings with new values.
   * @param overrides
   */
  setRuntimeSettings(overrides: Partial<RuntimeSettings>): void;

  /**
   * Schedule a drawable to be rendered during the next `renderDrawables` call.
   *
   * @param drawable Must be a subclass of drawable and its class must contain a
   * static descriptor property of type [[DrawableDescriptor]].
   */
  addDrawable<T extends Drawable>(drawable: T): void;

  /**
   * Render every drawable added since the last `renderDrawables` call.
   *
   * Resizing of framebuffers and the canvas also takes effect
   * when calling `renderDrawables`.
   */
  renderDrawables(): void;

  /**
   * Let go of every GPU resource held by the renderer.
   *
   * It's up to the browser and driver whether these resources are actually freed.
   * Nonetheless, when a renderer is no longer needed, this method should be called.
   */
  destroy(): void;

  /**
   * @experimental
   *
   * Debug information updated on each `renderDrawables` call.
   * Its scheme is not yet defined. The main purpose of this is
   * human debugging.
   */
  readonly insights: any;

  /**
   * @experimental
   *
   * Scale the render scale for both the canvas and the SDF memoization based
   * on the current and historical FPS values.
   *
   * @param deltaTime since the last frame, in milliseconds.
   */
  autoscaleQuality(deltaTime: DOMHighResTimeStamp): void;
}
