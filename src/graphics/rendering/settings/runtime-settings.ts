import { vec3 } from 'gl-matrix';

export interface RuntimeSettings {
  enableHighDpiRendering: boolean;
  tileMultiplier: number;
  isWorldInverted: boolean;
  shadowLength: number;
  ambientLight: vec3;
}
