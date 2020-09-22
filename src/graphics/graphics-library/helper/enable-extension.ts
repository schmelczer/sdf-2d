import { Insights } from '../../rendering/insights';
import { UniversalRenderingContext } from '../universal-rendering-context';

const extensions: Map<string, any> = new Map();

const logExtensions = () => {
  const values: any = {};
  for (const [k, v] of extensions.entries()) {
    values[k] = v !== null;
  }
  Insights.setValue('extensions', values);
};

export const tryEnableExtension = (
  gl: UniversalRenderingContext,
  name: string
): any | null => {
  if (extensions.has(name)) {
    return extensions.get(name);
  }

  let extension = null;
  if (gl.getSupportedExtensions()!.indexOf(name) != -1) {
    extension = gl.getExtension(name);
  }

  extensions.set(name, extension);

  logExtensions();

  return extension;
};

export const enableExtension = (gl: UniversalRenderingContext, name: string): any => {
  const extension = tryEnableExtension(gl, name);

  if (extension === null) {
    throw new Error(`Unsupported extension ${name}`);
  }

  return extension;
};
