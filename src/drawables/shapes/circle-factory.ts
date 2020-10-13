import { mat2d, vec2, vec3, vec4 } from 'gl-matrix';
import { codeForColorAccess } from '../../helper/code-for-color-access';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';

/**
 * @category Drawable
 */
class CircleBase extends EmptyDrawable {
  constructor(public center: vec2, public radius: number) {
    super();
  }
}

/**
 * @category Drawable
 */
export const CircleFactory = (color: vec3 | vec4 | number): typeof CircleBase => {
  class Circle extends CircleBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
            uniform vec2 circleCenters[CIRCLE_COUNT];
            uniform float circleRadii[CIRCLE_COUNT];
  
            float circleMinDistance(vec2 target, out vec4 color) {
              color = ${codeForColorAccess(color)};
              float minDistance = 1000.0;
              for (int i = 0; i < CIRCLE_COUNT; i++) {
                float dist = distance(circleCenters[i], target) - circleRadii[i];
                minDistance = min(minDistance, dist);
              }
  
              return minDistance;
            }
          `,
        distanceFunctionName: 'circleMinDistance',
      },
      propertyUniformMapping: {
        center: 'circleCenters',
        radius: 'circleRadii',
      },
      uniformCountMacroName: 'CIRCLE_COUNT',
      shaderCombinationSteps: [0, 1, 2, 3, 8, 16],
      empty: new Circle(vec2.create(), 0),
    };

    public minDistance(target: vec2): number {
      return vec2.dist(this.center, target) - this.radius;
    }

    protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
      return {
        center: vec2.transformMat2d(vec2.create(), this.center, transform2d),
        radius: this.radius * transform1d,
      };
    }
  }

  return Circle;
};
