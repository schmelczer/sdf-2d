import { vec2 } from 'gl-matrix';
import { Drawable } from '../../../drawables/drawable';
import { Insights } from '../insights';
import { RenderPass } from './render-pass';

/** @internal */
export class DistanceRenderPass extends RenderPass {
  public tileMultiplier!: number;
  public isWorldInverted!: boolean;

  private drawables: Array<Drawable> = [];

  public addDrawable(drawable: Drawable) {
    this.drawables.push(drawable);
  }

  public render(commonUniforms: any, ...inputTextures: Array<WebGLTexture>) {
    this.frame.bindAndClear(inputTextures);

    const stepsInUV = 1 / this.tileMultiplier;

    const worldR =
      0.5 *
      vec2.length(vec2.scale(vec2.create(), commonUniforms.worldAreaInView, stepsInUV));

    const radiusInNDC = worldR * commonUniforms.scaleWorldLengthToNDC;

    const stepsInNDC = 2 * stepsInUV;

    let drawnDrawablesCount = 0;
    for (let x = -1; x < 1; x += stepsInNDC) {
      for (let y = -1; y < 1; y += stepsInNDC) {
        const uniforms = {
          ...commonUniforms,
          maxMinDistance: radiusInNDC * (this.isWorldInverted ? -1 : 1),
        };

        const uvBottomLeft = vec2.fromValues(x / 2 + 0.5, y / 2 + 0.5);

        this.program.setDrawingRectangleUV(
          uvBottomLeft,
          vec2.fromValues(stepsInUV, stepsInUV)
        );

        const tileCenterWorldCoordinates = vec2.transformMat2d(
          vec2.create(),
          vec2.add(
            vec2.create(),
            uvBottomLeft,
            vec2.fromValues(stepsInUV / 2, stepsInUV / 2)
          ),
          uniforms.uvToWorld
        );

        const drawablesNearTile = this.drawables.filter(
          (d) => d.minDistance(tileCenterWorldCoordinates) < 2 * worldR
        );

        drawnDrawablesCount += drawablesNearTile.length;

        drawablesNearTile.forEach((p) =>
          p.serializeToUniforms(
            uniforms,
            uniforms.transformWorldToNDC,
            uniforms.scaleWorldLengthToNDC
          )
        );

        this.program.draw(uniforms);
      }
    }

    Insights.setValue(
      ['render pass', 'distance', 'all drawables'],
      this.drawables.length
    );
    Insights.setValue(
      ['render pass', 'distance', 'tile count'],
      this.tileMultiplier ** 2
    );
    Insights.setValue(
      ['render pass', 'distance', 'rendered drawables'],
      drawnDrawablesCount / this.tileMultiplier ** 2
    );

    this.drawables = [];
  }
}
