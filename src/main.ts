import { glMatrix, vec3 } from 'gl-matrix';
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

export const compile = (
  canvas: HTMLCanvasElement,
  descriptors: Array<DrawableDescriptor>,
  palette: Array<vec3>,
  settings: Partial<WebGl2RendererSettings> = {}
): Renderer => {
  glMatrix.setMatrixArrayType(Array);
  applyArrayPlugins();
  return new WebGl2Renderer(canvas, descriptors, palette, settings);
};
