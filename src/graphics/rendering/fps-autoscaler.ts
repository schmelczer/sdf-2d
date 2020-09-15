import { Autoscaler as AutoScaler } from '../../helper/autoscaler';
import { exponentialDecay } from '../../helper/exponential-decay';
import { settings } from '../settings';

export class FpsAutoscaler extends AutoScaler {
  private timeSinceLastAdjusment = 0;
  private exponentialDecayedDeltaTime = 0.0;

  constructor(setters: { [key: string]: (value: number | boolean) => void }) {
    super(
      setters,
      settings.qualityScaling.qualityTargets,
      settings.qualityScaling.startingTargetIndex,
      settings.qualityScaling.scalingOptions
    );
  }

  public autoscale(lastDeltaTime: DOMHighResTimeStamp) {
    this.timeSinceLastAdjusment += lastDeltaTime;
    if (
      this.timeSinceLastAdjusment >= settings.qualityScaling.adjusmentRateInMilliseconds
    ) {
      this.timeSinceLastAdjusment = 0;
      this.exponentialDecayedDeltaTime = exponentialDecay(
        this.exponentialDecayedDeltaTime,
        lastDeltaTime,
        settings.qualityScaling.deltaTimeResponsiveness
      );

      if (
        this.exponentialDecayedDeltaTime <=
        settings.qualityScaling.targetDeltaTimeInMilliseconds -
          settings.qualityScaling.deltaTimeError
      ) {
        this.increase();
      } else if (
        this.exponentialDecayedDeltaTime >
        settings.qualityScaling.targetDeltaTimeInMilliseconds +
          settings.qualityScaling.deltaTimeError
      ) {
        this.decrease();
      }
    }
  }
}
