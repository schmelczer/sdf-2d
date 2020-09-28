/**
 * Importing this file gives arrays (`Array` and `Float32Array` instances)
 * two new properties: `x` and `y`. The former refers to their 0th element,
 * and the latter to their 1st.
 *
 * @packageDocumentation
 */

import { DrawableDescriptor } from './drawables/drawable-descriptor';
import { Insights } from './graphics/rendering/insights';
import { ContextAwareRenderer } from './graphics/rendering/renderer/context-aware-renderer';
import { Renderer } from './graphics/rendering/renderer/renderer';
import { StartupSettings } from './graphics/rendering/settings/startup-settings';
import { applyArrayPlugins } from './helper/array';

declare global {
  interface Array<T> {
    x: number;
    y: number;
  }

  interface Float32Array {
    x: number;
    y: number;
  }
}

applyArrayPlugins();

/**
 * Compiles a new renderer instance. There can multiple renderers on a single page.
 * > Asynchronous behaviour is required for paralell shader compiling.
 * > Trying to draw before the returned promise resolves results in no action taken.
 * > Settings can be set before promise resolution and they will be applied later.
 *
 * The descriptors of every to-be-drawn objects are required before creating the renderer,
 * allowing the compiler to only create the shaders that will actually be used.
 *
 * Example usage:
 *
 * ```js
 *  import { compile, Circle, CircleLight } from 'sdf-2d';
 *
 *  const canvas = document.querySelector('canvas');
 *  const renderer = await compile(canvas, [Circle.descriptor, CircleLight.descriptor]);
 * ```
 *
 * @param canvas The returned renderer will only be able to draw to this canvas.
 * @param descriptors The descriptor of every single object (and light) that
 * ever needs to be drawn by this renderer has to be given before compiling.
 * @param settingsOverrides Sensible defaults are provided, but these can be overriden.
 *
 * @category Startup
 */
export async function compile(
  canvas: HTMLCanvasElement,
  descriptors: Array<DrawableDescriptor>,
  settingsOverrides: Partial<StartupSettings> = {}
): Promise<Renderer> {
  return Insights.measureFunction('startup', async () => {
    const renderer = new ContextAwareRenderer(canvas, descriptors, settingsOverrides);
    await renderer.initializedPromise;
    return renderer;
  });
}

export * from './drawables/drawable';
export * from './drawables/drawable-descriptor';
export * from './drawables/lights/circle-light';
export * from './drawables/lights/flashlight';
export * from './drawables/shapes/circle';
export * from './drawables/shapes/inverted-tunnel';
export * from './drawables/shapes/tunnel';
export * from './graphics/rendering/renderer/renderer';
