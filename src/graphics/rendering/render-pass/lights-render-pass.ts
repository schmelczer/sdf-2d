import { vec2 } from 'gl-matrix';
import { LightDrawable } from '../../../drawables/lights/light-drawable';
import { clamp01 } from '../../../helper/clamp';
import { Texture } from '../../graphics-library/texture/texture';
import { RenderPass } from './render-pass';

/** @internal */
export class LightsRenderPass extends RenderPass {
  public lightCutoffDistance!: number;
  private drawables: Array<LightDrawable> = [];

  public addDrawable(drawable: LightDrawable) {
    this.drawables.push(drawable);
  }

  public render(commonUniforms: any, inputTextures: Array<Texture>) {
    this.frame.bindAndClear(inputTextures);

    const tileCenterWorldCoordinates = vec2.transformMat2d(
      vec2.create(),
      vec2.fromValues(0.5, 0.5),
      commonUniforms.uvToWorld
    );

    const halfViewAreaX = commonUniforms.worldAreaInView.x / 2;
    const halfViewAreaY = commonUniforms.worldAreaInView.y / 2;

    const drawablesNearTile = this.drawables.filter((l) => {
      const dX = Math.abs(l.center.x - tileCenterWorldCoordinates.x) - halfViewAreaX;
      const dY = Math.abs(l.center.y - tileCenterWorldCoordinates.y) - halfViewAreaY;
      const distance =
        Math.hypot(Math.max(dX, 0), Math.max(dY, 0)) + Math.min(Math.max(dX, dY), 0);
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

    this.gl.insights.renderPasses.lights.drawnDrawableCount = drawablesNearTile.length;

    this.drawables = [];
  }
}
