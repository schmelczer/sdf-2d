import { FilteringOptions, TextureOptions, WrapOptions } from './texture-options';

/**
 * @internal
 */
export class Texture {
  protected texture: WebGLTexture;

  constructor(
    protected readonly gl: WebGLRenderingContext | WebGL2RenderingContext,
    private textureUnitId: number,
    textureOptionOverrides: Partial<TextureOptions> = {}
  ) {
    this.texture = gl.createTexture()!;

    this.bind();
    this.setTextureOptions(textureOptionOverrides);
  }

  public setTextureOptions(textureOptionOverrides: Partial<TextureOptions> = {}) {
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

    this.bind();

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl[textureOptions.wrapS]
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl[textureOptions.wrapT]
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl[textureOptions.minFilter]
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl[textureOptions.maxFilter]
    );
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
