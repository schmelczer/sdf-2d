export declare class WebGlStopwatch {
    private gl;
    private timerExtension;
    private timerQuery?;
    private isReady;
    private resultsInNanoSeconds?;
    constructor(gl: WebGL2RenderingContext);
    start(): void;
    stop(): void;
    get resultsInMilliSeconds(): number;
}
