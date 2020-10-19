import { vec2 } from 'gl-matrix';
import { Drawable } from '../../../drawables/drawable';
import { DrawableDescriptor } from '../../../drawables/drawable-descriptor';
import { LightDrawable } from '../../../drawables/lights/light-drawable';
import { colorToString } from '../../../helper/color-to-string';
import { DefaultFrameBuffer } from '../../graphics-library/frame-buffer/default-frame-buffer';
import { IntermediateFrameBuffer } from '../../graphics-library/frame-buffer/intermediate-frame-buffer';
import { getHardwareInfo } from '../../graphics-library/helper/get-hardware-info';
import { WebGlStopwatch } from '../../graphics-library/helper/stopwatch';
import { ParallelCompiler } from '../../graphics-library/parallel-compiler';
import { ColorTexture } from '../../graphics-library/texture/color-texture';
import { DistanceTexture } from '../../graphics-library/texture/distance-texture';
import { PaletteTexture } from '../../graphics-library/texture/palette-texture';
import { Texture } from '../../graphics-library/texture/texture';
import { TextureWithOptions } from '../../graphics-library/texture/texture-options';
import {
  getUniversalRenderingContext,
  UniversalRenderingContext,
} from '../../graphics-library/universal-rendering-context';
import { DistanceRenderPass } from '../render-pass/distance-render-pass';
import { LightsRenderPass } from '../render-pass/lights-render-pass';
import { defaultRuntimeSettings } from '../settings/default-runtime-settings';
import { defaultStartupSettings } from '../settings/default-startup-settings';
import { RuntimeSettings } from '../settings/runtime-settings';
import { StartupSettings } from '../settings/startup-settings';
import distanceFragmentShader100 from '../shaders/distance-fs-100.glsl';
import distanceFragmentShader from '../shaders/distance-fs.glsl';
import distanceVertexShader100 from '../shaders/distance-vs-100.glsl';
import distanceVertexShader from '../shaders/distance-vs.glsl';
import lightsFragmentShader100 from '../shaders/shading-fs-100.glsl';
import lightsFragmentShader from '../shaders/shading-fs.glsl';
import lightsVertexShader100 from '../shaders/shading-vs-100.glsl';
import lightsVertexShader from '../shaders/shading-vs.glsl';
import { UniformsProvider } from '../uniforms-provider';
import { Renderer } from './renderer';
import { RendererInfo } from './renderer-info';

/** @internal */
export class RendererImplementation implements Renderer {
  private readonly gl: UniversalRenderingContext;
  private stopwatch?: WebGlStopwatch;
  private uniformsProvider: UniformsProvider;
  private distanceFieldFrameBuffer: IntermediateFrameBuffer;
  private distancePass: DistanceRenderPass;
  private lightingFrameBuffer: DefaultFrameBuffer;
  private lightsPass: LightsRenderPass;
  private palette!: PaletteTexture;

  private textures: Array<Texture> = [];

  private applyRuntimeSettings: {
    [key in keyof RuntimeSettings]: (value: any) => void;
  } = {
    enableHighDpiRendering: (v) => {
      this.distanceFieldFrameBuffer.enableHighDpiRendering = v;
      this.lightingFrameBuffer.enableHighDpiRendering = v;
    },
    tileMultiplier: (v) => (this.distancePass.tileMultiplier = v),
    isWorldInverted: (v) => (this.distancePass.isWorldInverted = v),
    distanceRenderScale: (v) => {
      this.distanceFieldFrameBuffer.renderScale = v;
      this.gl.insights.renderPasses.distance.renderScale = v;
    },
    lightsRenderScale: (v) => {
      this.lightingFrameBuffer.renderScale = v;
      this.gl.insights.renderPasses.lights.renderScale = v;
    },
    textures: this.setTextures.bind(this),
    ambientLight: (v) => (this.uniformsProvider.ambientLight = v),
    lightCutoffDistance: (v) => (this.lightsPass.lightCutoffDistance = v),
    colorPalette: (v) => this.palette.setPalette(v),
  };

  setRuntimeSettings(overrides: Partial<RuntimeSettings>): void {
    Object.entries(overrides).forEach(([k, v]) => {
      this.applyRuntimeSettings[k as keyof RuntimeSettings](v);
    });
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private descriptors: Array<DrawableDescriptor>,
    ignoreWebGL2?: boolean
  ) {
    this.gl = getUniversalRenderingContext(
      canvas,
      ignoreWebGL2 !== undefined ? ignoreWebGL2 : defaultStartupSettings.ignoreWebGL2
    );

    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);

    this.distanceFieldFrameBuffer = new IntermediateFrameBuffer(this.gl);
    this.lightingFrameBuffer = new DefaultFrameBuffer(this.gl);

    this.distancePass = new DistanceRenderPass(this.gl, this.distanceFieldFrameBuffer);
    this.lightsPass = new LightsRenderPass(this.gl, this.lightingFrameBuffer);

    this.uniformsProvider = new UniformsProvider(this.gl);

    this.setViewArea(
      vec2.fromValues(0, canvas.clientHeight),
      vec2.fromValues(canvas.clientWidth, canvas.clientHeight)
    );

    const hardwareInfo = getHardwareInfo(this.gl);
    this.gl.insights.renderer = hardwareInfo?.renderer;
    this.gl.insights.vendor = hardwareInfo?.vendor;
  }

  public async initialize(settingsOverrides: Partial<StartupSettings>): Promise<void> {
    const settings = {
      ...defaultStartupSettings,
      ...settingsOverrides,
    };

    this.palette = new PaletteTexture(this.gl, settings.paletteSize);
    this.setRuntimeSettings(defaultRuntimeSettings);

    const promises: Array<Promise<void>> = [];
    const compiler = new ParallelCompiler(this.gl);

    promises.push(
      this.distancePass.initialize(
        this.gl.isWebGL2
          ? [distanceVertexShader, distanceFragmentShader]
          : [distanceVertexShader100, distanceFragmentShader100],
        this.descriptors.filter(RendererImplementation.hasSdf),
        compiler,
        {
          paletteSize: settings.paletteSize,
          backgroundColor: colorToString(settings.backgroundColor),
        }
      )
    );
    promises.push(
      this.lightsPass.initialize(
        this.gl.isWebGL2
          ? [lightsVertexShader, lightsFragmentShader]
          : [lightsVertexShader100, lightsFragmentShader100],
        this.descriptors.filter((d) => !RendererImplementation.hasSdf(d)),
        compiler,
        {
          shadowTraceCount: settings.shadowTraceCount.toString(),
          intensityInsideRatio: settings.lightPenetrationRatio,
          backgroundColor: colorToString(settings.backgroundColor),
        }
      )
    );

    await compiler.compilePrograms();
    await Promise.all(promises);

    if (settings.enableStopwatch && this.gl.isWebGL2) {
      try {
        this.stopwatch = new WebGlStopwatch(this.gl);
      } catch {
        // no problem
      }
    }
  }

  public get insights(): RendererInfo {
    return this.gl.insights;
  }

  private setTextures(v: { [textureName: string]: TexImageSource | TextureWithOptions }) {
    this.textures.forEach((t) => t.destroy());
    this.textures = [];

    let id = 3;
    for (const key in v) {
      this.uniformsProvider.textures[key] = id;
      let texture: Texture;

      if (Object.prototype.hasOwnProperty.call(v[key], 'source')) {
        texture = new Texture(this.gl, id++, (v[key] as TextureWithOptions).overrides);
        texture.setImage((v[key] as TextureWithOptions).source);
      } else {
        texture = new Texture(this.gl, id++);
        texture.setImage(v[key] as TexImageSource);
      }

      this.textures.push(texture);
    }
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

  public renderDrawables() {
    if (this.stopwatch) {
      if (this.stopwatch.isReady) {
        this.stopwatch.start();
      } else {
        this.stopwatch.tryGetResults();
        this.gl.insights.gpuRenderTimeInMilliseconds = this.stopwatch.resultsInMilliSeconds;
      }
    }

    this.distanceFieldFrameBuffer.setSize();
    this.lightingFrameBuffer.setSize();

    const common = {
      // texture units
      distanceTexture: DistanceTexture.textureUnitId,
      colorTexture: ColorTexture.textureUnitId,
      palette: PaletteTexture.textureUnitId,

      distanceNdcPixelSize: 2 / Math.max(...this.distanceFieldFrameBuffer.getSize()),
      shadingNdcPixelSize: 2 / Math.max(...this.lightingFrameBuffer.getSize()),
    };

    this.distancePass.render(this.uniformsProvider.getUniforms(common), [
      this.palette,
      ...this.textures,
    ]);

    this.gl.enable(this.gl.BLEND);
    this.lightsPass.render(
      this.uniformsProvider.getUniforms(common),
      this.distanceFieldFrameBuffer.textures
    );
    this.gl.disable(this.gl.BLEND);

    if (this.stopwatch?.isRunning) {
      this.stopwatch?.stop();
    }
  }

  public displayToWorldCoordinates(displayCoordinates: vec2): vec2 {
    return this.uniformsProvider.screenToWorldPosition(displayCoordinates);
  }

  public worldToDisplayCoordinates(worldCoordinates: vec2): vec2 {
    return this.uniformsProvider.worldToDisplayCoordinates(worldCoordinates);
  }

  public setViewArea(topLeft: vec2, size: vec2) {
    this.uniformsProvider.setViewArea(topLeft, size);
  }

  public get viewAreaSize(): vec2 {
    return this.uniformsProvider.getViewArea();
  }

  public get canvasSize(): vec2 {
    const { width, height } = this.canvas.getBoundingClientRect();
    return vec2.fromValues(width, height);
  }

  public destroy(): void {
    this.distancePass.destroy();
    this.lightsPass.destroy();
    this.palette.destroy();
  }
}
