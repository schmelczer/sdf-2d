import { mat2d, vec2, vec3, vec4 } from 'gl-matrix';
import { codeForColorAccess } from '../../helper/code-for-color-access';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';

/**
 * @category Drawable
 */
class HexagonBase extends EmptyDrawable {
  constructor(public center: vec2, public radius: number) {
    super();
  }
}

/**
 * @category Drawable
 */
export const HexagonFactory = (color: vec3 | vec4 | number): typeof HexagonBase => {
  class Hexagon extends HexagonBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
            uniform vec2 hexagonCenters[HEXAGON_COUNT];
            uniform float hexagonSize[HEXAGON_COUNT];
  
            float hexagonMinDistance(vec2 target, out vec4 color) {
              color = ${codeForColorAccess(color)};
              float minDistance = 1000.0;
              for (int i = 0; i < HEXAGON_COUNT; i++) {
                const vec3 k = vec3(-0.866025404,0.5,0.577350269);
                float r = hexagonSize[i];
                vec2 p = abs(target - hexagonCenters[i]);
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
        distanceFunctionName: 'hexagonMinDistance',
      },
      propertyUniformMapping: {
        center: 'hexagonCenters',
        radius: 'hexagonSize',
      },
      uniformCountMacroName: 'HEXAGON_COUNT',
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

  return Hexagon;
};
