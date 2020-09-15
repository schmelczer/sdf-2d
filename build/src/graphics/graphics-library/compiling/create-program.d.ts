export declare const createProgram: (gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string, substitutions: {
    [name: string]: string;
}) => Promise<WebGLProgram>;
