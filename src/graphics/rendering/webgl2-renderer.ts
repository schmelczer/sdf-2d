import { vec2, vec3 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { DrawableDescriptor } from '../../drawables/drawable-descriptor';
import { DefaultFrameBuffer } from '../graphics-library/frame-buffer/default-frame-buffer';
import { IntermediateFrameBuffer } from '../graphics-library/frame-buffer/intermediate-frame-buffer';
import { getWebGl2Context } from '../graphics-library/helper/get-webgl2-context';
import { WebGlStopwatch } from '../graphics-library/helper/stopwatch';
import { ParallelCompiler } from '../graphics-library/parallel-compiler';
import { FpsAutoscaler } from './fps-autoscaler';
import { Insights } from './insights';
import { Renderer } from './renderer';
import { RenderingPass } from './rendering-pass';
import { RenderingPassName } from './rendering-pass-name';
import { RuntimeSettings } from './runtime-settings';
import distanceFragmentShader from './shaders/distance-fs.glsl';
import distanceVertexShader from './shaders/distance-vs.glsl';
import lightsFragmentShader from './shaders/shading-fs.glsl';
import lightsVertexShader from './shaders/shading-vs.glsl';
import { StartupSettings } from './startup-settings';
import { UniformsProvider } from './uniforms-provider';

type Passes = { [key in keyof typeof RenderingPassName]: RenderingPass };

export class WebGl2Renderer implements Renderer {
  private gl: WebGL2RenderingContext;
  private stopwatch?: WebGlStopwatch;
  private uniformsProvider: UniformsProvider;
  private distanceFieldFrameBuffer: IntermediateFrameBuffer;
  private lightingFrameBuffer: DefaultFrameBuffer;
  private passes: Passes;
  private autoscaler: FpsAutoscaler;

  private applyRuntimeSettings: {
    [key: string]: (value: any) => void;
  } = {
    enableHighDpiRendering: (v) => {
      this.distanceFieldFrameBuffer.enableHighDpiRendering = v;
      this.lightingFrameBuffer.enableHighDpiRendering = v;
    },
    tileMultiplier: (v) => {
      this.passes[RenderingPassName.distance].tileMultiplier = v;
      this.passes[RenderingPassName.pixel].tileMultiplier = v;
    },
    isWorldInverted: (v) => {
      this.passes[RenderingPassName.distance].isWorldInverted = v;
      this.passes[RenderingPassName.pixel].isWorldInverted = v;
    },
    ambientLight: (v) => {
      this.uniformsProvider.ambientLight = v;
    },
  };

  private static defaultStartupSettings: StartupSettings = {
    enableStopwatch: true,
    softShadowTraceCount: '128',
    hardShadowTraceCount: '32',
  };

  setRuntimeSettings(overrides: Partial<RuntimeSettings>): void {
    Object.entries(overrides).forEach((k, v) => {
      this.applyRuntimeSettings[(k as unknown) as string](v);
    });
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private descriptors: Array<DrawableDescriptor>
  ) {
    this.gl = getWebGl2Context(canvas);

    ParallelCompiler.initialize(this.gl);

    this.distanceFieldFrameBuffer = new IntermediateFrameBuffer(this.gl);
    this.lightingFrameBuffer = new DefaultFrameBuffer(this.gl);

    this.passes = this.createPasses();

    this.uniformsProvider = new UniformsProvider(this.gl);

    this.autoscaler = new FpsAutoscaler({
      distanceRenderScale: (v) =>
        (this.distanceFieldFrameBuffer.renderScale = v as number),
      finalRenderScale: (v) => (this.lightingFrameBuffer.renderScale = v as number),
      softShadowsEnabled: (v) =>
        (this.uniformsProvider.softShadowsEnabled = v as boolean),
    });
  }

  @Insights.measure('create render passes')
  private createPasses(): Passes {
    return {
      [RenderingPassName.distance]: new RenderingPass(
        this.gl,
        this.distanceFieldFrameBuffer
      ),
      [RenderingPassName.pixel]: new RenderingPass(this.gl, this.lightingFrameBuffer),
    };
  }

  @Insights.measure('initialize render passes')
  public async initialize(
    palette: Array<vec3>,
    settingsOverrides: Partial<StartupSettings>
  ): Promise<void> {
    const settings = { ...WebGl2Renderer.defaultStartupSettings, ...settingsOverrides };

    const promises: Array<Promise<void>> = [];

    promises.push(
      this.passes[RenderingPassName.distance].initialize(
        [distanceVertexShader, distanceFragmentShader],
        this.descriptors.filter(WebGl2Renderer.hasSdf)
      )
    );

    promises.push(
      this.passes[RenderingPassName.pixel].initialize(
        [lightsVertexShader, lightsFragmentShader],
        this.descriptors.filter((d) => !WebGl2Renderer.hasSdf(d)),
        {
          palette: this.generatePaletteCode(palette),
          hardShadowTraceCount: settings.hardShadowTraceCount,
          softShadowTraceCount: settings.softShadowTraceCount,
        }
      )
    );

    ParallelCompiler.compilePrograms();

    await Promise.all(promises);

    if (settings.enableStopwatch) {
      try {
        this.stopwatch = new WebGlStopwatch(this.gl);
      } catch {
        // no problem
      }
    }
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

  public get viewAreaSize(): vec2 {
    return this.uniformsProvider.getViewArea();
  }

  public get canvasSize(): vec2 {
    return vec2.fromValues(this.canvas.clientWidth, this.canvas.clientHeight);
  }
}
