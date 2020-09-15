import { vec2 } from 'gl-matrix';
import { IProgram } from './i-program';
export default abstract class Program implements IProgram {
    protected gl: WebGL2RenderingContext;
    protected program?: WebGLProgram;
    private programPromise;
    private modelTransform;
    private readonly ndcToUv;
    private uniforms;
    constructor(gl: WebGL2RenderingContext, [vertexShaderSource, fragmentShaderSource]: [string, string], substitutions: {
        [name: string]: string;
    });
    initialize(): Promise<void>;
    bindAndSetUniforms(values: {
        [name: string]: any;
    }): void;
    setDrawingRectangleUV(bottomLeft: vec2, size: vec2): void;
    setUniforms(values: {
        [name: string]: any;
    }): void;
    delete(): void;
    abstract draw(): void;
    protected bind(): void;
    private queryUniforms;
}
