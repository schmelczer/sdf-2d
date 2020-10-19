import { mat2d, vec2 } from 'gl-matrix';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

export class ColorfulCircle extends Drawable {
  public static descriptor: DrawableDescriptor = {
    sdf: {
      shader: `
            uniform vec2 colorfulCircleCenters[COLORFUL_CIRCLE_COUNT];
            uniform float colorfulCircleRadii[COLORFUL_CIRCLE_COUNT];
            uniform int colorfulCircleColorIndex[COLORFUL_CIRCLE_COUNT];
  
            float circleMinDistance(vec2 target, out vec4 color) {
              float minDistance = 1000.0;
              for (int i = 0; i < COLORFUL_CIRCLE_COUNT; i++) {
                float dist = distance(colorfulCircleCenters[i], target) - colorfulCircleRadii[i];
                if (dist < minDistance) {
                  color = readFromPalette(colorfulCircleColorIndex[i]);
                  dist = minDistance;
                }
              }
  
              return minDistance;
            }
          `,
      distanceFunctionName: 'circleMinDistance',
    },
    propertyUniformMapping: {
      center: 'colorfulCircleCenters',
      radius: 'colorfulCircleRadii',
      colorIndex: 'colorfulCircleColorIndex',
    },
    uniformCountMacroName: 'COLORFUL_CIRCLE_COUNT',
    shaderCombinationSteps: [0, 1, 2, 3, 8, 16],
    empty: new ColorfulCircle(vec2.create(), 0, 0),
  };

  constructor(public center: vec2, public radius: number, public colorIndex: number) {
    super();
  }

  public minDistance(target: vec2): number {
    return vec2.dist(this.center, target) - this.radius;
  }

  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    return {
      center: vec2.transformMat2d(vec2.create(), this.center, transform2d),
      radius: this.radius * transform1d,
      colorIndex: this.colorIndex,
    };
  }
}
