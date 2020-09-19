import { vec3 } from 'gl-matrix';
import { DrawableDescriptor } from './drawables/drawable-descriptor';
import { Insights } from './graphics/rendering/insights';
import { Renderer } from './graphics/rendering/renderer';
import { StartupSettings } from './graphics/rendering/settings/startup-settings';
import { WebGl2Renderer } from './graphics/rendering/webgl2-renderer';
import { applyArrayPlugins } from './helper/array';
export { Drawable } from './drawables/drawable';
export { DrawableDescriptor } from './drawables/drawable-descriptor';
export { CircleLight } from './drawables/lights/circle-light';
export { Flashlight } from './drawables/lights/flashlight';
export { Circle } from './drawables/shapes/circle';
export { InvertedTunnel } from './drawables/shapes/inverted-tunnel';
export { Tunnel } from './drawables/shapes/tunnel';
export { Renderer } from './graphics/rendering/renderer';
export { RenderingPassName } from './graphics/rendering/rendering-pass-name';

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
  palette: Array<vec3>,
  settings: Partial<StartupSettings> = {}
): Promise<Renderer> {
  return Insights.measureFunction('startup', async () => {
    const renderer = new WebGl2Renderer(canvas, descriptors);
    await renderer.initialize(palette, settings);
    return renderer;
  });
}
