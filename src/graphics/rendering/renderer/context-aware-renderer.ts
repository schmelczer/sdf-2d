import { vec2 } from 'gl-matrix';
import { Drawable } from '../../../drawables/drawable';
import { DrawableDescriptor } from '../../../drawables/drawable-descriptor';
import { RuntimeSettings } from '../settings/runtime-settings';
import { StartupSettings } from '../settings/startup-settings';
import { Renderer } from './renderer';
import { RendererImplementation } from './renderer-implementation';
import { RendererInfo } from './renderer-info';

/** @internal */
export class ContextAwareRenderer implements Renderer {
  private renderer!: RendererImplementation;
  private isRendererReady = false;
  private readyPromise!: Promise<void>;
  private runtimeOverrides: Partial<RuntimeSettings> = {};
  private ignoreWebGL2?: boolean;
  private previousViewAreaTopLeft?: vec2;
  private previousViewAreaSize?: vec2;

  private contextRestoredHandler = this.handleContextRestored.bind(this);
  private contextLostHandler = this.handleContextLost.bind(this);

  constructor(
    private canvas: HTMLCanvasElement,
    private descriptors: Array<DrawableDescriptor>,
    private settingsOverrides: Partial<StartupSettings>
  ) {
    canvas.addEventListener('webglcontextrestored', this.contextRestoredHandler, false);

    if (Object.prototype.hasOwnProperty.call(settingsOverrides, 'ignoreWebGL2')) {
      this.ignoreWebGL2 = settingsOverrides.ignoreWebGL2 as boolean;
    }

    this.createRenderer();
  }

  public get initializedPromise(): Promise<void> {
    return this.readyPromise;
  }

  private createRenderer() {
    try {
      this.renderer = new RendererImplementation(
        this.canvas,
        this.descriptors,
        this.ignoreWebGL2
      );
      this.readyPromise = this.renderer.initialize(this.settingsOverrides);
      this.waitForRenderer();
    } catch (e) {
      if (!e.message.includes('Context lost')) {
        throw e;
      }
      console.warn(e.message);
    }
  }

  private async waitForRenderer() {
    try {
      await this.readyPromise;
      this.isRendererReady = true;
    } catch (e) {
      if (!e.message.includes('Context lost')) {
        throw e;
      }
      console.warn(e.message);
    }

    this.setRuntimeSettings(this.runtimeOverrides);
    if (this.previousViewAreaTopLeft && this.previousViewAreaSize) {
      this.setViewArea(this.previousViewAreaTopLeft, this.previousViewAreaSize);
    }
  }

  private handleContextLost(event: Event) {
    this.isRendererReady = false;
    event.preventDefault();
    console.warn('Context lost');
  }

  private handleContextRestored(event: Event) {
    event.preventDefault();
    console.info('Context restored');

    this.createRenderer();
  }

  private handle<T>(f: () => T, defaultValue: T): T {
    if (this.isRendererReady) {
      try {
        return f();
      } catch (e) {
        if (e.message.includes('Context lost')) {
          this.isRendererReady = false;
          console.warn(e.message);
          return defaultValue;
        }
        throw e;
      }
    } else {
      return defaultValue;
    }
  }

  public get canvasSize(): vec2 {
    return this.handle(() => this.renderer.canvasSize, vec2.create());
  }

  public get viewAreaSize(): vec2 {
    return this.handle(() => this.renderer.viewAreaSize, vec2.create());
  }

  public get insights(): RendererInfo | null {
    return this.handle(() => this.renderer.insights, null);
  }

  public setViewArea(topLeft: vec2, size: vec2): void {
    this.previousViewAreaTopLeft = topLeft;
    this.previousViewAreaSize = size;
    return this.handle(() => this.renderer.setViewArea(topLeft, size), undefined);
  }

  public setRuntimeSettings(overrides: Partial<RuntimeSettings>): void {
    this.runtimeOverrides = {
      ...this.runtimeOverrides,
      ...overrides,
    };

    return this.handle(() => this.renderer.setRuntimeSettings(overrides), undefined);
  }

  public addDrawable(drawable: Drawable): void {
    return this.handle(() => this.renderer.addDrawable(drawable), undefined);
  }

  public displayToWorldCoordinates(displayCoordinates: vec2): vec2 {
    return this.handle(
      () => this.renderer.displayToWorldCoordinates(displayCoordinates),
      vec2.create()
    );
  }

  public worldToDisplayCoordinates(worldCoordinates: vec2): vec2 {
    return this.handle(
      () => this.renderer.worldToDisplayCoordinates(worldCoordinates),
      vec2.create()
    );
  }

  public renderDrawables(): void {
    return this.handle(() => this.renderer.renderDrawables(), undefined);
  }

  public destroy(): void {
    this.canvas.removeEventListener(
      'webglcontextrestored',
      this.contextRestoredHandler,
      false
    );

    this.canvas.removeEventListener('webglcontextlost', this.contextLostHandler, false);

    this.isRendererReady = false;

    this.handle(() => this.renderer.destroy(), undefined);
  }
}
