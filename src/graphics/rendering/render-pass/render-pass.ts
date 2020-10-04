import { DrawableDescriptor } from '../../../drawables/drawable-descriptor';
import { FrameBuffer } from '../../graphics-library/frame-buffer/frame-buffer';
import { ParallelCompiler } from '../../graphics-library/parallel-compiler';
import { UniformArrayAutoScalingProgram } from '../../graphics-library/program/uniform-array-autoscaling-program';
import { UniversalRenderingContext } from '../../graphics-library/universal-rendering-context';

/** @internal */
export abstract class RenderPass {
  protected program: UniformArrayAutoScalingProgram;

  constructor(
    protected readonly gl: UniversalRenderingContext,
    protected frame: FrameBuffer
  ) {
    this.program = new UniformArrayAutoScalingProgram(gl);
  }

  public async initialize(
    shaderSources: [string, string],
    descriptors: Array<DrawableDescriptor>,
    compiler: ParallelCompiler,
    substitutions: { [name: string]: any } = {}
  ): Promise<void> {
    await this.program.initialize(shaderSources, descriptors, compiler, substitutions);
  }

  public destroy(): void {
    this.frame.destroy();
    this.program.destroy();
  }
}
