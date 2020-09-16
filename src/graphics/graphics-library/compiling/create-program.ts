import { checkProgram } from './check-program';
import { createShader } from './create-shader';

export const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  substitutions: { [name: string]: string }
): WebGLProgram => {
  // can only return null on lost context
  const program = gl.createProgram()!;

  // const extension = tryEnableExtension(gl, 'KHR_parallel_shader_compile');

  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource,
    substitutions
  );
  gl.attachShader(program, vertexShader);

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
    substitutions
  );

  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  /*if (extension) {
    const checkCompileStatus = () =>
      gl.getProgramParameter(program, extension.COMPLETION_STATUS_KHR);

    await waitWhileFalse(checkCompileStatus);
  }*/

  checkProgram(gl, program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
};
