import { vec3 } from 'gl-matrix';

export interface RuntimeSettings {
  enableHighDpiRendering: boolean;
  tileMultiplier: number;
  isWorldInverted: boolean;
  shadowLength: number;
  lightCutoffDistance: number;
  colorPalette: Array<vec3>;
  ambientLight: vec3;
}
