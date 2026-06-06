import { vec2 } from 'gl-matrix';
import { tryEnableExtension } from '../helper/enable-extension';
import { UniversalRenderingContext } from '../universal-rendering-context';
import { Texture } from './texture';
import { FilteringOptions } from './texture-options';

/** @internal */
export class ColorTexture extends Texture {
  public static readonly textureUnitId = 0;

  private floatEnabled = false;

  constructor(gl: UniversalRenderingContext) {
    super(gl, ColorTexture.textureUnitId, {
      minFilter: FilteringOptions.LINEAR,
      maxFilter: FilteringOptions.LINEAR,
    });

    const bufferFloatExtension = tryEnableExtension(gl, 'EXT_color_buffer_float');
    const floatLinearExtension = tryEnableExtension(gl, 'OES_texture_float_linear');
    this.floatEnabled = gl.isWebGL2 && !!bufferFloatExtension && !!floatLinearExtension;
  }

  public setSize(size: vec2) {
    this.bind();
    const gl2 = this.gl as WebGL2RenderingContext;
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.floatEnabled ? gl2.RGBA16F : this.gl.RGBA,
      size.x,
      size.y,
      0,
      this.gl.RGBA,
      this.floatEnabled ? gl2.HALF_FLOAT : this.gl.UNSIGNED_BYTE,
      null
    );
  }
}
