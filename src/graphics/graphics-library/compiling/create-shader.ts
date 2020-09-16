export const createShader = (
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
  substitutions: { [name: string]: string }
): WebGLShader => {
  source = source.replace(/{(.+)}/gm, (_, name: string): string => {
    const value = substitutions[name];
    return Number.isInteger(value) ? `${value}.0` : value;
  });

  // can only return null on lost context
  const shader = gl.createShader(type)!;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  return shader;
};
