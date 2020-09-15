import { vec2 } from 'gl-matrix';
export declare abstract class FrameBuffer {
    protected gl: WebGL2RenderingContext;
    renderScale: number;
    enableHighDpiRendering: boolean;
    protected size: vec2;
    protected frameBuffer: WebGLFramebuffer | null;
    constructor(gl: WebGL2RenderingContext);
    bindAndClear(colorInput?: WebGLTexture): void;
    setSize(): boolean;
    getSize(): vec2;
}
