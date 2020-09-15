import { FrameBuffer } from './frame-buffer';
export declare class DefaultFrameBuffer extends FrameBuffer {
    constructor(gl: WebGL2RenderingContext);
    setSize(): boolean;
}
