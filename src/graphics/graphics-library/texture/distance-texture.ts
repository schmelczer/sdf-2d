import { vec2 } from 'gl-matrix';
import { enableExtension } from '../helper/enable-extension';
import { Texture } from './texture';
import { FilteringOptions } from './texture-options';

/** @internal */
export class DistanceTexture extends Texture {
  public static readonly textureUnitId = 1;

  private floatEnabled = false;
  private floatLinearEnabled = false;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, DistanceTexture.textureUnitId, {
      minFilter: FilteringOptions.NEAREST,
      maxFilter: FilteringOptions.NEAREST,
    });

    try {
      enableExtension(gl, 'EXT_color_buffer_float');
      this.floatEnabled = true;

      enableExtension(gl, 'OES_texture_float_linear');
      this.floatLinearEnabled = true;
    } catch {
      // it's okay
    }

    if (this.floatLinearEnabled) {
      this.setTextureOptions({
        minFilter: FilteringOptions.LINEAR,
        maxFilter: FilteringOptions.LINEAR,
      });
    }
  }

  public setSize(size: vec2) {
    this.bind();
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.floatEnabled ? (this.gl as WebGL2RenderingContext).R16F : this.gl.RGBA,
      size.x,
      size.y,
      0,
      this.floatEnabled ? (this.gl as WebGL2RenderingContext).RED : this.gl.RGBA,
      this.floatEnabled
        ? (this.gl as WebGL2RenderingContext).FLOAT
        : this.gl.UNSIGNED_BYTE,
      null
    );
  }
}
