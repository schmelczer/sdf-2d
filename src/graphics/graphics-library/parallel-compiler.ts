import { wait } from '../../helper/wait';
import { Insights } from '../rendering/insights';
import { tryEnableExtension } from './helper/enable-extension';
import { UniversalRenderingContext } from './universal-rendering-context';

type CompilingProgram = {
  program: WebGLProgram;
  resolvePromise: ((program: WebGLProgram) => void) | null;
  vertexShader: ShaderWithSource;
  fragmentShader: ShaderWithSource;
};

type ShaderWithSource = WebGLShader & { source: string };

export abstract class ParallelCompiler {
  private static extension?: any;
  private static gl: UniversalRenderingContext;
  private static programs: Array<CompilingProgram> = [];

  public static initialize(gl: UniversalRenderingContext) {
    ParallelCompiler.gl = gl;
    ParallelCompiler.extension = tryEnableExtension(gl, 'KHR_parallel_shader_compile');
  }

  public static createProgram(
    vertexShaderSource: string,
    fragmentShaderSource: string,
    substitutions: { [name: string]: string }
  ): Promise<WebGLProgram> {
    let resolvePromise: ((program: WebGLProgram) => void) | null = null;
    const promise = new Promise<WebGLProgram>((r) => (resolvePromise = r));

    // can only return null on lost context
    const program = ParallelCompiler.gl.createProgram()!;

    const vertexShader = ParallelCompiler.compileShader(
      vertexShaderSource,
      ParallelCompiler.gl.VERTEX_SHADER,
      program,
      substitutions
    );

    const fragmentShader = ParallelCompiler.compileShader(
      fragmentShaderSource,
      ParallelCompiler.gl.FRAGMENT_SHADER,
      program,
      substitutions
    );

    ParallelCompiler.programs.push({
      program,
      resolvePromise,
      vertexShader,
      fragmentShader,
    });

    return promise;
  }

  @Insights.measure('compile programs')
  public static async compilePrograms(): Promise<void> {
    ParallelCompiler.programs.forEach((p) => ParallelCompiler.gl.linkProgram(p.program));

    Insights.setValue('program count', ParallelCompiler.programs.length);

    while (ParallelCompiler.programs.length > 0) {
      ParallelCompiler.resolveFinishedPrograms();
      await wait(0);
    }
  }

  private static compileShader(
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
        return Number.isInteger(value) ? `${value}.0` : value;
      });
    } while (replaceHappened);

    // can only return null on lost context
    const shader = ParallelCompiler.gl.createShader(type)!;

    this.gl.shaderSource(shader, processedSource);
    this.gl.compileShader(shader);
    this.gl.attachShader(program, shader);

    const result = shader as ShaderWithSource;
    result.source = processedSource;

    return result;
  }

  private static resolveFinishedPrograms() {
    const done: Array<CompilingProgram> = [];

    ParallelCompiler.programs.forEach((p) => {
      if (
        !ParallelCompiler.extension ||
        ParallelCompiler.gl.getProgramParameter(
          p.program,
          ParallelCompiler.extension.COMPLETION_STATUS_KHR
        )
      ) {
        ParallelCompiler.checkProgram(p);
        done.push(p);
        p.resolvePromise!(p.program);
      }
    });

    ParallelCompiler.programs = ParallelCompiler.programs.filter(
      (p1) => done.findIndex((p2) => p2 === p1) == -1
    );
  }

  private static checkProgram(program: CompilingProgram) {
    const success = ParallelCompiler.gl.getProgramParameter(
      program.program,
      ParallelCompiler.gl.LINK_STATUS
    );

    if (!success && !ParallelCompiler.gl.isContextLost()) {
      ParallelCompiler.prettyPrintErrorsIfThereAreAny(program.vertexShader);
      ParallelCompiler.prettyPrintErrorsIfThereAreAny(program.fragmentShader);

      throw new Error(ParallelCompiler.gl.getProgramInfoLog(program.program)!);
    }

    this.gl.deleteShader(program.vertexShader);
    this.gl.deleteShader(program.fragmentShader);
  }

  private static prettyPrintErrorsIfThereAreAny(shader: ShaderWithSource) {
    try {
      ParallelCompiler.checkShader(shader);
    } catch (e) {
      for (const match of e.toString().matchAll(/ERROR: 0:(\d+): (.*)$/gm)) {
        const line = Number.parseInt(match[1]);
        const error = match[2];
        console.error(
          `Error: ${error}\nSource (line ${line}):\n${
            shader.source.split('\n')[line - 1]
          }`
        );
      }
      throw new Error('Error while compiling shader');
    }
  }

  private static checkShader(shader: WebGLShader) {
    const success = ParallelCompiler.gl.getShaderParameter(
      shader,
      ParallelCompiler.gl.COMPILE_STATUS
    );

    if (!success && !ParallelCompiler.gl.isContextLost()) {
      throw new Error(ParallelCompiler.gl.getShaderInfoLog(shader)!);
    }
  }
}
