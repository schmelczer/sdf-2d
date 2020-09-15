import { vec2 } from 'gl-matrix';
import { IDrawableDescriptor } from '../../drawables/i-drawable-descriptor';
import { IProgram } from './i-program';
export declare class UniformArrayAutoScalingProgram implements IProgram {
    private gl;
    private descriptors;
    private programs;
    private current?;
    private drawingRectangleBottomLeft;
    private drawingRectangleSize;
    constructor(gl: WebGL2RenderingContext, shaderSources: [string, string], descriptors: Array<IDrawableDescriptor>);
    initialize(): Promise<void>;
    bindAndSetUniforms(uniforms: {
        [name: string]: any;
    }): void;
    setDrawingRectangleUV(bottomLeft: vec2, size: vec2): void;
    draw(): void;
    delete(): void;
    private createProgram;
}
