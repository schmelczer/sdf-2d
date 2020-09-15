import { vec2 } from 'gl-matrix';
import { IDrawable } from '../drawables/i-drawable';
import { IDrawableDescriptor } from '../drawables/i-drawable-descriptor';
import { FrameBuffer } from '../graphics-library/frame-buffer/frame-buffer';
import { UniformArrayAutoScalingProgram } from '../graphics-library/program/uniform-array-autoscaling-program';
import { settings } from '../settings';

export class RenderingPass {
  private drawables: Array<IDrawable> = [];
  private program: UniformArrayAutoScalingProgram;

  constructor(
    gl: WebGL2RenderingContext,
    shaderSources: [string, string],
    drawableDescriptors: Array<IDrawableDescriptor>,
    private frame: FrameBuffer
  ) {
    this.program = new UniformArrayAutoScalingProgram(
      gl,
      shaderSources,
      drawableDescriptors
    );
  }

  public async initialize(): Promise<void> {
    await this.program.initialize();
  }

  public addDrawable(drawable: IDrawable) {
    this.drawables.push(drawable);
  }

  public render(commonUniforms: any, inputTexture?: WebGLTexture) {
    this.frame.bindAndClear(inputTexture);

    const stepsInUV = 1 / settings.tileMultiplier;

    const worldR =
      0.5 *
      vec2.length(vec2.scale(vec2.create(), commonUniforms.worldAreaInView, stepsInUV));

    const radiusInNDC = worldR * commonUniforms.scaleWorldLengthToNDC;

    const stepsInNDC = 2 * stepsInUV;

    for (let x = -1; x < 1; x += stepsInNDC) {
      for (let y = -1; y < 1; y += stepsInNDC) {
        const uniforms = { ...commonUniforms, maxMinDistance: 0.0 };

        const ndcBottomLeft = vec2.fromValues(x, y);

        this.program.setDrawingRectangleUV(
          [(ndcBottomLeft.x + 1) / 2, (ndcBottomLeft.y + 1) / 2],
          vec2.fromValues(stepsInUV, stepsInUV)
        );

        const tileCenterWorldCoordinates = vec2.transformMat2d(
          vec2.create(),
          vec2.add(
            vec2.create(),
            [(ndcBottomLeft.x + 1) / 2, (ndcBottomLeft.y + 1) / 2],
            vec2.fromValues(stepsInUV / 2, stepsInUV / 2)
          ),
          uniforms.uvToWorld
        );

        const primitivesNearTile = this.drawables.filter(
          (d) => d.distance(tileCenterWorldCoordinates) < 2 * worldR
        );

        primitivesNearTile.forEach((p) =>
          p.serializeToUniforms(
            uniforms,
            uniforms.scaleWorldLengthToNDC,
            uniforms.transformWorldToNDC
          )
        );

        this.program.bindAndSetUniforms(uniforms);
        this.program.draw();
      }
    }

    this.drawables = [];
  }
}
