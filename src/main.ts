import { DrawableDescriptor } from './drawables/drawable-descriptor';
import { Insights } from './graphics/rendering/insights';
import { ContextAwareRenderer } from './graphics/rendering/renderer/context-aware-renderer';
import { Renderer } from './graphics/rendering/renderer/renderer';
import { StartupSettings } from './graphics/rendering/settings/startup-settings';
import { applyArrayPlugins } from './helper/array';

export { Drawable } from './drawables/drawable';
export { DrawableDescriptor } from './drawables/drawable-descriptor';
export { CircleLight } from './drawables/lights/circle-light';
export { Flashlight } from './drawables/lights/flashlight';
export { Circle } from './drawables/shapes/circle';
export { InvertedTunnel } from './drawables/shapes/inverted-tunnel';
export { Tunnel } from './drawables/shapes/tunnel';
export { Renderer } from './graphics/rendering/renderer/renderer';

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

export async function compile(
  canvas: HTMLCanvasElement,
  descriptors: Array<DrawableDescriptor>,
  settingsOverrides: Partial<StartupSettings> = {}
): Promise<Renderer> {
  // enableContextLostSimulator(canvas);

  return Insights.measureFunction('startup', async () => {
    const renderer = new ContextAwareRenderer(canvas, descriptors, settingsOverrides);
    await renderer.initializedPromise;
    return renderer;
  });
}
