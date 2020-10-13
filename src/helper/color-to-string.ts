import { vec3, vec4 } from 'gl-matrix';

/**
 * @internal
 */
export const colorToString = (v: vec3 | vec4): string =>
  `vec4(${v[0]}, ${v[1]}, ${v[2]}, ${v.length > 3 ? v[3] : 1})`;
