import { ContextAwareRenderer } from './graphics/rendering/renderer/context-aware-renderer';
import { StartupSettings } from './graphics/rendering/settings/startup-settings';
import { DrawableDescriptor, Renderer } from './main';

/**
 * Compiles a new renderer instance. There can multiple renderers on a single page.
 * > Asynchronous behaviour is required for parallel shader compiling.
 * > Trying to draw before the returned promise resolves, results in no action taken.
 * > Settings can be set before promise resolution and they will be applied later.
 *
 * The descriptors of every to-be-drawn objects are required before creating the renderer,
 * allowing the compiler to only create the shaders that will actually be used.
 *
 * Example usage:
 *
 * ```js
 *  import { compile, hsl, CircleFactory, CircleLight } from 'sdf-2d';
 *
 *  const canvas = document.querySelector('canvas');
 *  const Circle = CircleFactory(hsl(30, 66, 50));
 *  const renderer = await compile(canvas, [Circle.descriptor, CircleLight.descriptor]);
 * ```
 *
 * @param canvas The returned renderer will only be able to draw to this canvas.
 * @param descriptors The descriptor of every single object (and light) that
 * ever needs to be drawn by this renderer has to be given before compiling.
 * @param settingsOverrides Sensible defaults are provided, but these can be overridden.
 */
export async function compile(
  canvas: HTMLCanvasElement,
  descriptors: Array<DrawableDescriptor>,
  settingsOverrides: Partial<StartupSettings> = {}
): Promise<Renderer> {
  const renderer = new ContextAwareRenderer(canvas, descriptors, settingsOverrides);
  await renderer.initializedPromise;
  return renderer;
}
