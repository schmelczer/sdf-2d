import { mat2d, vec2 } from 'gl-matrix';
import { clamp01 } from '../../helper/clamp';
import { mix } from '../../helper/mix';
import { Drawable } from '../drawable';
import { DrawableDescriptor } from '../drawable-descriptor';

export class Tunnel extends Drawable {
  public static descriptor: DrawableDescriptor = {
    sdf: {
      shader: `
        uniform vec2 froms[TUNNEL_COUNT];
        uniform vec2 toFromDeltas[TUNNEL_COUNT];
        uniform float fromRadii[TUNNEL_COUNT];
        uniform float toRadii[TUNNEL_COUNT];
      
        void tunnelMinDistance(inout float minDistance, inout float color) {
          float myMinDistance = minDistance;
          for (int i = 0; i < TUNNEL_COUNT; i++) {
            vec2 targetFromDelta = position - froms[i];
            
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
    
            myMinDistance = min(myMinDistance, currentDistance);
          }
    
          color = mix(2.0, color, step(
            distanceNdcPixelSize + SURFACE_OFFSET,
            myMinDistance
          ));
          minDistance = min(minDistance, myMinDistance);
        }
      `,
      distanceFunctionName: 'tunnelMinDistance',
    },
    propertyUniformMapping: {
      from: 'froms',
      toFromDelta: 'toFromDeltas',
      fromRadius: 'fromRadii',
      toRadius: 'toRadii',
    },
    uniformCountMacroName: 'TUNNEL_COUNT',
    shaderCombinationSteps: [0, 1, 4, 16, 32],
    empty: new Tunnel(
      vec2.fromValues(-100000, -100000),
      vec2.fromValues(-100000, -100000),
      0,
      0
    ),
  };

  constructor(
    public readonly from: vec2,
    public readonly to: vec2,
    public readonly fromRadius: number,
    public readonly toRadius: number
  ) {
    super();
  }

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
