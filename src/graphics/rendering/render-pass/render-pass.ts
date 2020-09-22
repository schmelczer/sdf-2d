import { DrawableDescriptor } from '../../../drawables/drawable-descriptor';
import { FrameBuffer } from '../../graphics-library/frame-buffer/frame-buffer';
import { UniformArrayAutoScalingProgram } from '../../graphics-library/program/uniform-array-autoscaling-program';
import { UniversalRenderingContext } from '../../graphics-library/universal-rendering-context';

export abstract class RenderPass {
  protected program: UniformArrayAutoScalingProgram;

  constructor(gl: UniversalRenderingContext, protected frame: FrameBuffer) {
    this.program = new UniformArrayAutoScalingProgram(gl);
  }

  public async initialize(
    shaderSources: [string, string],
    descriptors: Array<DrawableDescriptor>,
    substitutions: { [name: string]: any } = {}
  ): Promise<void> {
    await this.program.initialize(shaderSources, descriptors, substitutions);
  }

  public abstract render(commonUniforms: any, inputTexture?: WebGLTexture): void;

  public destroy(): void {
    this.frame.destroy();
    this.program.destroy();
  }
}
