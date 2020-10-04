import { vec2 } from 'gl-matrix';
import { ParallelCompiler } from '../../graphics-library/parallel-compiler';
import { FragmentShaderOnlyProgram } from '../../graphics-library/program/fragment-shader-only-program';
import { getUniversalRenderingContext } from '../../graphics-library/universal-rendering-context';
import randomFragment100 from '../shaders/random-fs-100.glsl';
import randomFragment from '../shaders/random-fs.glsl';
import randomVertex100 from '../shaders/random-vs-100.glsl';
import randomVertex from '../shaders/random-vs.glsl';

/**
 * Create a renderer, draw a (1D) noise texture with it,
 * then destroy the used resources, while returning the generated texture
 * in the form of a canvas.
 *
 * @param textureSize The resolution of the end result.
 * @param scale A starting value can be 60
 * @param amplitude A starting value can be 0.125
 * @param ignoreWebGL2 Ignore WebGL2, even when its available.
 */
export const renderNoise = async (
  textureSize: vec2,
  scale: number,
  amplitude: number,
  ignoreWebGL2 = false
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  canvas.width = textureSize.x;
  canvas.height = textureSize.y;

  const gl = getUniversalRenderingContext(canvas, ignoreWebGL2);
  const program = new FragmentShaderOnlyProgram(gl);
  const compiler = new ParallelCompiler(gl);

  const pogramPromise = program.initialize(
    gl.isWebGL2 ? [randomVertex, randomFragment] : [randomVertex100, randomFragment100],
    compiler
  );

  await compiler.compilePrograms();
  await pogramPromise;

  program.bind();
  program.draw({
    scale,
    amplitude,
  });

  program.destroy();

  return canvas;
};
