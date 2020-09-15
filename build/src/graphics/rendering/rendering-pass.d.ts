import { IDrawable } from '../drawables/i-drawable';
import { IDrawableDescriptor } from '../drawables/i-drawable-descriptor';
import { FrameBuffer } from '../graphics-library/frame-buffer/frame-buffer';
export declare class RenderingPass {
    private frame;
    private drawables;
    private program;
    constructor(gl: WebGL2RenderingContext, shaderSources: [string, string], drawableDescriptors: Array<IDrawableDescriptor>, frame: FrameBuffer);
    initialize(): Promise<void>;
    addDrawable(drawable: IDrawable): void;
    render(commonUniforms: any, inputTexture?: WebGLTexture): void;
}
