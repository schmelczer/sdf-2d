import { ReadonlyVec2, vec2 } from 'gl-matrix';
import { Drawable } from '../../../drawables/drawable';
import { RuntimeSettings } from '../settings/runtime-settings';
import { RendererInfo } from './renderer-info';

/**
 * The main interface through which rendering can be achieved.
 *
 * Multiple renderers are permitted on a single page.
 */
export interface Renderer {
  /**
   * Get the actual resolution of the canvas without triggering a reflow.
   *
   * A ResizeObserver is utilised fot achieving this.
   */
  readonly canvasSize: ReadonlyVec2;

  /**
   * Get the viewArea size set by the last `setViewArea`.
   *
   * By default, `canvasSize` is used for the view area size.
   */
  readonly viewAreaSize: ReadonlyVec2;

  /**
   * Set the camera transformation.
   *
   * @param topLeft top (!) left. By default, equals to [0, canvasHeight].
   * @param size need not be equal to the canvas size, though their aspect ratio
   * should be the same to avoid stretching.
   */
  setViewArea(topLeft: ReadonlyVec2, size: ReadonlyVec2): void;

  /**
   * The inverse of `worldToDisplayCoordinates`, returns the world coordinates
   * from a pixel's position.
   *
   * The view area coordinates are also given in world coordinates.
   *
   * Useful for picking.
   *
   * @param displayCoordinates The origin is in the display's top left corner.
   * Just as in mouse events' clientX and clientY.
   */
  displayToWorldCoordinates(displayCoordinates: ReadonlyVec2): vec2;

  /**
   * The inverse of `displayToWorldCoordinates`, returns the screen space position
   * of a point given in world space cooridnates.
   *
   * While the origin for worldCoordinates resides in the bottom-left corner,
   * the origin of the returned display coordinates is placed in the top left.
   *
   * @param worldCoordinates Coordinates used when drawing objects.
   */
  worldToDisplayCoordinates(worldCoordinates: ReadonlyVec2): vec2;

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
   * Get useful information about the hardware and the SDF2D renderer.
   *
   * Its sheme is subject to change.
   *
   * During context lost it might be null.
   *
   */
  readonly insights: RendererInfo | null;
}
