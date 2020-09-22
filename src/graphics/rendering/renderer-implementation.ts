import { vec2, vec3 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { DrawableDescriptor } from '../../drawables/drawable-descriptor';
import { LightDrawable } from '../../drawables/lights/light-drawable';
import { msToString } from '../../helper/ms-to-string';
import { DefaultFrameBuffer } from '../graphics-library/frame-buffer/default-frame-buffer';
import { IntermediateFrameBuffer } from '../graphics-library/frame-buffer/intermediate-frame-buffer';
import { WebGlStopwatch } from '../graphics-library/helper/stopwatch';
import { ParallelCompiler } from '../graphics-library/parallel-compiler';
import {
  getUniversalRenderingContext,
  UniversalRenderingContext,
} from '../graphics-library/universal-rendering-context';
import { FpsAutoscaler } from './fps-autoscaler';
import { Insights } from './insights';
import { DistanceRenderPass } from './render-pass/distance-render-pass';
import { LightsRenderPass } from './render-pass/lights-render-pass';
import { Renderer } from './renderer';
import { RuntimeSettings } from './settings/runtime-settings';
import { StartupSettings } from './settings/startup-settings';
import distanceFragmentShader100 from './shaders/distance-fs-100.glsl';
import distanceFragmentShader from './shaders/distance-fs.glsl';
import distanceVertexShader100 from './shaders/distance-vs-100.glsl';
import distanceVertexShader from './shaders/distance-vs.glsl';
import lightsFragmentShader100 from './shaders/shading-fs-100.glsl';
import lightsFragmentShader from './shaders/shading-fs.glsl';
import lightsVertexShader100 from './shaders/shading-vs-100.glsl';
import lightsVertexShader from './shaders/shading-vs.glsl';
import { UniformsProvider } from './uniforms-provider';

export class RendererImplementation implements Renderer {
  private gl: UniversalRenderingContext;
  private stopwatch?: WebGlStopwatch;
  private uniformsProvider: UniformsProvider;
  private distanceFieldFrameBuffer: IntermediateFrameBuffer;
  private distancePass: DistanceRenderPass;
  private lightsPass: LightsRenderPass;
  private lightingFrameBuffer: DefaultFrameBuffer;
  private autoscaler: FpsAutoscaler;

  private applyRuntimeSettings: {
    [key: string]: (value: any) => void;
  } = {
    enableHighDpiRendering: (v) => {
      this.distanceFieldFrameBuffer.enableHighDpiRendering = v;
      this.lightingFrameBuffer.enableHighDpiRendering = v;
    },
    tileMultiplier: (v) => {
      this.distancePass.tileMultiplier = v;
    },
    isWorldInverted: (v) => {
      this.distancePass.isWorldInverted = v;
    },
    shadowLength: (v) => {
      this.uniformsProvider.shadowLength = v;
    },
    ambientLight: (v) => {
      this.uniformsProvider.ambientLight = v;
    },
    lightCutoffDistance: (v) => {
      this.lightsPass.lightCutoffDistance = v;
    },
  };

  private static defaultStartupSettings: StartupSettings = {
    shadowTraceCount: '16',
  };

  setRuntimeSettings(overrides: Partial<RuntimeSettings>): void {
    Object.entries(overrides).forEach(([k, v]) => {
      this.applyRuntimeSettings[(k as unknown) as string](v);
    });
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private descriptors: Array<DrawableDescriptor>
  ) {
    this.gl = getUniversalRenderingContext(canvas);

    ParallelCompiler.initialize(this.gl);

    this.distanceFieldFrameBuffer = new IntermediateFrameBuffer(this.gl);
    this.lightingFrameBuffer = new DefaultFrameBuffer(this.gl);

    this.distancePass = new DistanceRenderPass(this.gl, this.distanceFieldFrameBuffer);
    this.lightsPass = new LightsRenderPass(this.gl, this.lightingFrameBuffer);

    this.uniformsProvider = new UniformsProvider(this.gl);

    this.autoscaler = new FpsAutoscaler({
      distanceRenderScale: (v) =>
        (this.distanceFieldFrameBuffer.renderScale = v as number),
      finalRenderScale: (v) => (this.lightingFrameBuffer.renderScale = v as number),
    });
  }

  public async initialize(
    palette: Array<vec3>,
    settingsOverrides: Partial<StartupSettings>
  ): Promise<void> {
    const settings = {
      ...RendererImplementation.defaultStartupSettings,
      ...settingsOverrides,
    };

    const promises: Array<Promise<void>> = [];

    promises.push(
      this.distancePass.initialize(
        this.gl.isWebGL2
          ? [distanceVertexShader, distanceFragmentShader]
          : [distanceVertexShader100, distanceFragmentShader100],
        this.descriptors.filter(RendererImplementation.hasSdf)
      )
    );
    promises.push(
      this.lightsPass.initialize(
        this.gl.isWebGL2
          ? [lightsVertexShader, lightsFragmentShader]
          : [lightsVertexShader100, lightsFragmentShader100],
        this.descriptors.filter((d) => !RendererImplementation.hasSdf(d)),
        {
          palette: this.generatePaletteCode(palette),
          colorCount: palette.length.toString(),
          shadowTraceCount: settings.shadowTraceCount,
        }
      )
    );

    ParallelCompiler.compilePrograms();

    await Promise.all(promises);

    try {
      this.stopwatch = new WebGlStopwatch(this.gl);
    } catch {
      // no problem
    }
  }

  public get insights(): any {
    return Insights.values;
  }

  private static hasSdf(descriptor: DrawableDescriptor) {
    return Object.prototype.hasOwnProperty.call(descriptor, 'sdf');
  }

  public addDrawable(drawable: Drawable): void {
    if (
      RendererImplementation.hasSdf((drawable.constructor as typeof Drawable).descriptor)
    ) {
      this.distancePass.addDrawable(drawable);
    } else {
      this.lightsPass.addDrawable(drawable as LightDrawable);
    }
  }

  public autoscaleQuality(deltaTime: DOMHighResTimeStamp) {
    this.autoscaler.autoscale(deltaTime);
  }

  private generatePaletteCode(palette: Array<vec3>) {
    const numberToGlslFloat = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);
    return palette
      .map(
        (c, i) =>
          `${this.gl.isWebGL2 ? '' : `colors[${i}] = `}vec3(${numberToGlslFloat(
            c[0]
          )}, ${numberToGlslFloat(c[1])}, ${numberToGlslFloat(c[2])})`
      )
      .join(this.gl.isWebGL2 ? ',\n' : ';\n');
  }

  public renderDrawables() {
    if (this.stopwatch) {
      if (this.stopwatch.isReady) {
        this.stopwatch.start();
      } else {
        this.stopwatch.tryGetResults();
        Insights.setValue(
          'GPU render time',
          msToString(this.stopwatch.resultsInMilliSeconds)
        );
      }
    }

    this.distanceFieldFrameBuffer.setSize();
    this.lightingFrameBuffer.setSize();

    const common = {
      distanceNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
      shadingNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
    };

    this.distancePass.render(this.uniformsProvider.getUniforms(common));
    this.lightsPass.render(
      this.uniformsProvider.getUniforms(common),
      this.distanceFieldFrameBuffer.colorTexture
    );

    if (this.stopwatch?.isRunning) {
      this.stopwatch?.stop();
    }
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

  public destroy(): void {
    this.distancePass.destroy();
    this.lightsPass.destroy();
  }
}
