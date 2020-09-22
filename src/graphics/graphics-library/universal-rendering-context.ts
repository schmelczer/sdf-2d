import { Insights } from '../rendering/insights';

export type UniversalRenderingContext = WebGL2RenderingContext &
  WebGLRenderingContext & { isWebGL2: boolean };

export const getUniversalRenderingContext = (
  canvas: HTMLCanvasElement,
  ignoreWebGL2 = false
): UniversalRenderingContext => {
  let context: WebGL2RenderingContext | WebGLRenderingContext | null = ignoreWebGL2
    ? null
    : canvas.getContext('webgl2');

  let webgl2Support = true;

  if (!context) {
    context = canvas.getContext('webgl');
    webgl2Support = false;
  }

  if (!context) {
    context = canvas.getContext('experimental-webgl') as WebGLRenderingContext;
  }

  if (!context) {
    throw new Error('Neither WebGL or WebGL2 is supported');
  }

  Insights.setValue('using WebGL2', webgl2Support);

  const result = context as UniversalRenderingContext;
  result.isWebGL2 = webgl2Support;
  return result;
};
