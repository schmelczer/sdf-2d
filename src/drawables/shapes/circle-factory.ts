import { mat2d, vec2, vec3, vec4 } from 'gl-matrix';
import { codeForColorAccess } from '../../helper/code-for-color-access';
import { DrawableDescriptor } from '../drawable-descriptor';
import { EmptyDrawable } from '../empty-drawable';

/**
 * @category Drawable
 */
class CircleBase extends EmptyDrawable {
  constructor(
    public center: vec2,
    public radius: number
  ) {
    super();
  }
}

let _id = 0;

/**
 * Creates a drawable circle class with a shared color.
 *
 * @param color RGB or RGBA color, or an index into {@link graphics/rendering/settings/runtime-settings!RuntimeSettings.colorPalette}.
 * @returns A class with constructor `new Circle(center: vec2, radius: number)`.
 * `center` is the position in world coordinates; `radius` is in world units.
 * Pass the class's static `descriptor` to {@link compile!compile}, then pass instances to
 * {@link graphics/rendering/renderer/renderer!Renderer.addDrawable}.
 *
 * @example
 * ```ts
 * import { CircleFactory, compile } from 'sdf-2d';
 *
 * const Circle = CircleFactory([1, 0.5, 0]);
 * const circle = new Circle([160, 120], 30);
 * const canvas = document.createElement('canvas');
 * document.body.appendChild(canvas);
 * const renderer = await compile(canvas, [Circle.descriptor]);
 * renderer.addDrawable(circle);
 * renderer.renderDrawables();
 * ```
 *
 * @category Drawable
 */
export const CircleFactory = (color: vec3 | vec4 | number): typeof CircleBase => {
  class Circle extends CircleBase {
    public static descriptor: DrawableDescriptor = {
      sdf: {
        shader: `
            uniform vec2 circleCenters${_id}[CIRCLE_COUNT${_id}];
            uniform float circleRadii${_id}[CIRCLE_COUNT${_id}];

            float circleMinDistance${_id}(vec2 target, out vec4 color) {
              color = ${codeForColorAccess(color)};
              float minDistance = 1000.0;
              for (int i = 0; i < CIRCLE_COUNT${_id}; i++) {
                float dist = distance(circleCenters${_id}[i], target) - circleRadii${_id}[i];
                minDistance = min(minDistance, dist);
              }

              return minDistance;
            }
          `,
        distanceFunctionName: `circleMinDistance${_id}`,
      },
      propertyUniformMapping: {
        center: `circleCenters${_id}`,
        radius: `circleRadii${_id}`,
      },
      uniformCountMacroName: `CIRCLE_COUNT${_id}`,
      shaderCombinationSteps: [0, 1, 2, 3, 8, 16],
      empty: new Circle(vec2.create(), 0),
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

  return Circle;
};
