import { vec2 } from 'gl-matrix';
import { Drawable } from '../../drawables/drawable';
import { DrawableDescriptor } from '../../drawables/drawable-descriptor';
import { LightDrawable } from '../../drawables/lights/light-drawable';
import { msToString } from '../../helper/ms-to-string';
import { DefaultFrameBuffer } from '../graphics-library/frame-buffer/default-frame-buffer';
import { IntermediateFrameBuffer } from '../graphics-library/frame-buffer/intermediate-frame-buffer';
import { WebGlStopwatch } from '../graphics-library/helper/stopwatch';
import { PaletteTexture } from '../graphics-library/palette-texture';
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
  private readonly gl: UniversalRenderingContext;
  private stopwatch?: WebGlStopwatch;
  private uniformsProvider: UniformsProvider;
  private distanceFieldFrameBuffer: IntermediateFrameBuffer;
  private distancePass: DistanceRenderPass;
  private lightingFrameBuffer: DefaultFrameBuffer;
  private lightsPass: LightsRenderPass;
  private palette?: PaletteTexture;
  private autoscaler: FpsAutoscaler;

  private applyRuntimeSettings: {
    [key: string]: (value: any) => void;
  } = {
    enableHighDpiRendering: (v) => {
      this.distanceFieldFrameBuffer.enableHighDpiRendering = v;
      this.lightingFrameBuffer.enableHighDpiRendering = v;
    },
    tileMultiplier: (v) => (this.distancePass.tileMultiplier = v),
    isWorldInverted: (v) => (this.distancePass.isWorldInverted = v),
    shadowLength: (v) => (this.uniformsProvider.shadowLength = v),
    ambientLight: (v) => (this.uniformsProvider.ambientLight = v),
    lightCutoffDistance: (v) => (this.lightsPass.lightCutoffDistance = v),
    colorPalette: (v) => this.palette!.setPalette(v),
  };

  private static defaultStartupSettings: StartupSettings = {
    shadowTraceCount: 16,
    paletteSize: 4,
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

    this.queryPrecisions();

    this.autoscaler = new FpsAutoscaler({
      distanceRenderScale: (v) =>
        (this.distanceFieldFrameBuffer.renderScale = v as number),
      finalRenderScale: (v) => (this.lightingFrameBuffer.renderScale = v as number),
    });
  }

  public async initialize(settingsOverrides: Partial<StartupSettings>): Promise<void> {
    const settings = {
      ...RendererImplementation.defaultStartupSettings,
      ...settingsOverrides,
    };

    this.palette = new PaletteTexture(this.gl, settings.paletteSize);
    const promises: Array<Promise<void>> = [];

    promises.push(
      this.distancePass.initialize(
        this.gl.isWebGL2
          ? [distanceVertexShader, distanceFragmentShader]
          : [distanceVertexShader100, distanceFragmentShader100],
        this.descriptors.filter(RendererImplementation.hasSdf),
        {
          paletteSize: settings.paletteSize,
        }
      )
    );
    promises.push(
      this.lightsPass.initialize(
        this.gl.isWebGL2
          ? [lightsVertexShader, lightsFragmentShader]
          : [lightsVertexShader100, lightsFragmentShader100],
        this.descriptors.filter((d) => !RendererImplementation.hasSdf(d)),
        {
          shadowTraceCount: settings.shadowTraceCount.toString(),
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

  private queryPrecisions() {
    const precisionToObject = (shader: GLenum, precision: GLenum) => {
      const toExponent = (v: number): string => `2^${v}`;
      const p = this.gl.getShaderPrecisionFormat(shader, precision)!;
      return {
        range: `[${toExponent(p.rangeMin)}, ${toExponent(p.rangeMax)}]`,
        precision: toExponent(p.precision),
      };
    };

    Insights.setValue('precisions', {
      'vertex shader': {
        'low float': precisionToObject(this.gl.VERTEX_SHADER, this.gl.LOW_FLOAT),
        'medium float': precisionToObject(this.gl.VERTEX_SHADER, this.gl.MEDIUM_FLOAT),
        'high float': precisionToObject(this.gl.VERTEX_SHADER, this.gl.HIGH_FLOAT),
      },
      'fragment shader': {
        'low float': precisionToObject(this.gl.FRAGMENT_SHADER, this.gl.LOW_FLOAT),
        'medium float': precisionToObject(this.gl.FRAGMENT_SHADER, this.gl.MEDIUM_FLOAT),
        'high float': precisionToObject(this.gl.FRAGMENT_SHADER, this.gl.HIGH_FLOAT),
      },
    });
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
      // texture units
      distanceTexture: 0,
      palette: 1,
      // regular uniforms
      distanceNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
      shadingNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
    };

    this.distancePass.render(this.uniformsProvider.getUniforms(common));
    this.lightsPass.render(
      this.uniformsProvider.getUniforms(common),
      this.distanceFieldFrameBuffer.colorTexture,
      this.palette!.colorTexture
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
    this.palette!.destroy();
  }
}
