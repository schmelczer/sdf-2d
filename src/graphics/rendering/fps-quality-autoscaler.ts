import { Renderer } from './renderer/renderer';

/**
 * Set the quality of rendering based on FPS values.
 *
 * When using this the size of the canvas must be fixed with CSS.
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
  private readonly maxAdjusmentRateInMilliseconds = 10000;
  private readonly adjusmentRateIncrease = 1.3;
  private adjusmentRateInMilliseconds = 500;
  private fps = 0;

  public fpsTarget = 50;
  public fpsHysteresis = 5;

  constructor(private readonly renderer: Renderer) {}

  public get FPS(): number {
    return this.fps;
  }

  private deltaTimes: Array<number> = [];
  private deltaTimeSinceLastAdjustment = 0;

  /**
   * Autoscaling is also done by calling this function
   * @param deltaTimeInMilliseconds
   */
  public addDeltaTime(deltaTimeInMilliseconds: DOMHighResTimeStamp) {
    this.deltaTimes.push(deltaTimeInMilliseconds);
    this.deltaTimeSinceLastAdjustment += deltaTimeInMilliseconds;
    if (this.deltaTimeSinceLastAdjustment > this.adjusmentRateInMilliseconds) {
      this.calculateFPS();
      this.adjustQuality();
      this.adjusmentRateInMilliseconds = Math.min(
        this.maxAdjusmentRateInMilliseconds,
        this.adjusmentRateInMilliseconds * this.adjusmentRateIncrease
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

  private distanceScale = 0.5;
  private lightsScale = 1;

  private adjustQuality() {
    console.log(this.distanceScale, this.lightsScale);
    if (this.fps >= this.fpsTarget + this.fpsHysteresis) {
      this.renderer.setRuntimeSettings({
        distanceRenderScale: this.distanceScale += 0.1,
        lightsRenderScale: this.lightsScale += 0.1,
      });
    } else if (this.fps <= this.fpsTarget + this.fpsHysteresis) {
      this.renderer.setRuntimeSettings({
        distanceRenderScale: this.distanceScale *= 0.7,
        lightsRenderScale: this.lightsScale *= 0.7,
      });
    }
  }
}
