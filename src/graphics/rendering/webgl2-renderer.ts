import { vec2 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { DrawableDescriptor } from '../../drawables/drawable-descriptor';
import { DefaultFrameBuffer } from '../graphics-library/frame-buffer/default-frame-buffer';
import { IntermediateFrameBuffer } from '../graphics-library/frame-buffer/intermediate-frame-buffer';
import { getWebGl2Context } from '../graphics-library/helper/get-webgl2-context';
import { WebGlStopwatch } from '../graphics-library/helper/stopwatch';
import distanceFragmentShader from '../shaders/distance-fs.glsl';
import distanceVertexShader from '../shaders/distance-vs.glsl';
import lightsFragmentShader from '../shaders/shading-fs.glsl';
import lightsVertexShader from '../shaders/shading-vs.glsl';
import { FpsAutoscaler } from './fps-autoscaler';
import { Renderer } from './renderer';
import { RenderingPass } from './rendering-pass';
import { RenderingPassName } from './rendering-pass-name';
import { UniformsProvider } from './uniforms-provider';

export class WebGl2Renderer implements Renderer {
  private gl: WebGL2RenderingContext;
  private stopwatch?: WebGlStopwatch;
  private uniformsProvider: UniformsProvider;
  private distanceFieldFrameBuffer: IntermediateFrameBuffer;
  private lightingFrameBuffer: DefaultFrameBuffer;
  private passes: { [key in keyof typeof RenderingPassName]: RenderingPass };
  private autoscaler: FpsAutoscaler;

  constructor(private canvas: HTMLCanvasElement, descriptors: Array<DrawableDescriptor>) {
    this.gl = getWebGl2Context(canvas);

    this.distanceFieldFrameBuffer = new IntermediateFrameBuffer(this.gl);
    this.lightingFrameBuffer = new DefaultFrameBuffer(this.gl);

    this.passes = {
      [RenderingPassName.distance]: new RenderingPass(
        this.gl,
        [distanceVertexShader, distanceFragmentShader],
        descriptors.filter(WebGl2Renderer.hasSdf),
        this.distanceFieldFrameBuffer
      ),
      [RenderingPassName.pixel]: new RenderingPass(
        this.gl,
        [lightsVertexShader, lightsFragmentShader],
        descriptors.filter((d) => !WebGl2Renderer.hasSdf(d)),
        this.lightingFrameBuffer
      ),
    };

    this.uniformsProvider = new UniformsProvider(this.gl);

    this.autoscaler = new FpsAutoscaler({
      distanceRenderScale: (v) =>
        (this.distanceFieldFrameBuffer.renderScale = v as number),
      finalRenderScale: (v) => (this.lightingFrameBuffer.renderScale = v as number),
      softShadowsEnabled: (v) =>
        (this.uniformsProvider.softShadowsEnabled = v as boolean),
    });

    try {
      this.stopwatch = new WebGlStopwatch(this.gl);
    } catch {
      // no problem
    }
  }

  private static hasSdf(descriptor: DrawableDescriptor) {
    return Object.prototype.hasOwnProperty.call(descriptor, 'sdf');
  }

  public addDrawable(drawable: Drawable): void {
    if (WebGl2Renderer.hasSdf((drawable.constructor as typeof Drawable).descriptor)) {
      this.passes[RenderingPassName.distance].addDrawable(drawable);
    } else {
      this.passes[RenderingPassName.pixel].addDrawable(drawable);
    }
  }

  public autoscaleQuality(deltaTime: DOMHighResTimeStamp) {
    this.autoscaler.autoscale(deltaTime);
  }

  public renderDrawables() {
    this.stopwatch?.start();

    this.distanceFieldFrameBuffer.setSize();
    this.lightingFrameBuffer.setSize();

    const common = {
      distanceNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
      shadingNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
    };

    this.passes[RenderingPassName.distance].render(
      this.uniformsProvider.getUniforms(common)
    );
    this.passes[RenderingPassName.pixel].render(
      this.uniformsProvider.getUniforms(common),
      this.distanceFieldFrameBuffer.colorTexture
    );

    this.stopwatch?.stop();
  }

  public setViewArea(topLeft: vec2, size: vec2) {
    this.uniformsProvider.setViewArea(topLeft, size);
  }

  public setCursorPosition(position: vec2) {
    this.uniformsProvider.setCursorPosition(position);
  }

  public get canvasSize(): vec2 {
    return vec2.fromValues(this.canvas.clientWidth, this.canvas.clientHeight);
  }
}
