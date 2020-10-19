import { vec3, vec4 } from 'gl-matrix';
import { TextureWithOptions } from '../../graphics-library/texture/texture-options';

/**
 * Interface for a configuration object containing the settings
 * that can be changed during runtime.
 *
 * The default values for RuntimeSettings can be found in [[defaultRuntimeSettings]].
 */
export interface RuntimeSettings {
  /**
   * When set to `true` rendering will be done on the screen's real resolution.
   */
  enableHighDpiRendering: boolean;

  /**
   * First, the SDF of the scene is evaluated at every single pixel.
   * For speeding this process up, the screen is divided up into tiles,
   * this way each having to deal with a fewer objects.
   *
   * For each tile, it is decided which objects are near its close vicinity.
   * This comes with some overhead for the CPU, while saving the GPU from loads of
   * calculations. The workload can be balanced between the CPU and the GPU by setting
   * this number.
   */
  tileMultiplier: number;

  /**
   * By default, every pixel is outside of objects. Flipping this value to `true` will
   * result in every pixel being inside a large object. From then it only makes sense to
   * draw inverted objects.
   */
  isWorldInverted: boolean;

  /**
   * When lights reach the end of the display, they are slowly faded out. The length
   * of this phaseout can be set through this value.
   */
  lightCutoffDistance: number;

  /**
   * Its length should be less than the one specified in [[StartupSettings]].paletteSize.
   *
   * The possible colors for the objects. Each color is referenced by its index in the
   * palette.
   *
   * Can have transparency, but only if WebGL2 support is enabled.
   */
  colorPalette: Array<vec3 | vec4>;

  /**
   * The resolution of the distance field rendering will be scaled up or down with this value.
   *
   * Because of interpolation, this can be set much lower than the `lightsRenderScale`, while
   * maintaining closely the same perceived quality.
   *
   * Setting this is a great way to balance quality and performance.
   */
  distanceRenderScale: number;

  /**
   * The resolution of the final frame will be scaled by this value.
   *
   * Setting this is a great way to balance quality and performance.
   */
  lightsRenderScale: number;

  /**
   * It is possible to use your own textures in your SDF definitions.
   *
   * The keys of the object should be the name used to reference them in the GLSL code,
   * and the values should be the textures themselves or a TextureWithOptions specifying
   * the texture's [[TextureOptions]].
   * It can be a canvas, img element, Image and so on.
   */
  textures: {
    [textureName: string]: TexImageSource | TextureWithOptions;
  };

  /**
   * A light affecting every pixel (even the ones inside objects).
   */
  ambientLight: vec3;
}
