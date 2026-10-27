import { mat2d, vec2, vec3, vec4 } from 'gl-matrix';
import { codeForColorAccess } from '../../helper/code-for-color-access';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';

/**
 * @category Drawable
 */
class HexagonBase extends EmptyDrawable {
  constructor(
    public center: vec2,
    public radius: number
  ) {
    super();
  }
}

let _id = 0;

/**
 * Creates a drawable hexagon class with a shared color.
 *
 * @param color RGB or RGBA color, or an index into {@link graphics/rendering/settings/runtime-settings!RuntimeSettings.colorPalette}.
 * @returns A class with constructor `new Hexagon(center: vec2, radius: number)`.
 * `center` is the position in world coordinates; `radius` controls the size in world units.
 * Pass the class's static `descriptor` to {@link compile!compile}, then pass instances to
 * {@link graphics/rendering/renderer/renderer!Renderer.addDrawable}.
 *
 * @example
 * ```ts
 * import { HexagonFactory } from 'sdf-2d';
 *
 * const Hexagon = HexagonFactory([1, 0.5, 0]);
 * const hexagon = new Hexagon([160, 120], 30);
 * ```
 *
 * @category Drawable
 */
export const HexagonFactory = (color: vec3 | vec4 | number): typeof HexagonBase => {
  class Hexagon extends HexagonBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
            uniform vec2 hexagonCenters${_id}[HEXAGON_COUNT${_id}];
            uniform float hexagonSize${_id}[HEXAGON_COUNT${_id}];
  
            float hexagonMinDistance${_id}(vec2 target, out vec4 color) {
              color = ${codeForColorAccess(color)};
              float minDistance = 1000.0;
              for (int i = 0; i < HEXAGON_COUNT${_id}; i++) {
                const vec3 k = vec3(-0.866025404,0.5,0.577350269);
                float r = hexagonSize${_id}[i];
                vec2 p = abs(target - hexagonCenters${_id}[i]);
                float cosa = 0.8660;
                float sina = 0.5;
                p = vec2(cosa * p.x - sina * p.y, sina * p.x + cosa * p.y);
                p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
                p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
                float dist = length(p)*sign(p.y);
                minDistance = min(minDistance, dist);
              }
  
              return minDistance;
            }
          `,
        distanceFunctionName: `hexagonMinDistance${_id}`,
      },
      propertyUniformMapping: {
        center: `hexagonCenters${_id}`,
        radius: `hexagonSize${_id}`,
      },
      uniformCountMacroName: `HEXAGON_COUNT${_id}`,
      shaderCombinationSteps: [0, 1, 2, 3, 8, 16],
      empty: new Hexagon(vec2.create(), 0),
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

  _id++;

  return Hexagon;
};
