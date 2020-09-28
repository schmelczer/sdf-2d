import { vec3, vec4 } from 'gl-matrix';
import { UniversalRenderingContext } from './universal-rendering-context';

/** @internal */
export class PaletteTexture {
  private texture: WebGLTexture;

  constructor(
    private readonly gl: UniversalRenderingContext,
    private readonly paletteSize: number
  ) {
    this.texture = gl.createTexture()!;
    this.bind();

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  public get colorTexture(): WebGLTexture {
    return this.texture;
  }

  private bind() {
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  public setPalette(colors: Array<vec3 | vec4>) {
    const canvas = document.createElement('canvas');
    canvas.width = this.paletteSize;
    canvas.height = 1;

    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(this.paletteSize, 1);

    colors.forEach((c, i) => {
      imageData.data[4 * i + 0] = c[0] * 255;
      imageData.data[4 * i + 1] = c[1] * 255;
      imageData.data[4 * i + 2] = c[2] * 255;
      imageData.data[4 * i + 3] = c.length == 4 ? c[3] * 255 : 255;
    });
    ctx.putImageData(imageData, 0, 0);

    this.setImage(canvas);
  }

  public setImage(image: TexImageSource) {
    this.bind();

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );
  }

  public destroy() {
    this.gl.deleteTexture(this.texture);
  }
}
