import { Insights } from '../rendering/insights';

export type UniversalRenderingContext = WebGL2RenderingContext &
  WebGLRenderingContext & { isWebGL2: boolean };

export const getUniversalRenderingContext = (
  canvas: HTMLCanvasElement,
  ignoreWebGL2 = false
): UniversalRenderingContext => {
  const context: WebGL2RenderingContext | WebGLRenderingContext | null = ignoreWebGL2
    ? null
    : canvas.getContext('webgl2');

  let result = context as UniversalRenderingContext;

  if (context) {
    if (!Object.prototype.hasOwnProperty.call(context, 'isWebGL2')) {
      result.isWebGL2 = true;
    }
  } else {
    result = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as UniversalRenderingContext;

    if (!result) {
      throw new Error('Neither WebGL or WebGL2 is supported');
    }

    result.isWebGL2 = false;
  }

  Insights.setValue('using WebGL2', result.isWebGL2);
  return result;
};
