import { vec2 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { DrawableDescriptor } from '../../drawables/drawable-descriptor';
import { FrameBuffer } from '../graphics-library/frame-buffer/frame-buffer';
import { UniformArrayAutoScalingProgram } from '../graphics-library/program/uniform-array-autoscaling-program';

export class RenderingPass {
  private drawables: Array<Drawable> = [];
  private program: UniformArrayAutoScalingProgram;

  constructor(
    gl: WebGL2RenderingContext,
    private frame: FrameBuffer,
    private tileMultiplier: number
  ) {
    this.program = new UniformArrayAutoScalingProgram(gl);
  }

  public async initialize(
    shaderSources: [string, string],
    descriptors: Array<DrawableDescriptor>,
    substitutions: { [name: string]: any }
  ): Promise<void> {
    await this.program.initialize(shaderSources, descriptors, substitutions);
  }

  public addDrawable(drawable: Drawable) {
    this.drawables.push(drawable);
  }

  public render(commonUniforms: any, inputTexture?: WebGLTexture) {
    this.frame.bindAndClear(inputTexture);

    const stepsInUV = 1 / this.tileMultiplier;

    const worldR =
      0.5 *
      vec2.length(vec2.scale(vec2.create(), commonUniforms.worldAreaInView, stepsInUV));

    const radiusInNDC = worldR * commonUniforms.scaleWorldLengthToNDC;

    const stepsInNDC = 2 * stepsInUV;

    for (let x = -1; x < 1; x += stepsInNDC) {
      for (let y = -1; y < 1; y += stepsInNDC) {
        const uniforms = { ...commonUniforms, maxMinDistance: radiusInNDC };

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
            uniforms.transformWorldToNDC,
            uniforms.scaleWorldLengthToNDC
          )
        );

        this.program.bindAndSetUniforms(uniforms);
        this.program.draw();
      }
    }

    this.drawables = [];
  }
}
