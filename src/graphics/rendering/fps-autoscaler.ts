import { clamp } from '../../helper/clamp';
import { exponentialDecay } from '../../helper/exponential-decay';
import { mix } from '../../helper/mix';
import { Insights } from './insights';

const settings = {
  targetDeltaTimeInMilliseconds: 20,
  deltaTimeErrorInMilliseconds: 3,
  deltaTimeResponsiveness: 1 / 32,
  adjusmentRateInMilliseconds: 1000,
  targets: [
    {
      distanceRenderScale: 0.1,
      finalRenderScale: 0.2,
    },
    {
      distanceRenderScale: 0.1,
      finalRenderScale: 0.6,
    },
    {
      distanceRenderScale: 0.5,
      finalRenderScale: 1.0,
    },
    {
      distanceRenderScale: 1.0,
      finalRenderScale: 1.0,
    },
  ],
  qualityStepIncrease: 0.01,
  qualityStepDecrese: 0.2,
};

export class FpsAutoscaler {
  private timeSinceLastAdjusment = 0;
  private exponentialDecayedDeltaTime = settings.targetDeltaTimeInMilliseconds;

  // can have fractions
  private index = 3;

  constructor(private setters: { [key: string]: (value: number | boolean) => void }) {
    this.applyScaling();
  }

  public increase() {
    this.index += settings.qualityStepIncrease;
    this.applyScaling();
  }

  public decrease() {
    this.index -= settings.qualityStepDecrese;
    this.applyScaling();
  }

  private applyScaling() {
    this.index = clamp(this.index, 0, settings.targets.length - 1);

    const floor = Math.floor(this.index);
    const fract = this.index - floor;

    const previousTarget: any = settings.targets[floor];
    const nextTarget =
      floor + 1 == settings.targets.length ? previousTarget : settings.targets[floor + 1];

    const result: any = {};
    for (const key in this.setters) {
      const previous = previousTarget[key];
      const next = nextTarget[key];
      let current: number | boolean;
      if (typeof previous == 'number') {
        current = mix(previous, next as number, fract);
      } else {
        current = next;
      }

      result[key] = current;
      this.setters[key](current);
    }

    Insights.setValue('quality', result);
  }

  public autoscale(lastDeltaTime: DOMHighResTimeStamp) {
    this.exponentialDecayedDeltaTime = exponentialDecay(
      this.exponentialDecayedDeltaTime,
      lastDeltaTime,
      settings.deltaTimeResponsiveness
    );
    Insights.setValue('FPS', 1000 / this.exponentialDecayedDeltaTime);

    if (
      (this.timeSinceLastAdjusment += lastDeltaTime) >=
      settings.adjusmentRateInMilliseconds
    ) {
      this.timeSinceLastAdjusment = 0;

      if (
        this.exponentialDecayedDeltaTime + settings.deltaTimeErrorInMilliseconds <=
        settings.targetDeltaTimeInMilliseconds
      ) {
        this.increase();
      } else if (
        this.exponentialDecayedDeltaTime > settings.targetDeltaTimeInMilliseconds
      ) {
        this.decrease();
      }
    }
  }
}
