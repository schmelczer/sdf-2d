import { clamp } from '../../helper/clamp';
import { Renderer } from './renderer/renderer';
import { defaultRuntimeSettings } from './settings/default-runtime-settings';
import { RuntimeSettings } from './settings/runtime-settings';

/**
 * Set the quality of rendering based on FPS values.
 *
 * When using this, the size of the canvas must be fixed with CSS.
 *
 * The `addDeltaTime` method should be called once every frame.
 *
 * Usage:
 * ```js
 *  const renderer = await compile(...);
 *  const autoscaler = new FpsQualityAutoscaler(renderer);
 * ```
 */
export class FpsQualityAutoscaler {
  private readonly maxAdjustmentRateInMilliseconds = 10000;
  private readonly adjustmentRateIncrease = 2;
  private adjustmentRateInMilliseconds = 500;
  private fps = 0;

  public static fpsTarget = 30;
  public fpsHysteresis = 5;

  /**
   * When `false`, FPS is still measured but the render scales are left alone.
   */
  public scalingEnabled = true;

  constructor(
    private readonly renderer: Renderer,
    initialScales: Partial<
      Pick<RuntimeSettings, 'distanceRenderScale' | 'lightsRenderScale'>
    > = {}
  ) {
    // Starting from the renderer's actual scales avoids a quality jump on
    // the first adjustment.
    this.distanceScale =
      initialScales.distanceRenderScale ?? defaultRuntimeSettings.distanceRenderScale;
    this.lightsScale =
      initialScales.lightsRenderScale ?? defaultRuntimeSettings.lightsRenderScale;
  }

  public get FPS(): number {
    return this.fps;
  }

  private deltaTimes: Array<number> = [];
  private deltaTimeSinceLastAdjustment = 0;

  /**
   * Record the time taken by the latest frame. Autoscaling is also performed
   * as part of this call.
   * @param deltaTimeInMilliseconds
   */
  public addDeltaTime(deltaTimeInMilliseconds: DOMHighResTimeStamp) {
    this.deltaTimes.push(deltaTimeInMilliseconds);
    this.deltaTimeSinceLastAdjustment += deltaTimeInMilliseconds;
    if (this.deltaTimeSinceLastAdjustment > this.adjustmentRateInMilliseconds) {
      this.calculateFPS();
      this.adjustQuality();
      this.adjustmentRateInMilliseconds = Math.min(
        this.maxAdjustmentRateInMilliseconds,
        this.adjustmentRateInMilliseconds * this.adjustmentRateIncrease
      );
      this.deltaTimeSinceLastAdjustment = 0;
    }
  }

  private calculateFPS() {
    const sampleCount = this.deltaTimes.length;
    this.deltaTimes.sort((a, b) => a - b);
    const ninetiethPercentile = this.deltaTimes[Math.floor(sampleCount * 0.9)];
    this.deltaTimes = [];

    this.fps = 1000 / ninetiethPercentile;
  }

  private distanceScale: number;
  private lightsScale: number;

  private adjustQuality() {
    if (!this.scalingEnabled) {
      return;
    }

    if (this.fps >= FpsQualityAutoscaler.fpsTarget + this.fpsHysteresis) {
      this.distanceScale = this.distanceScale + 0.1;
      this.lightsScale = this.lightsScale + 0.1;
    } else if (this.fps <= FpsQualityAutoscaler.fpsTarget - this.fpsHysteresis) {
      this.distanceScale = this.distanceScale / 1.25;
      this.lightsScale = this.lightsScale / 1.5;
    }

    this.distanceScale = clamp(this.distanceScale, 0.1, 1);
    this.lightsScale = clamp(this.lightsScale, 0.2, 1);

    this.renderer.setRuntimeSettings({
      distanceRenderScale: this.distanceScale,
      lightsRenderScale: this.lightsScale,
    });
  }
}
