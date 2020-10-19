/**
 * A helper class for calculating the elapsed time between frames.
 *
 * Handles the case, where the browser tab is not in focus and `requestAnimationFrame`
 * does not get called for performance reasons. In this case, the return deltaTime won't be
 * an unreasonably large value.
 */
export class DeltaTimeCalculator {
  private previousTime: DOMHighResTimeStamp | null = null;
  private visibilityChangeHandler = this.handleVisibilityChange.bind(this);

  constructor() {
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  /**
   * Return the elapsed time in **milliseconds** since the previous call of this
   * method by subtracting the previously given `currentTime` argument from the
   * current `currentTime` argument.
   *
   * Takes visibilitychange events into account.
   *
   * @param currentTime Current time acquired e.g. with `requestAnimationFrame`.
   */
  public getNextDeltaTime(currentTime: DOMHighResTimeStamp): DOMHighResTimeStamp {
    if (this.previousTime === null) {
      this.previousTime = currentTime;
    }

    const delta = currentTime - this.previousTime;
    this.previousTime = currentTime;
    return delta;
  }

  public destroy() {
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  private handleVisibilityChange() {
    if (!document.hidden) {
      this.previousTime = null;
    }
  }
}
