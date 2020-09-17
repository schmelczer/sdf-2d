import { vec3 } from 'gl-matrix';

export interface RuntimeSettings {
  enableHighDpiRendering: boolean;
  tileMultiplier: number;
  isWorldInverted: boolean;
  ambientLight: vec3;
}
