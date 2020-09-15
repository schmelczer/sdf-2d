import { enableExtension } from './enable-extension';

// https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query_webgl2/

export class WebGlStopwatch {
  private timerExtension: any;
  private timerQuery?: WebGLQuery;
  private isReady = true;
  private resultsInNanoSeconds?: number;

  constructor(private gl: WebGL2RenderingContext) {
    this.timerExtension = enableExtension(gl, 'EXT_disjoint_timer_query_webgl2');
  }

  public start() {
    if (this.isReady) {
      this.timerQuery = this.gl.createQuery()!;
      this.gl.beginQuery(this.timerExtension.TIME_ELAPSED_EXT, this.timerQuery);
    }
  }

  public stop() {
    if (this.isReady) {
      this.gl.endQuery(this.timerExtension.TIME_ELAPSED_EXT);
      this.isReady = false;
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

      //InfoText.modifyRecord('Draw time', `${this.resultsInMilliSeconds.toFixed(2)} ms`);

      this.isReady = true;
    }
  }

  public get resultsInMilliSeconds(): number {
    return this.resultsInNanoSeconds! / 1000 / 1000;
  }
}
