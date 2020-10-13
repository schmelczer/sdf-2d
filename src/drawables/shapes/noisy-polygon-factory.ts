import { mat2d, vec2 } from 'gl-matrix';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';
import { PolygonBase, PolygonFactory } from './polygon-factory';

interface NoisyPolygonBase extends PolygonBase {
  randomOffset: number;
}
/**
 * @category Drawable
 */
export const NoisyPolygonFactory = (
  vertexCount: number,
  colorIndex: number
): typeof PolygonBase & NoisyPolygonBase => {
  class NoisyPolygon extends PolygonFactory(vertexCount, colorIndex) {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
          uniform vec2 noisyPolygon${vertexCount}Vertices[NOISY_POLGYON${vertexCount}_COUNT * ${vertexCount}];
          uniform vec2 noisyPolygon${vertexCount}Centers[NOISY_POLGYON${vertexCount}_COUNT];
          uniform float noisyPolygon${vertexCount}Lengths[NOISY_POLGYON${vertexCount}_COUNT];
          uniform float noisyPolygon${vertexCount}Randoms[NOISY_POLGYON${vertexCount}_COUNT];

          uniform sampler2D noiseTexture;

          #ifdef WEBGL2_IS_AVAILABLE
            float myTerrain(vec2 h) {
              return texture(noiseTexture, h)[0] - 0.5;
            }
          #else
            float myTerrain(vec2 h) {
              return texture2D(noiseTexture, h)[0] - 0.5;
            }
          #endif

          vec2 noisyPolygon${vertexCount}LineDistance(vec2 target, vec2 from, vec2 to) {
            vec2 targetFromDelta = target - from;
            vec2 toFromDelta = to - from;
            float h = clamp(
              dot(targetFromDelta, toFromDelta) / dot(toFromDelta, toFromDelta),
              0.0, 1.0
            );

            vec2 diff = targetFromDelta - toFromDelta * h;
            return vec2(
              dot(diff, diff),
              toFromDelta.x * targetFromDelta.y - toFromDelta.y * targetFromDelta.x
            );
          }

          float noisyPolygon${vertexCount}MinDistance(vec2 target, out vec4 color) {
            color = readFromPalette(${colorIndex});

            float minDistance = 100.0;

            for (int j = 0; j < NOISY_POLGYON${vertexCount}_COUNT; j++) {
              vec2 startEnd = noisyPolygon${vertexCount}Vertices[j * ${vertexCount}];
              vec2 vb = startEnd;

              vec2 center = noisyPolygon${vertexCount}Centers[j];
              float l = noisyPolygon${vertexCount}Lengths[j];
              float randomOffset = noisyPolygon${vertexCount}Randoms[j];
              vec2 targetTangent = normalize(target - center);
              vec2 noisyTarget = target - (
                targetTangent * myTerrain(vec2(
                  l * abs(atan(targetTangent.y, targetTangent.x)),
                  randomOffset
                )) / 12.0
              );
            
              float d = 10000.0;
              float s = 1.0;
              for (int k = 1; k < ${vertexCount}; k++) {
                vec2 va = vb;
                vb = noisyPolygon${vertexCount}Vertices[j * ${vertexCount} + k];
                vec2 ds = noisyPolygon${vertexCount}LineDistance(noisyTarget, va, vb);

                bvec3 cond = bvec3(noisyTarget.y >= va.y, noisyTarget.y < vb.y, ds.y > 0.0);
                if (all(cond) || all(not(cond))) {
                  s *= -1.0;
                }

                d = min(d, ds.x);
              }

              vec2 ds = noisyPolygon${vertexCount}LineDistance(noisyTarget, vb, startEnd);
              bvec3 cond = bvec3(noisyTarget.y >= vb.y, noisyTarget.y < startEnd.y, ds.y > 0.0);
              if (all(cond) || all(not(cond))) {
                s *= -1.0;
              }

              d = min(d, ds.x);
              minDistance = min(minDistance, s * sqrt(d));
            }

            return minDistance;
          }
        `,
        distanceFunctionName: `noisyPolygon${vertexCount}MinDistance`,
      },
      propertyUniformMapping: {
        vertices: `noisyPolygon${vertexCount}Vertices`,
        length: `noisyPolygon${vertexCount}Lengths`,
        random: `noisyPolygon${vertexCount}Randoms`,
        center: `noisyPolygon${vertexCount}Centers`,
      },
      objectCountScaler: 1 / vertexCount,
      uniformCountMacroName: `NOISY_POLGYON${vertexCount}_COUNT`,
      shaderCombinationSteps: [0, 1, 2, 3, 8, 16],
      empty: (new NoisyPolygon(
        new Array(vertexCount).fill(vec2.create())
      ) as unknown) as Drawable,
    };

    public randomOffset = 0;

    constructor(public vertices: Array<vec2>) {
      super(vertices);
    }

    protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
      const transformedVertices = (this as any).actualVertices.map((v: vec2) =>
        vec2.transformMat2d(vec2.create(), v, transform2d)
      );

      const center = transformedVertices.reduce(
        (sum: vec2, v: vec2) => vec2.add(sum, sum, v),
        vec2.create()
      );
      vec2.scale(center, center, 1 / transformedVertices.length);

      let length = 0;
      for (let i = 1; i < this.vertices.length; i++) {
        length += vec2.distance(transformedVertices[i - 1], transformedVertices[i]);
      }

      return {
        vertices: transformedVertices,
        center,
        length,
        random: this.randomOffset,
      };
    }

    public serializeToUniforms(
      uniforms: any,
      transform2d: mat2d,
      transform1d: number
    ): void {
      const { propertyUniformMapping } = (this.constructor as typeof Drawable).descriptor;

      const serialized = this.getObjectToSerialize(transform2d, transform1d);
      Object.entries(propertyUniformMapping).forEach(([k, v]) => {
        if (!Object.prototype.hasOwnProperty.call(uniforms, v)) {
          uniforms[v] = [];
        }

        if (k === 'vertices') {
          uniforms[v].push(...serialized[k]);
        } else {
          uniforms[v].push(serialized[k]);
        }
      });
    }
  }

  return NoisyPolygon as any;
};
