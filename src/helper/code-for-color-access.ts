import { vec3, vec4 } from 'gl-matrix';
import { colorToString } from './color-to-string';

/**
 * @internal
 */
export const codeForColorAccess = (color: vec3 | vec4 | number): string => {
  if (color instanceof Array || color instanceof Float32Array) {
    return colorToString(color);
  }

  return `readFromPalette(${color})`;
};
