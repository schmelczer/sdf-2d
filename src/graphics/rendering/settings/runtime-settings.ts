import { vec3, vec4 } from 'gl-matrix';

export interface RuntimeSettings {
  enableHighDpiRendering: boolean;
  tileMultiplier: number;
  isWorldInverted: boolean;
  lightCutoffDistance: number;
  backgroundColor: vec3 | vec4;
  colorPalette: Array<vec3 | vec4>;
  ambientLight: vec3;
}
