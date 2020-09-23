import { DrawableDescriptor } from './drawables/drawable-descriptor';
import { Insights } from './graphics/rendering/insights';
import { Renderer } from './graphics/rendering/renderer';
import { RendererImplementation } from './graphics/rendering/renderer-implementation';
import { StartupSettings } from './graphics/rendering/settings/startup-settings';
import { applyArrayPlugins } from './helper/array';

export { Drawable } from './drawables/drawable';
export { DrawableDescriptor } from './drawables/drawable-descriptor';
export { CircleLight } from './drawables/lights/circle-light';
export { Flashlight } from './drawables/lights/flashlight';
export { Circle } from './drawables/shapes/circle';
export { InvertedTunnel } from './drawables/shapes/inverted-tunnel';
export { Tunnel } from './drawables/shapes/tunnel';
export { Renderer } from './graphics/rendering/renderer';

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
  settings: Partial<StartupSettings> = {}
): Promise<Renderer> {
  return Insights.measureFunction('startup', async () => {
    const renderer = new RendererImplementation(canvas, descriptors);
    await renderer.initialize(settings);
    return renderer;
  });
}
