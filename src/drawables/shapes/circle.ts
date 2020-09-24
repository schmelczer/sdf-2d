import { mat2d, vec2 } from 'gl-matrix';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

export class Circle extends Drawable {
  public static descriptor: DrawableDescriptor = {
    sdf: {
      shader: `
          uniform vec2 circleCenters[CIRCLE_COUNT];
          uniform float circleRadii[CIRCLE_COUNT];

          float circleMinDistance(vec2 target, out float colorIndex) {
            colorIndex = 2.0;
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
    empty: new Circle(vec2.fromValues(0, 0), 0),
  };

  constructor(public center: vec2, public radius: number) {
    super();
  }

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
