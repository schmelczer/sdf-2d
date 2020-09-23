import { vec2 } from 'gl-matrix';
import { LightDrawable } from '../../../drawables/lights/light-drawable';
import { clamp01 } from '../../../helper/clamp';
import { Insights } from '../insights';
import { RenderPass } from './render-pass';

export class LightsRenderPass extends RenderPass {
  public lightCutoffDistance = 400;
  private drawables: Array<LightDrawable> = [];

  public addDrawable(drawable: LightDrawable) {
    this.drawables.push(drawable);
  }

  public render(commonUniforms: any, ...inputTextures: Array<WebGLTexture>) {
    this.frame.bindAndClear(inputTextures);

    const tileCenterWorldCoordinates = vec2.transformMat2d(
      vec2.create(),
      vec2.fromValues(0.5, 0.5),
      commonUniforms.uvToWorld
    );

    const drawablesNearTile = this.drawables.filter((l) => {
      const d = vec2.subtract(
        vec2.create(),
        [
          Math.abs(l.center.x - tileCenterWorldCoordinates.x),
          Math.abs(l.center.y - tileCenterWorldCoordinates.y),
        ],
        vec2.scale(vec2.create(), commonUniforms.worldAreaInView, 0.5)
      );
      const distance =
        vec2.length([Math.max(d.x, 0), Math.max(d.y, 0)]) +
        Math.min(Math.max(d.x, d.y), 0.0);
      l.setLightnessRatio(clamp01(1 - distance / this.lightCutoffDistance));

      return distance < this.lightCutoffDistance;
    });

    drawablesNearTile.forEach((p) =>
      p.serializeToUniforms(
        commonUniforms,
        commonUniforms.transformWorldToNDC,
        commonUniforms.scaleWorldLengthToNDC
      )
    );

    this.program.draw(commonUniforms);

    Insights.setValue(
      ['render pass', 'lights', 'rendered drawables'],
      drawablesNearTile.length
    );

    this.drawables = [];
  }
}
