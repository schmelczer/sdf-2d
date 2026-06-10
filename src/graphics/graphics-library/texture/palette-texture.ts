import { vec3, vec4 } from 'gl-matrix';
import { UniversalRenderingContext } from '../universal-rendering-context';
import { Texture } from './texture';

/** @internal */
export class PaletteTexture extends Texture {
  public static readonly textureUnitId = 2;

  constructor(
    gl: UniversalRenderingContext,
    private readonly paletteSize: number
  ) {
    super(gl, PaletteTexture.textureUnitId);
  }

  public setPalette(colors: Array<vec3 | vec4>) {
    const data = new Uint8Array(this.paletteSize * 4);
    const toByte = (v: number) => Math.min(255, Math.max(0, Math.round(v * 255)));

    colors.forEach((c, i) => {
      data[4 * i + 0] = toByte(c[0]);
      data[4 * i + 1] = toByte(c[1]);
      data[4 * i + 2] = toByte(c[2]);
      data[4 * i + 3] = c.length == 4 ? toByte(c[3]) : 255;
    });

    this.bind();
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.paletteSize,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      data
    );
  }
}
