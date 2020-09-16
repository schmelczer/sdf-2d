import { Insights } from '../graphics/rendering/insights';
import { clamp } from './clamp';
import { mix } from './mix';

export class Autoscaler {
  // can have fractions
  private index: number;

  constructor(
    private setters: { [key: string]: (value: number | boolean) => void },
    private targets: Array<{ [key: string]: number | boolean }>,
    startingIndex: number,
    private scalingOptions: {
      additiveIncrease: number;
      multiplicativeDecrease: number;
    }
  ) {
    this.index = startingIndex;
    this.applyScaling();
  }

  public increase() {
    this.index += this.scalingOptions.additiveIncrease;
    this.applyScaling();
  }

  public decrease() {
    this.index /= this.scalingOptions.multiplicativeDecrease;
    this.applyScaling();
  }

  private applyScaling() {
    this.index = clamp(this.index, 0, this.targets.length - 1);

    const floor = Math.floor(this.index);
    const fract = this.index - floor;

    const previousTarget = this.targets[floor];
    const nextTarget =
      floor + 1 == this.targets.length ? previousTarget : this.targets[floor + 1];

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
}
