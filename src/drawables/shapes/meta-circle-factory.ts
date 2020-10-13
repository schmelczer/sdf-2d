import { mat2d, vec2, vec3, vec4 } from 'gl-matrix';
import { codeForColorAccess } from '../../helper/code-for-color-access';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';

/**
 * @category Drawable
 */
class MetaCircleBase extends EmptyDrawable {
  constructor(public center: vec2, public radius: number) {
    super();
  }
}

/**
 * @category Drawable
 */
export const MetaCircleFactory = (color: vec3 | vec4 | number): typeof MetaCircleBase => {
  class MetaCircle extends MetaCircleBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
          uniform vec2 metaCircleCenters[META_CIRCLE_COUNT];
          uniform float metaCircleRadii[META_CIRCLE_COUNT];

          const float k = 32.0;
          float metaCircleMinDistance(vec2 target, out vec4 color) {
            color = ${codeForColorAccess(color)};
            float res = 0.0;
            for (int i = 0; i < META_CIRCLE_COUNT; i++) {
              float dist = distance(metaCircleCenters[i], target) - metaCircleRadii[i];
              res += exp2(-k * dist);
            }

            return -log2(res) / k;
          }
        `,
        distanceFunctionName: 'metaCircleMinDistance',
      },
      propertyUniformMapping: {
        center: 'metaCircleCenters',
        radius: 'metaCircleRadii',
      },
      uniformCountMacroName: 'META_CIRCLE_COUNT',
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

  return MetaCircle;
};
