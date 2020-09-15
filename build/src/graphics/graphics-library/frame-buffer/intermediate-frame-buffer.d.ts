import { FrameBuffer } from './frame-buffer';
export declare class IntermediateFrameBuffer extends FrameBuffer {
    private frameTexture;
    private floatLinearEnabled;
    constructor(gl: WebGL2RenderingContext);
    get colorTexture(): WebGLTexture;
    setSize(): boolean;
    private configureTexture;
    private configureFrameBuffer;
}
