import { vec2 } from 'gl-matrix';
import { IDrawable } from '../drawables/i-drawable';
import { ILight } from '../drawables/lights/i-light';
import { IRenderer } from '../i-renderer';
export declare class WebGl2Renderer implements IRenderer {
    private canvas;
    private overlay;
    private gl;
    private stopwatch?;
    private uniformsProvider;
    private distanceFieldFrameBuffer;
    private lightingFrameBuffer;
    private distancePass;
    private lightingPass;
    private autoscaler;
    private initializePromise;
    constructor(canvas: HTMLCanvasElement, overlay: HTMLElement);
    initialize(): Promise<void>;
    drawShape(shape: IDrawable): void;
    drawLight(light: ILight): void;
    startFrame(deltaTime: DOMHighResTimeStamp): void;
    finishFrame(): void;
    setViewArea(topLeft: vec2, size: vec2): void;
    setCursorPosition(position: vec2): void;
    get canvasSize(): vec2;
    drawInfoText(text: string): void;
}
