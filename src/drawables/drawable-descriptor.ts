import { Drawable } from './drawable';

/**
 * Used for containing the required information to compile drawables into
 * shader code.
 *
 * Each [[Drawable]] must have a static property of this type, called descriptor.
 *
 * For more information on how to create your own DrawableDescriptor-s, look at the
 * code of [[Circle]] or [[InvertedTunnel]].
 */
export interface DrawableDescriptor {
  /**
   * An object describing the relationship between the object returned by a [[Drawable]]'s
   * getObjectToSerialize and the name of the arrays used in the GLSL code.
   */
  propertyUniformMapping: { [property: string]: string };

  /**
   * The name of the uniform int used in the code to refer to the
   * number of drawables of this type.
   */
  uniformCountMacroName: string;

  /**
   * Required property for shapes having physical dimensions.
   */
  sdf?: {
    /**
     * The actual GLSL code for observing the drawables represented by this descriptor.
     *
     * Your code should work with both version 100 and version 300 es
     */
    shader: string;
    /**
     * The name of the function defined in the value of `shader`.
     * Its signature should look like this:
     * ```glsl
     *  float (in vec2 target, out float colorIndex)
     * ```
     */
    distanceFunctionName: string;

    /**
     * By default, drawables are not inverted.
     */
    isInverted?: boolean;
  };

  /**
   * Number of possible drawables around each tile.
   *
   * For each step, a shader will be generated. And at runtime the closes matching
   * shader will be used to render a given part of the scene.
   */
  shaderCombinationSteps: Array<number>;

  /**
   * When no shaderCombinationStep matches the current number of drawables exactly,
   * the value of `empty` is used to pad out arrays.
   */
  readonly empty: Drawable;
}
