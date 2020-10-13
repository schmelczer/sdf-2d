import { Insights } from '../../rendering/insights';

/** @internal */
export const tryEnableExtension = (
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  name: string
): any | null => {
  let extension = null;
  if (gl.getSupportedExtensions()!.indexOf(name) != -1) {
    extension = gl.getExtension(name);
  }

  Insights.setValue(['extensions', name], extension !== null);

  return extension;
};

/** @internal */
export const enableExtension = (
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  name: string
): any => {
  const extension = tryEnableExtension(gl, name);

  if (extension === null) {
    throw new Error(`Unsupported extension ${name}`);
  }

  return extension;
};
