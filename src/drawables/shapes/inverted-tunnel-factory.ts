import { mat2d, vec2, vec3, vec4 } from 'gl-matrix';
import { clamp01 } from '../../helper/clamp';
import { codeForColorAccess } from '../../helper/code-for-color-access';
import { mix } from '../../helper/mix';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';

/**
 * @category Drawable
 */
class InvertedTunnelBase extends EmptyDrawable {
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
 * Providing a noise texture is required for this drawable.
 *
 * @category Drawable
 */
export const InvertedTunnelFactory = (
  color: vec3 | vec4 | number
): typeof InvertedTunnelBase => {
  class InvertedTunnel extends InvertedTunnelBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
        uniform vec2 invertedTunnelFroms${_id}[INVERTED_TUNNEL_COUNT${_id}];
        uniform vec2 invertedTunnelToFromDeltas${_id}[INVERTED_TUNNEL_COUNT${_id}];
        uniform float invertedTunnelFromRadii${_id}[INVERTED_TUNNEL_COUNT${_id}];
        uniform float invertedTunnelToRadii${_id}[INVERTED_TUNNEL_COUNT${_id}];

        // Other drawables share this declaration; the include guard keeps
        // the combined shader from declaring it twice.
        #ifndef NOISE_TEXTURE_DECLARED
        #define NOISE_TEXTURE_DECLARED
          uniform sampler2D noiseTexture;
        #endif

        // Shared between every inverted-tunnel variant; the include guard
        // keeps the combined shader from defining it twice.
        #ifndef INVERTED_TUNNEL_TERRAIN_DECLARED
        #define INVERTED_TUNNEL_TERRAIN_DECLARED
          #ifdef WEBGL2_IS_AVAILABLE
            float invertedTunnelTerrain(float h) {
              return texture(
                noiseTexture,
                vec2(h, 0.5)
              )[0] - 0.5;
            }
          #else
            float invertedTunnelTerrain(float h) {
              return texture2D(
                noiseTexture,
                vec2(h, 0.5)
              )[0] - 0.5;
            }
          #endif
        #endif

        float invertedTunnelMinDistance${_id}(vec2 target, out vec4 color) {
          color = ${codeForColorAccess(color)};

          float minDistance = -1000.0;
          for (int i = 0; i < INVERTED_TUNNEL_COUNT${_id}; i++) {
            
            vec2 targetFromDelta = target - invertedTunnelFroms${_id}[i];

            float h = dot(targetFromDelta, invertedTunnelToFromDeltas${_id}[i])
              / max(dot(invertedTunnelToFromDeltas${_id}[i], invertedTunnelToFromDeltas${_id}[i]), 0.00000001);

            float clampedH = clamp(h, 0.0, 1.0);

            float currentDistance = -mix(
              invertedTunnelFromRadii${_id}[i], invertedTunnelToRadii${_id}[i], clampedH
            ) + distance(
              targetFromDelta, invertedTunnelToFromDeltas${_id}[i] * clampedH
            ) - invertedTunnelTerrain(h) / 12.0;

            minDistance = max(minDistance, -currentDistance);
          }

          return minDistance;
        }
      `,
        isInverted: true,
        distanceFunctionName: `invertedTunnelMinDistance${_id}`,
      },
      propertyUniformMapping: {
        from: `invertedTunnelFroms${_id}`,
        toFromDelta: `invertedTunnelToFromDeltas${_id}`,
        fromRadius: `invertedTunnelFromRadii${_id}`,
        toRadius: `invertedTunnelToRadii${_id}`,
      },
      uniformCountMacroName: `INVERTED_TUNNEL_COUNT${_id}`,
      shaderCombinationSteps: [0, 1, 4, 16, 32],
      empty: new InvertedTunnel(vec2.create(), vec2.create(), 0, 0),
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

  return InvertedTunnel;
};
