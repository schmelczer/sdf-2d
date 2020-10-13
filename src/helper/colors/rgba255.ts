import { vec4 } from 'gl-matrix';

/**
 * Return a color with transparency contained in a vec4.
 *
 * @param r Should be between 0 and 255
 * @param g Should be between 0 and 255
 * @param b Should be between 0 and 255
 * @param a Should be between 0 and 255
 *
 * @category Color
 */
export const rgba255 = (r: number, g: number, b: number, a: number): vec4 =>
  vec4.fromValues(r / 255, g / 255, b / 255, a / 255);
