import { glMatrix } from 'gl-matrix';
import { IRenderer } from './graphics/i-renderer';
import { WebGl2Renderer } from './graphics/rendering/webgl2-renderer';
import { applyArrayPlugins } from './helper/array';

export { Drawable } from './drawables/drawable';
export { CircleLight } from './drawables/lights/circle-light';
export { Circle } from './drawables/shapes/circle';

export const compile = (canvas: HTMLCanvasElement): IRenderer => {
  glMatrix.setMatrixArrayType(Array);
  applyArrayPlugins();
  return new WebGl2Renderer(canvas);
};
