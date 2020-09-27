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

  let isDestroyed = false;

  const handleContextLost = (e: Event) => {
    e.preventDefault();
    isDestroyed = true;
    canvas.removeEventListener('webglcontextlost', handleContextLost, false);
  };
  canvas.addEventListener('webglcontextlost', handleContextLost, false);

  const contextLostHandler = {
    get: function (target: UniversalRenderingContext, prop: string) {
      if (isDestroyed || target.isContextLost()) {
        isDestroyed = true;
        throw new Error('Context lost');
      }

      const value = (target as any)[prop];

      if (typeof value === 'function') {
        return value.bind(target);
      }

      return value;
    },
  };

  return new Proxy(result, contextLostHandler);
};
