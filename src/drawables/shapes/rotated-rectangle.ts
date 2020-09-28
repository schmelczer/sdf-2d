import { mat2d, vec2 } from 'gl-matrix';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

/**
 * @category Drawable
 */
export class RotatedRectangle extends Drawable {
  public static descriptor: DrawableDescriptor = {
    sdf: {
      // Source: https://iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
      shader: `
          uniform vec2 rotatedRectangleTopCenters[ROTATED_RECTANGLE_COUNT];
          uniform vec2 rotatedRectangleBottomCenters[ROTATED_RECTANGLE_COUNT];
          uniform float rotatedRectangleWidths[ROTATED_RECTANGLE_COUNT];

          float rotatedRectangleMinDistance(vec2 target, out float colorIndex) {
            colorIndex = 4.0;
            float minDistance = 1000.0;
            for (int i = 0; i < ROTATED_RECTANGLE_COUNT; i++) {
              vec2 top = rotatedRectangleTopCenters[i];
              vec2 bottom = rotatedRectangleBottomCenters[i];
              float height = length(bottom - top);
              vec2 d = (bottom - top) / height;

              vec2 q = (target - (top + bottom) * 0.5);
              q = mat2(d.x, -d.y, d.y, d.x) * q;
              q = abs(q) - vec2(height, rotatedRectangleWidths[i]) * 0.5;
              float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
              minDistance = min(minDistance, dist);
            }

            return minDistance;
          }
        `,
      distanceFunctionName: 'rotatedRectangleMinDistance',
    },
    propertyUniformMapping: {
      topCenter: 'rotatedRectangleTopCenters',
      bottomCenter: 'rotatedRectangleBottomCenters',
      width: 'rotatedRectangleWidths',
    },
    uniformCountMacroName: 'ROTATED_RECTANGLE_COUNT',
    shaderCombinationSteps: [0, 1, 2, 3, 8, 16],
    empty: new RotatedRectangle(vec2.create(), vec2.create(), 0),
  };

  constructor(public center: vec2, public size: vec2, public rotation: number) {
    super();
  }

  /**
   * It is just an estimate by calculating a bounding circle
   * @param target
   */
  public minDistance(target: vec2): number {
    return vec2.distance(this.center, target) - vec2.length(this.size) / 2;
  }

  protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
    const rotation = mat2d.fromRotation(mat2d.create(), this.rotation);

    const halfHeight = vec2.fromValues(0, this.size.y / 2);
    vec2.transformMat2d(halfHeight, halfHeight, rotation);

    const topCenter = vec2.add(vec2.create(), this.center, halfHeight);
    vec2.transformMat2d(topCenter, topCenter, transform2d);

    const bottomCenter = vec2.subtract(vec2.create(), this.center, halfHeight);
    vec2.transformMat2d(bottomCenter, bottomCenter, transform2d);

    return {
      topCenter,
      bottomCenter,
      width: this.size.x * transform1d,
    };
  }
}
