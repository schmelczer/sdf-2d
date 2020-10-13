import { vec3 } from 'gl-matrix';
import { rgb } from './rgb';

/**
 * Return a color contained in a vec3.
 *
 * @param hue Should be between 0 and 360
 * @param saturation Should be between 0 and 100
 * @param lightness Should be between 0 and 100
 *
 * source: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 *
 * @category Color
 */
export const hsl = (hue: number, saturation: number, lightness: number): vec3 => {
  hue /= 360;
  saturation /= 100;
  lightness /= 100;
  let r, g, b;

  if (saturation == 0) {
    r = g = b = lightness;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;

    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }

  return rgb(r, g, b);
};
