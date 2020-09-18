import { vec2 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { DrawableDescriptor } from '../../drawables/drawable-descriptor';
import { FrameBuffer } from '../graphics-library/frame-buffer/frame-buffer';
import { UniformArrayAutoScalingProgram } from '../graphics-library/program/uniform-array-autoscaling-program';
import { Insights } from './insights';
import { RenderingPassName } from './rendering-pass-name';

export class RenderingPass {
  public tileMultiplier = 8;
  public isWorldInverted = false;

  private drawables: Array<Drawable> = [];
  private program: UniformArrayAutoScalingProgram;

  constructor(
    gl: WebGL2RenderingContext,
    private frame: FrameBuffer,
    private name: RenderingPassName
  ) {
    this.program = new UniformArrayAutoScalingProgram(gl);
  }

  public async initialize(
    shaderSources: [string, string],
    descriptors: Array<DrawableDescriptor>,
    substitutions: { [name: string]: any } = {}
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
          (d) => d.distance(tileCenterWorldCoordinates) < 2 * worldR
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

    Insights.setValue(['render pass', this.name, 'all drawables'], this.drawables.length);
    Insights.setValue(['render pass', this.name, 'tile count'], this.tileMultiplier ** 2);
    Insights.setValue(
      ['render pass', this.name, 'rendered drawables'],
      drawnDrawablesCount / this.tileMultiplier ** 2
    );

    this.drawables = [];
  }

  public destroy(): void {
    this.frame.destroy();
    this.program.destroy();
  }
}
