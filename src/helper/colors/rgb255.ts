import { vec3 } from 'gl-matrix';

/**
 * Return a color contained in a vec3.
 *
 * @param r Should be between 0 and 255
 * @param g Should be between 0 and 255
 * @param b Should be between 0 and 255
 *
 * @category Color
 */
export const rgb255 = (r: number, g: number, b: number): vec3 =>
  vec3.fromValues(r / 255, g / 255, b / 255);
