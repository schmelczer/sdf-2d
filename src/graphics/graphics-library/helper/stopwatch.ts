import { enableExtension } from './enable-extension';

/** @internal */
enum StopwatchState {
  ready = 'ready',
  running = 'running',
  waitingForResults = 'waitingForResults',
}

/** @internal */
export class WebGlStopwatch {
  private state = StopwatchState.ready;
  private resultsInNanoSeconds = 0;

  private timerExtension: any;
  private timerQuery?: WebGLQuery;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.timerExtension = enableExtension(gl, 'EXT_disjoint_timer_query_webgl2');
  }

  public start() {
    if (this.state != StopwatchState.ready) {
      throw new Error(`Could not start stopwatch in state ${this.state}`);
    }

    this.timerQuery = this.gl.createQuery()!;
    this.gl.beginQuery(this.timerExtension.TIME_ELAPSED_EXT, this.timerQuery);
    this.state = StopwatchState.running;
  }

  public stop() {
    if (this.state != StopwatchState.running) {
      throw new Error(`Could not stop stopwatch in state ${this.state}`);
    }

    this.gl.endQuery(this.timerExtension.TIME_ELAPSED_EXT);
    this.state = StopwatchState.waitingForResults;
  }

  public tryGetResults(): boolean {
    if (this.state != StopwatchState.waitingForResults) {
      throw new Error(`Could not check for results in state ${this.state}`);
    }

    const available = this.gl.getQueryParameter(
      this.timerQuery!,
      this.gl.QUERY_RESULT_AVAILABLE
    );
    const disjoint = this.gl.getParameter(this.timerExtension.GPU_DISJOINT_EXT);
    if (available && !disjoint) {
      this.resultsInNanoSeconds = this.gl.getQueryParameter(
        this.timerQuery!,
        this.gl.QUERY_RESULT
      );

      this.state = StopwatchState.ready;
      return true;
    }
    return false;
  }

  public get isReady(): boolean {
    return this.state == StopwatchState.ready;
  }

  public get isRunning(): boolean {
    return this.state == StopwatchState.running;
  }

  public get isWaitingForResults(): boolean {
    return this.state == StopwatchState.waitingForResults;
  }

  public get resultsInMilliSeconds(): number {
    return this.resultsInNanoSeconds! / 1000 / 1000;
  }
}
