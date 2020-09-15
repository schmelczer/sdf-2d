import { vec2 } from 'gl-matrix';
import { IDrawable } from './drawables/i-drawable';
import { ILight } from './drawables/lights/i-light';
export interface IRenderer {
    initialize(): Promise<void>;
    startFrame(deltaTime: DOMHighResTimeStamp): void;
    finishFrame(): void;
    drawShape(drawable: IDrawable): void;
    drawLight(light: ILight): void;
    drawInfoText(text: string): void;
    readonly canvasSize: vec2;
    setViewArea(topLeft: vec2, size: vec2): void;
    setCursorPosition(position: vec2): void;
}
