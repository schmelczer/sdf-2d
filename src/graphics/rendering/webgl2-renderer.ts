import { vec2 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { CircleLight } from '../../drawables/lights/circle-light';
import { Flashlight } from '../../drawables/lights/flashlight';
import { Circle } from '../../drawables/shapes/circle';
import { DefaultFrameBuffer } from '../graphics-library/frame-buffer/default-frame-buffer';
import { IntermediateFrameBuffer } from '../graphics-library/frame-buffer/intermediate-frame-buffer';
import { getWebGl2Context } from '../graphics-library/helper/get-webgl2-context';
import { WebGlStopwatch } from '../graphics-library/helper/stopwatch';
import { IRenderer } from '../i-renderer';
import distanceFragmentShader from '../shaders/distance-fs.glsl';
import distanceVertexShader from '../shaders/distance-vs.glsl';
import lightsFragmentShader from '../shaders/shading-fs.glsl';
import lightsVertexShader from '../shaders/shading-vs.glsl';
import { FpsAutoscaler } from './fps-autoscaler';
import { RenderingPass } from './rendering-pass';
import { UniformsProvider } from './uniforms-provider';

export class WebGl2Renderer implements IRenderer {
  private gl: WebGL2RenderingContext;
  private stopwatch?: WebGlStopwatch;
  private uniformsProvider: UniformsProvider;
  private distanceFieldFrameBuffer: IntermediateFrameBuffer;
  private lightingFrameBuffer: DefaultFrameBuffer;
  private distancePass: RenderingPass;
  private lightingPass: RenderingPass;
  private autoscaler: FpsAutoscaler;

  private initializePromise: Promise<[void, void]>;

  constructor(private canvas: HTMLCanvasElement) {
    this.gl = getWebGl2Context(canvas);

    this.distanceFieldFrameBuffer = new IntermediateFrameBuffer(this.gl);
    this.lightingFrameBuffer = new DefaultFrameBuffer(this.gl);

    this.distancePass = new RenderingPass(
      this.gl,
      [distanceVertexShader, distanceFragmentShader],
      [Circle.descriptor],
      this.distanceFieldFrameBuffer
    );

    this.lightingPass = new RenderingPass(
      this.gl,
      [lightsVertexShader, lightsFragmentShader],
      [CircleLight.descriptor, Flashlight.descriptor],
      this.lightingFrameBuffer
    );

    this.initializePromise = Promise.all([
      this.distancePass.initialize(),
      this.lightingPass.initialize(),
    ]);

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

  public async initialize(): Promise<void> {
    await this.initializePromise;
  }

  public drawShape(shape: Drawable) {
    this.distancePass.addDrawable(shape);
  }

  public drawLight(light: Drawable) {
    this.lightingPass.addDrawable(light);
  }

  public startFrame(deltaTime: DOMHighResTimeStamp) {
    this.autoscaler.autoscale(deltaTime);

    this.stopwatch?.start();

    this.distanceFieldFrameBuffer.setSize();
    this.lightingFrameBuffer.setSize();
  }

  public finishFrame() {
    const common = {
      distanceNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
      shadingNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
    };

    this.distancePass.render(this.uniformsProvider.getUniforms(common));
    this.lightingPass.render(
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
