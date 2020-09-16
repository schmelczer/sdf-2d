import { glMatrix } from 'gl-matrix';
import { DrawableDescriptor } from './drawables/drawable-descriptor';
import { Renderer } from './graphics/rendering/renderer';
import { WebGl2Renderer } from './graphics/rendering/webgl2-renderer';
import { applyArrayPlugins } from './helper/array';

export { Drawable } from './drawables/drawable';
export { CircleLight } from './drawables/lights/circle-light';
export { Flashlight } from './drawables/lights/flashlight';
export { Circle } from './drawables/shapes/circle';
export { RenderingPassName } from './graphics/rendering/rendering-pass-name';

export const compile = (
  canvas: HTMLCanvasElement,
  descriptors: Array<DrawableDescriptor>
): Renderer => {
  glMatrix.setMatrixArrayType(Array);
  applyArrayPlugins();
  return new WebGl2Renderer(canvas, descriptors);
};
