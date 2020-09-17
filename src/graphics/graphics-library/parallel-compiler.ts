import { wait } from '../../helper/wait';
import { Insights } from '../rendering/insights';
import { tryEnableExtension } from './helper/enable-extension';

type CompilingProgram = {
  program: WebGLProgram;
  resolvePromise: ((program: WebGLProgram) => void) | null;
};

export abstract class ParallelCompiler {
  private static extension?: any;
  private static gl: WebGL2RenderingContext;
  private static programs: Array<CompilingProgram> = [];

  public static initialize(gl: WebGL2RenderingContext) {
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

    ParallelCompiler.compileShader(
      vertexShaderSource,
      ParallelCompiler.gl.VERTEX_SHADER,
      program,
      substitutions
    );

    ParallelCompiler.compileShader(
      fragmentShaderSource,
      ParallelCompiler.gl.FRAGMENT_SHADER,
      program,
      substitutions
    );

    ParallelCompiler.programs.push({
      program,
      resolvePromise,
    });

    return promise;
  }

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
  ) {
    const processedSource = source.replace(/{(.+)}/gm, (_, name: string): string => {
      const value = substitutions[name];
      return Number.isInteger(value) ? `${value}.0` : value;
    });

    // can only return null on lost context
    const shader = ParallelCompiler.gl.createShader(type)!;

    this.gl.shaderSource(shader, processedSource);
    this.gl.compileShader(shader);
    this.gl.attachShader(program, shader);
    this.gl.deleteShader(shader);
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
        ParallelCompiler.checkProgram(p.program);
        done.push(p);
        p.resolvePromise!(p.program);
      }
    });

    ParallelCompiler.programs = ParallelCompiler.programs.filter(
      (p1) => done.findIndex((p2) => p2 === p1) == -1
    );
  }

  private static checkProgram(program: WebGLProgram) {
    const success = ParallelCompiler.gl.getProgramParameter(
      program,
      ParallelCompiler.gl.LINK_STATUS
    );

    if (!success && !ParallelCompiler.gl.isContextLost()) {
      ParallelCompiler.gl.getAttachedShaders(program)?.forEach((s) => {
        ParallelCompiler.checkShader(s);
      });

      throw new Error(ParallelCompiler.gl.getProgramInfoLog(program)!);
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
