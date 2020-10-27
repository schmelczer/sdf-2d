import { formatLog } from '../../helper/format-log';
import { numberToGlslFloat } from '../../helper/number-to-glsl-float';
import { wait } from '../../helper/wait';
import { tryEnableExtension } from './helper/enable-extension';
import { UniversalRenderingContext } from './universal-rendering-context';

/** @internal */
type CompilingProgram = {
  program: WebGLProgram;
  resolvePromise: ((program: WebGLProgram) => void) | null;
  vertexShader: ShaderWithSource;
  fragmentShader: ShaderWithSource;
};

/** @internal */
type ShaderWithSource = WebGLShader & { source: string };

/** @internal */
export class ParallelCompiler {
  private extension?: any;
  private gl: UniversalRenderingContext;
  private programs: Array<CompilingProgram> = [];

  public constructor(gl: UniversalRenderingContext) {
    this.gl = gl;
    this.extension = tryEnableExtension(gl, 'KHR_parallel_shader_compile');
  }

  public createProgram(
    vertexShaderSource: string,
    fragmentShaderSource: string,
    substitutions: { [name: string]: string }
  ): Promise<WebGLProgram> {
    let resolvePromise: ((program: WebGLProgram) => void) | null = null;
    const promise = new Promise<WebGLProgram>((r) => (resolvePromise = r));

    const program = this.gl.createProgram()!;

    const vertexShader = this.compileShader(
      vertexShaderSource,
      this.gl.VERTEX_SHADER,
      program,
      substitutions
    );

    const fragmentShader = this.compileShader(
      fragmentShaderSource,
      this.gl.FRAGMENT_SHADER,
      program,
      substitutions
    );

    this.programs.push({
      program,
      resolvePromise,
      vertexShader,
      fragmentShader,
    });

    return promise;
  }

  public async compilePrograms(): Promise<void> {
    this.programs.forEach((p) => this.gl.linkProgram(p.program));

    this.gl.insights.programCount = this.programs.length;

    while (this.programs.length > 0) {
      this.resolveFinishedPrograms();
      await wait(0);
    }
  }

  private compileShader(
    source: string,
    type: GLenum,
    program: WebGLProgram,
    substitutions: { [name: string]: string }
  ): ShaderWithSource {
    let processedSource = source;
    let replaceHappened: boolean;
    do {
      replaceHappened = false;
      processedSource = processedSource.replace(/{(.+)}/gm, (_, name: string): string => {
        replaceHappened = true;
        const value = substitutions[name];
        return numberToGlslFloat(value);
      });
    } while (replaceHappened);

    const shader = this.gl.createShader(type)!;

    this.gl.shaderSource(shader, processedSource);
    this.gl.compileShader(shader);
    this.gl.attachShader(program, shader);

    const result = shader as ShaderWithSource;
    result.source = processedSource;

    return result;
  }

  private resolveFinishedPrograms() {
    const done: Array<CompilingProgram> = [];

    this.programs.forEach((p) => {
      if (
        !this.extension ||
        this.gl.getProgramParameter(p.program, this.extension.COMPLETION_STATUS_KHR)
      ) {
        this.checkProgram(p);
        done.push(p);
        p.resolvePromise!(p.program);
      }
    });

    this.programs = this.programs.filter((p1) => done.findIndex((p2) => p2 === p1) == -1);
  }

  private checkProgram(program: CompilingProgram) {
    const success = this.gl.getProgramParameter(program.program, this.gl.LINK_STATUS);

    if (!success) {
      this.prettyPrintErrorsIfThereAreAny(program.vertexShader);
      this.prettyPrintErrorsIfThereAreAny(program.fragmentShader);

      throw new Error(this.gl.getProgramInfoLog(program.program)!);
    }

    this.gl.deleteShader(program.vertexShader);
    this.gl.deleteShader(program.fragmentShader);
  }

  private prettyPrintErrorsIfThereAreAny(shader: ShaderWithSource) {
    try {
      this.checkShader(shader);
    } catch (e) {
      for (const match of e.toString().matchAll(/ERROR: 0:(\d+): (.*)$/gm)) {
        const line = Number.parseInt(match[1]);
        const error = match[2];
        console.error(
          formatLog(
            'parallel-compiler',
            `Error: ${error}\nSource (line ${line}):\n${
              shader.source.split('\n')[line - 1]
            }`
          )
        );
      }
      throw new Error('Error while compiling shader');
    }
  }

  private checkShader(shader: WebGLShader) {
    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

    if (!success) {
      throw new Error(this.gl.getShaderInfoLog(shader)!);
    }
  }
}
