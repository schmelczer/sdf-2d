import { vec3 } from 'gl-matrix';
import { rgb255 } from './rgb255';

/**
 * Return a color given in a hexadecimal form as a vec3.
 *
 * @param hex A hexadecimal color with (#ff0000) or without (ff0000)
 * a leading hashmark.
 *
 * source: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 *
 * @category Color
 */
export const hex = (hex: string): vec3 => {
  if (hex[0] === '#') {
    hex = hex.slice(1);
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return rgb255(r, g, b);
};
