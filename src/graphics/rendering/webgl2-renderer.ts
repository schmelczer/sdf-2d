import { vec2, vec3 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { DrawableDescriptor } from '../../drawables/drawable-descriptor';
import { CircleLight } from '../../drawables/lights/circle-light';
import { Flashlight } from '../../drawables/lights/flashlight';
import { DefaultFrameBuffer } from '../graphics-library/frame-buffer/default-frame-buffer';
import { IntermediateFrameBuffer } from '../graphics-library/frame-buffer/intermediate-frame-buffer';
import { getWebGl2Context } from '../graphics-library/helper/get-webgl2-context';
import { WebGlStopwatch } from '../graphics-library/helper/stopwatch';
import { FpsAutoscaler } from './fps-autoscaler';
import { Insights } from './insights';
import { Renderer } from './renderer';
import { RenderingPass } from './rendering-pass';
import { RenderingPassName } from './rendering-pass-name';
import distanceFragmentShader from './shaders/distance-fs.glsl';
import distanceVertexShader from './shaders/distance-vs.glsl';
import lightsFragmentShader from './shaders/shading-fs.glsl';
import lightsVertexShader from './shaders/shading-vs.glsl';
import { UniformsProvider } from './uniforms-provider';
import { WebGl2RendererSettings } from './webgl2-renderer-settings';

type Passes = { [key in keyof typeof RenderingPassName]: RenderingPass };

export class WebGl2Renderer implements Renderer {
  private gl: WebGL2RenderingContext;
  private stopwatch?: WebGlStopwatch;
  private uniformsProvider: UniformsProvider;
  private distanceFieldFrameBuffer: IntermediateFrameBuffer;
  private lightingFrameBuffer: DefaultFrameBuffer;
  private passes: Passes;
  private autoscaler: FpsAutoscaler;

  private static defaultSettings: WebGl2RendererSettings = {
    enableHighDpiRendering: true,
    enableStopwatch: true,
    tileMultiplier: 8,
    shaderMacros: {
      softShadowTraceCount: '128',
      hardShadowTraceCount: '32',
    },
  };

  constructor(
    private canvas: HTMLCanvasElement,
    descriptors: Array<DrawableDescriptor>,
    palette: Array<vec3>,
    settingsOverrides: Partial<WebGl2RendererSettings>
  ) {
    const settings = { ...WebGl2Renderer.defaultSettings, ...settingsOverrides };

    this.gl = getWebGl2Context(canvas);

    this.distanceFieldFrameBuffer = new IntermediateFrameBuffer(
      this.gl,
      settings.enableHighDpiRendering
    );
    this.lightingFrameBuffer = new DefaultFrameBuffer(
      this.gl,
      settings.enableHighDpiRendering
    );

    this.passes = this.createPasses(descriptors, palette, settings);

    this.uniformsProvider = new UniformsProvider(this.gl);

    this.autoscaler = new FpsAutoscaler({
      distanceRenderScale: (v) =>
        (this.distanceFieldFrameBuffer.renderScale = v as number),
      finalRenderScale: (v) => (this.lightingFrameBuffer.renderScale = v as number),
      softShadowsEnabled: (v) =>
        (this.uniformsProvider.softShadowsEnabled = v as boolean),
    });

    if (settings.enableStopwatch) {
      try {
        this.stopwatch = new WebGlStopwatch(this.gl);
      } catch {
        // no problem
      }
    }
  }

  @Insights.measure('create render passes')
  private createPasses(
    descriptors: Array<DrawableDescriptor>,
    palette: Array<vec3>,
    settings: WebGl2RendererSettings
  ): Passes {
    const allDescriptors = [
      ...descriptors,
      CircleLight.descriptor,
      Flashlight.descriptor,
    ];

    return {
      [RenderingPassName.distance]: new RenderingPass(
        this.gl,
        [distanceVertexShader, distanceFragmentShader],
        allDescriptors.filter(WebGl2Renderer.hasSdf),
        this.distanceFieldFrameBuffer,
        settings.shaderMacros,
        settings.tileMultiplier
      ),
      [RenderingPassName.pixel]: new RenderingPass(
        this.gl,
        [lightsVertexShader, lightsFragmentShader],
        allDescriptors.filter((d) => !WebGl2Renderer.hasSdf(d)),
        this.lightingFrameBuffer,
        {
          palette: this.generatePaletteCode(palette),
          ...settings.shaderMacros,
        },
        settings.tileMultiplier
      ),
    };
  }

  public get insights(): any {
    return Insights.values;
  }

  public destroy(): void {
    // todo
    /*const extension = enableExtension(this.gl, 'WEBGL_lose_context');
    extension.loseContext();
    extension.restoreContext();*/
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

  private generatePaletteCode(palette: Array<vec3>) {
    const numberToGlslFloat = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);
    return palette
      .map(
        (c) =>
          `vec3(${numberToGlslFloat(c[0])}, ${numberToGlslFloat(
            c[1]
          )}, ${numberToGlslFloat(c[2])})`
      )
      .join(',\n');
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
