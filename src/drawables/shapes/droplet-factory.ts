import { mat2d, vec2, vec3, vec4 } from 'gl-matrix';
import { clamp01 } from '../../helper/clamp';
import { codeForColorAccess } from '../../helper/code-for-color-access';
import { mix } from '../../helper/mix';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';

/**
 * @category Drawable
 */
class DropletBase extends EmptyDrawable {
  constructor(
    public readonly from: vec2,
    public readonly to: vec2,
    public readonly fromRadius: number,
    public readonly toRadius: number
  ) {
    super();
  }
}

let _id = 0;

/**
 * @category Drawable
 */
export const DropletFactory = (color: vec3 | vec4 | number): typeof DropletBase => {
  class Droplet extends DropletBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
        uniform vec2 dropletFroms${_id}[DROPLET_COUNT${_id}];
        uniform vec2 dropletToFromDeltas${_id}[DROPLET_COUNT${_id}];
        uniform float dropletFromRadii${_id}[DROPLET_COUNT${_id}];
        uniform float dropletToRadii${_id}[DROPLET_COUNT${_id}];

        float dropletMinDistance${_id}(vec2 target, out vec4 color) {
          color = ${codeForColorAccess(color)};

          float minDistance = 1000.0;
          for (int i = 0; i < DROPLET_COUNT${_id}; i++) {
            vec2 targetFromDelta = target - dropletFroms${_id}[i];
            
            float h = clamp(
                dot(targetFromDelta, dropletToFromDeltas${_id}[i])
              / max(dot(dropletToFromDeltas${_id}[i], dropletToFromDeltas${_id}[i]), 0.00000001),
              0.0, 1.0
            );

            float currentDistance = -mix(
              dropletFromRadii${_id}[i], dropletToRadii${_id}[i], h
            ) + distance(
              targetFromDelta, dropletToFromDeltas${_id}[i] * h
            );

            minDistance = min(minDistance, currentDistance);
          }

          return minDistance;
        }
      `,
        distanceFunctionName: `dropletMinDistance${_id}`,
      },
      propertyUniformMapping: {
        from: `dropletFroms${_id}`,
        toFromDelta: `dropletToFromDeltas${_id}`,
        fromRadius: `dropletFromRadii${_id}`,
        toRadius: `dropletToRadii${_id}`,
      },
      uniformCountMacroName: `DROPLET_COUNT${_id}`,
      shaderCombinationSteps: [0, 1, 4, 16, 32],
      empty: new Droplet(vec2.create(), vec2.create(), 0, 0),
    };

    public minDistance(target: vec2): number {
      const toFromDelta = vec2.subtract(vec2.create(), this.to, this.from);
      const targetFromDelta = vec2.subtract(vec2.create(), target, this.from);

      const h = clamp01(
        vec2.dot(targetFromDelta, toFromDelta) / vec2.dot(toFromDelta, toFromDelta)
      );

      return (
        vec2.distance(targetFromDelta, vec2.scale(vec2.create(), toFromDelta, h)) -
        mix(this.fromRadius, this.toRadius, h)
      );
    }

    protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
      const toFromDelta = vec2.subtract(vec2.create(), this.to, this.from);

      return {
        from: vec2.transformMat2d(vec2.create(), this.from, transform2d),
        toFromDelta: vec2.scale(vec2.create(), toFromDelta, transform1d),
        fromRadius: this.fromRadius * transform1d,
        toRadius: this.toRadius * transform1d,
      };
    }
  }

  _id++;

  return Droplet;
};
