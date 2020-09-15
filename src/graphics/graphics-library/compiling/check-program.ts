import { checkShader } from './check-shader';

export const checkProgram = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!success) {
    gl.getAttachedShaders(program)?.forEach((s) => {
      checkShader(gl, s);
    });

    throw new Error(gl.getProgramInfoLog(program)!);
  }
};
