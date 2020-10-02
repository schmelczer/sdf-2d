import { mat2d, vec2 } from 'gl-matrix';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

/**
 * @category Drawable
 */
export class MetaCircle extends Drawable {
  public static descriptor: DrawableDescriptor = {
    sdf: {
      shader: `
          uniform vec2 metaCircleCenters[META_CIRCLE_COUNT];
          uniform float metaCircleRadii[META_CIRCLE_COUNT];

          const float k = 32.0;
          float metaCircleMinDistance(vec2 target, out float colorIndex) {
            colorIndex = 5.0;
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
    empty: new MetaCircle(vec2.fromValues(10000, 10000), -1000),
  };

  constructor(public center: vec2, public radius: number) {
    super();
  }

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
