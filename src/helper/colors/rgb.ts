import { vec3 } from 'gl-matrix';

/**
 * Return a color contained in a vec3.
 *
 * @param r Should be between 0 and 1
 * @param g Should be between 0 and 1
 * @param b Should be between 0 and 1
 *
 * @category Color
 */
export const rgb = (r: number, g: number, b: number): vec3 => vec3.fromValues(r, g, b);
