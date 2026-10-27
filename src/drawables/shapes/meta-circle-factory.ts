import { mat2d, vec2, vec3, vec4 } from 'gl-matrix';
import { codeForColorAccess } from '../../helper/code-for-color-access';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';
import { numberToGlslFloat } from '../../helper/number-to-glsl-float';

/**
 * @category Drawable
 */
class MetaCircleBase extends EmptyDrawable {
  constructor(
    public center: vec2,
    public radius: number
  ) {
    super();
  }
}

let _id = 0;

/**
 * Creates a drawable class of smoothly merging circles with a shared color.
 *
 * @param color RGB or RGBA color, or an index into {@link graphics/rendering/settings/runtime-settings!RuntimeSettings.colorPalette}.
 * @param k Smooth union factor. Larger values produce sharper joins. Defaults to 32.
 * @returns A class with constructor `new MetaCircle(center: vec2, radius: number)`.
 * `center` is the position in world coordinates; `radius` is in world units.
 * Pass the class's static `descriptor` to {@link compile!compile}, then pass instances to
 * {@link graphics/rendering/renderer/renderer!Renderer.addDrawable}.
 *
 * @example
 * ```ts
 * import { MetaCircleFactory } from 'sdf-2d';
 *
 * const MetaCircle = MetaCircleFactory([1, 0.5, 0], 32);
 * const circle = new MetaCircle([160, 120], 30);
 * ```
 *
 * @category Drawable
 */
export const MetaCircleFactory = (
  color: vec3 | vec4 | number,
  k = 32
): typeof MetaCircleBase => {
  class MetaCircle extends MetaCircleBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
          uniform vec2 metaCircleCenters${_id}[META_CIRCLE_COUNT${_id}];
          uniform float metaCircleRadii${_id}[META_CIRCLE_COUNT${_id}];

          float metaCircleMinDistance${_id}(vec2 target, out vec4 color) {
            const float k = ${numberToGlslFloat(k)};
            color = ${codeForColorAccess(color)};
            float res = 0.0;
            for (int i = 0; i < META_CIRCLE_COUNT${_id}; i++) {
              float dist = distance(metaCircleCenters${_id}[i], target) - metaCircleRadii${_id}[i];
              res += exp2(-k * dist);
            }

            return -log2(res) / k;
          }
        `,
        distanceFunctionName: `metaCircleMinDistance${_id}`,
      },
      propertyUniformMapping: {
        center: `metaCircleCenters${_id}`,
        radius: `metaCircleRadii${_id}`,
      },
      uniformCountMacroName: `META_CIRCLE_COUNT${_id}`,
      shaderCombinationSteps: [0, 1, 2, 3, 8, 16],
      empty: new MetaCircle(vec2.create(), 0),
    };

    public minDistance(target: vec2): number {
      return vec2.dist(this.center, target) - this.radius * 2;
    }

    protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
      return {
        center: vec2.transformMat2d(vec2.create(), this.center, transform2d),
        radius: this.radius * transform1d,
      };
    }
  }

  _id++;

  return MetaCircle;
};
