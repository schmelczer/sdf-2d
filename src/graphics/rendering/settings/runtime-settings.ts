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
   * When set to `true`, rendering will be done at the screen's real resolution.
   */
  enableHighDpiRendering: boolean;

  /**
   * First, the SDF of the scene is evaluated at every single pixel.
   * To speed this process up, the screen is divided into tiles,
   * so each one has to deal with fewer objects.
   *
   * For each tile, it is decided which objects are in its vicinity.
   * This comes with some overhead for the CPU, while saving the GPU from loads of
   * calculations. The workload can be balanced between the CPU and the GPU by setting
   * this number.
   */
  tileMultiplier: number;

  /**
   * By default, every pixel is outside of objects. Flipping this value to `true` will
   * result in every pixel being inside a large object. From then on, it only makes sense to
   * draw inverted objects.
   */
  isWorldInverted: boolean;

  /**
   * When lights reach the edge of the display, they are slowly faded out. The length
   * of this fade-out can be set through this value.
   */
  lightCutoffDistance: number;

  /**
   * The possible colors for the objects. Each color is referenced by its index in the
   * palette.
   *
   * Its length should be less than the `paletteSize` specified in [[StartupSettings]].
   *
   * Colors can have transparency, but only if WebGL2 support is enabled.
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
   * Set the extent of the motion blur.
   *
   * The values must be between 0 and 1. Where 0 means no motion blur,
   * and values just below 1 mean an extreme amount of motion blur.
   */
  motionBlur: number;

  /**
   * It is possible to use your own textures in your SDF definitions.
   *
   * The keys of the object should be the names used to reference them in the GLSL code,
   * and the values should be the textures themselves, or a TextureWithOptions specifying
   * the texture's [[TextureOptions]].
   * A texture can be a canvas, an img element, an Image, and so on.
   */
  textures: {
    [textureName: string]: TexImageSource | TextureWithOptions;
  };

  /**
   * A light affecting every pixel (even the ones inside objects).
   */
  ambientLight: vec3;
}
