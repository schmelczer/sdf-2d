import { vec4 } from 'gl-matrix';

/**
 * Return a color with transparency contained in a vec4.
 *
 * @param r Should be between 0 and 1
 * @param g Should be between 0 and 1
 * @param b Should be between 0 and 1
 * @param a Should be between 0 and 1
 *
 * @category Color
 */
export const rgba = (r: number, g: number, b: number, a: number): vec4 =>
  vec4.fromValues(r, g, b, a);
