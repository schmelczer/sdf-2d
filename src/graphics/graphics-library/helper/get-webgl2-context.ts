export const getWebGl2Context = (canvas: HTMLCanvasElement): WebGL2RenderingContext => {
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    throw new Error('WebGl2 is not supported');
  }

  return gl;
};
