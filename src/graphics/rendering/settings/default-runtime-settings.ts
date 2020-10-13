import { vec3 } from 'gl-matrix';
import { RuntimeSettings } from './runtime-settings';

/**
 * Contains the default values used for [[RuntimeSettings]].
 */
export const defaultRuntimeSettings: RuntimeSettings = {
  enableHighDpiRendering: false,
  tileMultiplier: 8,
  isWorldInverted: false,
  lightCutoffDistance: 400,
  colorPalette: [],
  ambientLight: vec3.fromValues(0.25, 0.15, 0.25),
  textures: {},
};
