import { vec2 } from 'gl-matrix';
import { UniversalRenderingContext } from '../universal-rendering-context';
import { Texture } from './texture';
import { FilteringOptions } from './texture-options';

/** @internal */
export class ColorTexture extends Texture {
  public static readonly textureUnitId = 0;

  constructor(gl: UniversalRenderingContext) {
    super(gl, ColorTexture.textureUnitId, {
      minFilter: FilteringOptions.LINEAR,
      maxFilter: FilteringOptions.LINEAR,
    });
  }

  public setSize(size: vec2) {
    this.bind();
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      size.x,
      size.y,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    );
  }
}
