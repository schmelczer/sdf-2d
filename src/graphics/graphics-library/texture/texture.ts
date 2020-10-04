import { UniversalRenderingContext } from '../universal-rendering-context';
import { FilteringOptions, TextureOptions, WrapOptions } from './texture-options';

/**
 * @internal
 */
export class Texture {
  protected texture: WebGLTexture;

  constructor(
    protected readonly gl: UniversalRenderingContext,
    private textureUnitId: number,
    textureOptionOverrides: Partial<TextureOptions> = {}
  ) {
    const defaultTextureOptions: TextureOptions = {
      wrapS: WrapOptions.CLAMP_TO_EDGE,
      wrapT: WrapOptions.CLAMP_TO_EDGE,
      minFilter: FilteringOptions.NEAREST,
      maxFilter: FilteringOptions.NEAREST,
    };

    const textureOptions = {
      ...defaultTextureOptions,
      ...textureOptionOverrides,
    };

    this.texture = gl.createTexture()!;

    this.bind();

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[textureOptions.wrapS]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[textureOptions.wrapT]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[textureOptions.minFilter]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[textureOptions.maxFilter]);
  }

  public get colorTexture(): WebGLTexture {
    return this.texture;
  }

  public bind() {
    this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnitId);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
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
