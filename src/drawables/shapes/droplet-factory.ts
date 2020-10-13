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

/**
 * @category Drawable
 */
export const DropletFactory = (color: vec3 | vec4 | number): typeof DropletBase => {
  class Droplet extends DropletBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
        uniform vec2 froms[DROPLET_COUNT];
        uniform vec2 toFromDeltas[DROPLET_COUNT];
        uniform float fromRadii[DROPLET_COUNT];
        uniform float toRadii[DROPLET_COUNT];

        float dropletMinDistance(vec2 target, out vec4 color) {
          color = ${codeForColorAccess(color)};

          float minDistance = 1000.0;
          for (int i = 0; i < DROPLET_COUNT; i++) {
            vec2 targetFromDelta = target - froms[i];
            
            float h = clamp(
                dot(targetFromDelta, toFromDeltas[i])
              / dot(toFromDeltas[i], toFromDeltas[i]),
              0.0, 1.0
            );

            float currentDistance = -mix(
              fromRadii[i], toRadii[i], h
            ) + distance(
              targetFromDelta, toFromDeltas[i] * h
            );

            minDistance = min(minDistance, currentDistance);
          }

          return minDistance;
        }
      `,
        distanceFunctionName: 'dropletMinDistance',
      },
      propertyUniformMapping: {
        from: 'froms',
        toFromDelta: 'toFromDeltas',
        fromRadius: 'fromRadii',
        toRadius: 'toRadii',
      },
      uniformCountMacroName: 'DROPLET_COUNT',
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

  return Droplet;
};
