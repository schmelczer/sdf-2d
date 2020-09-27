import { Insights } from '../../rendering/insights';
import { UniversalRenderingContext } from '../universal-rendering-context';

export const tryEnableExtension = (
  gl: UniversalRenderingContext,
  name: string
): any | null => {
  let extension = null;
  if (gl.getSupportedExtensions()!.indexOf(name) != -1) {
    extension = gl.getExtension(name);
  }

  Insights.setValue(['extensions', name], extension !== null);

  return extension;
};

export const enableExtension = (gl: UniversalRenderingContext, name: string): any => {
  const extension = tryEnableExtension(gl, name);

  if (extension === null) {
    throw new Error(`Unsupported extension ${name}`);
  }

  return extension;
};
