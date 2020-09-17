import { vec3 } from 'gl-matrix';
import { DrawableDescriptor } from './drawables/drawable-descriptor';
import { Renderer } from './graphics/rendering/renderer';
import { WebGl2Renderer } from './graphics/rendering/webgl2-renderer';
import { WebGl2RendererSettings } from './graphics/rendering/webgl2-renderer-settings';
import { applyArrayPlugins } from './helper/array';

export { Drawable } from './drawables/drawable';
export { DrawableDescriptor } from './drawables/drawable-descriptor';
export { CircleLight } from './drawables/lights/circle-light';
export { Flashlight } from './drawables/lights/flashlight';
export { Circle } from './drawables/shapes/circle';
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

export const compile = async (
  canvas: HTMLCanvasElement,
  descriptors: Array<DrawableDescriptor>,
  palette: Array<vec3>,
  settings: Partial<WebGl2RendererSettings> = {}
): Promise<Renderer> => {
  applyArrayPlugins();

  const renderer = new WebGl2Renderer(canvas, descriptors, palette, settings);
  await renderer.initialize();
  return renderer;
};
