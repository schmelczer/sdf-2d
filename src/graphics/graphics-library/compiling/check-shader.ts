export const checkShader = (gl: WebGL2RenderingContext, shader: WebGLShader) => {
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success && !gl.isContextLost()) {
    throw new Error(gl.getShaderInfoLog(shader)!);
  }
};
