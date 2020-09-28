/**
 * Interface for a configuration object containing the settings
 * that need to be given before shader compilation.
 *
 * The default values for StartupSettings can be found in [[defaultStartupSettings]].
 */
export interface StartupSettings {
  /**
   * The raytracing algorithm used for shadows requires a step count.
   * Sensible values for this are between 8 and 32.
   *
   * The higher the number, the harder the shadows will get.
   * Some ambient occlusion like effects can be visible on lower trace counts.
   */
  shadowTraceCount: number;

  /**
   * Gives the number of possible object colors for the scene.
   *
   * When using WebGL, only 256 different colors can be used.
   * On WebGL2, its value should not be larger than 4096 for
   * maintaining compatibility with low-end devices.
   */
  paletteSize: number;

  /**
   * When set to `true`, rendering will fall back to WebGL
   * even when WebGL2 is present.
   *
   * Useful for testing compatibility.
   */
  ignoreWebGL2: boolean;
}
