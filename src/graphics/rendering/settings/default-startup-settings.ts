import { vec4 } from 'gl-matrix';
import { StartupSettings } from './startup-settings';

/**
 * Contains the default values used for [[StartupSettings]].
 */
export const defaultStartupSettings: StartupSettings = {
  shadowTraceCount: 16,
  paletteSize: 256,
  ignoreWebGL2: false,
  backgroundColor: vec4.fromValues(1, 1, 1, 1),
  enableStopwatch: false,
};
