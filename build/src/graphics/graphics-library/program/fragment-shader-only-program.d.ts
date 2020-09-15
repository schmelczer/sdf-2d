import Program from './program';
export declare class FragmentShaderOnlyProgram extends Program {
    private vao?;
    constructor(gl: WebGL2RenderingContext, sources: [string, string], substitutions: {
        [name: string]: string;
    });
    initialize(): Promise<void>;
    bind(): void;
    draw(): void;
    private prepareScreenQuad;
}
