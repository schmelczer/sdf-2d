import { vec3, vec4 } from 'gl-matrix';

/**
 * Interface for a configuration object containing the settings
 * that need to be given before shader compilation.
 *
 * The default values for StartupSettings can be found in [[defaultStartupSettings]].
 */
export interface StartupSettings {
  /**
   * Creates a stopwatch used for measuring the GPU render time
   * when its required extension is available.
   *
   * You should only have one renderer with the stopwatch enabled.
   */
  enableStopwatch: boolean;

  /**
   * The raytracing algorithm used for shadows requires a step count.
   * Sensible values for this are between 8 and 32.
   *
   * The higher the number, the harder the shadows will get.
   * Some ambient-occlusion-like effects can be visible at lower trace counts.
   */
  shadowTraceCount: number;

  /**
   * The illumination is multiplied by this constant where
   * the distance field is negative (i.e. inside objects).
   *
   * Should be between 0 and 1, but other values are also permitted.
   */
  lightPenetrationRatio: number;

  /**
   * Controls how overlapping lights combine.
   *
   * At `0` lights are summed additively (the physically-correct default):
   * two nearby lights brighten their overlap and their glows merge into a
   * shape larger than either alone. At `1` overlapping lights instead take
   * the per-channel maximum, so a combination never reads brighter or larger
   * than its strongest contributor. Values in between blend the two.
   *
   * A single light looks the same at any value. Should be between 0 and 1.
   */
  lightOverlapReduction: number;

  /**
   * Gives the number of possible object colors for the scene.
   *
   * When using WebGL, only 256 different colors can be used.
   * On WebGL2, its value should not be larger than 4096 for
   * maintaining compatibility with low-end devices.
   */
  paletteSize: number;

  /**
   * Many context-lost events will be simulated when enabled.
   *
   * Useful for testing.
   */
  enableContextLostSimulator: boolean;

  /**
   * The default background color of the scene, can have transparency on every platform.
   */
  backgroundColor: vec3 | vec4;

  /**
   * When set to `true`, rendering will fall back to WebGL
   * even when WebGL2 is present.
   *
   * Useful for testing compatibility.
   */
  ignoreWebGL2: boolean;
}
