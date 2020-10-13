import { mat2d, vec2 } from 'gl-matrix';
import { clamp01 } from '../../helper/clamp';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';

/**
 * @category Drawable
 */
export class PolygonBase extends EmptyDrawable {
  constructor(public vertices: Array<vec2>) {
    super();
  }
}

/**
 * @category Drawable
 */
export const PolygonFactory = (
  vertexCount: number,
  colorIndex: number
): typeof PolygonBase => {
  class Polygon extends PolygonBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
          uniform vec2 polygon${vertexCount}Vertices[POLGYON${vertexCount}_COUNT * ${vertexCount}];

          vec2 polygon${vertexCount}LineDistance(vec2 target, vec2 from, vec2 to) {
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

          float polygon${vertexCount}MinDistance(vec2 target, out vec4 color) {
            color = readFromPalette(${colorIndex});

            float minDistance = 100.0;

            for (int j = 0; j < POLGYON${vertexCount}_COUNT; j++) {
              vec2 startEnd = polygon${vertexCount}Vertices[j * ${vertexCount}];
              vec2 vb = startEnd;

              float d = 10000.0;
              float s = 1.0;
              for (int k = 1; k < ${vertexCount}; k++) {
                vec2 va = vb;
                vb = polygon${vertexCount}Vertices[j * ${vertexCount} + k];
                vec2 ds = polygon${vertexCount}LineDistance(target, va, vb);

                bvec3 cond = bvec3(target.y >= va.y, target.y < vb.y, ds.y > 0.0);
                if (all(cond) || all(not(cond))) {
                  s *= -1.0;
                }

                d = min(d, ds.x);
              }

              vec2 ds = polygon${vertexCount}LineDistance(target, vb, startEnd);
              bvec3 cond = bvec3(target.y >= vb.y, target.y < startEnd.y, ds.y > 0.0);
              if (all(cond) || all(not(cond))) {
                s *= -1.0;
              }

              d = min(d, ds.x);
              minDistance = min(minDistance, s * sqrt(d));
            }

            return minDistance;
          }
        `,
        distanceFunctionName: `polygon${vertexCount}MinDistance`,
      },
      propertyUniformMapping: {
        vertices: `polygon${vertexCount}Vertices`,
      },
      objectCountScaler: 1 / vertexCount,
      uniformCountMacroName: `POLGYON${vertexCount}_COUNT`,
      shaderCombinationSteps: [0, 1, 2, 3, 8, 16],
      empty: new Polygon(new Array(vertexCount).fill(vec2.create())),
    };

    constructor(vertices: Array<vec2>) {
      super(vertices);

      if (vertices.length > vertexCount) {
        throw new Error(
          `Too many vertices, expected ${vertexCount}, got ${vertices.length}`
        );
      }
    }

    public minDistance(target: vec2): number {
      const startEnd = this.vertices[0];
      let vb = startEnd;

      let d = vec2.squaredDistance(target, vb);
      let sign = 1;

      for (let i = 1; i <= this.vertices.length; i++) {
        const va = vb;
        vb = i === this.vertices.length ? startEnd : this.vertices[i];
        const targetFromDelta = vec2.subtract(vec2.create(), target, va);
        const toFromDelta = vec2.subtract(vec2.create(), vb, va);
        const h = clamp01(
          vec2.dot(targetFromDelta, toFromDelta) / vec2.squaredLength(toFromDelta)
        );

        const ds = vec2.fromValues(
          vec2.dist(targetFromDelta, vec2.scale(vec2.create(), toFromDelta, h)),
          toFromDelta.x * targetFromDelta.y - toFromDelta.y * targetFromDelta.x
        );

        if (
          (target.y >= va.y && target.y < vb.y && ds.y > 0) ||
          (target.y < va.y && target.y >= vb.y && ds.y <= 0)
        ) {
          sign *= -1;
        }

        d = Math.min(d, ds.x);
      }

      return sign * d;
    }

    public getVertices(): Array<vec2> {
      return this.vertices;
    }

    private get actualVertices(): Array<vec2> {
      return this.vertices.length < vertexCount
        ? ([
            ...this.vertices,
            ...new Array(vertexCount - this.vertices.length).fill(this.vertices[0]),
          ] as Array<vec2>)
        : this.vertices;
    }

    protected getObjectToSerialize(transform2d: mat2d, transform1d: number): any {
      return {
        vertices: this.actualVertices.map((v) =>
          vec2.transformMat2d(vec2.create(), v, transform2d)
        ),
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

        uniforms[v].push(...serialized[k]);
      });
    }
  }

  return Polygon;
};
