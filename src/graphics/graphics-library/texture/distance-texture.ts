import { vec2 } from 'gl-matrix';
import { tryEnableExtension } from '../helper/enable-extension';
import { UniversalRenderingContext } from '../universal-rendering-context';
import { Texture } from './texture';
import { FilteringOptions } from './texture-options';

/** @internal */
export class DistanceTexture extends Texture {
  public static readonly textureUnitId = 1;

  private floatLinearEnabled = false;

  constructor(gl: WebGL2RenderingContext & UniversalRenderingContext) {
    super(gl, DistanceTexture.textureUnitId, {
      minFilter: FilteringOptions.LINEAR,
      maxFilter: FilteringOptions.LINEAR,
    });

    const bufferFloatExtension = tryEnableExtension(gl, 'EXT_color_buffer_float');
    const floatLinearExtension = tryEnableExtension(gl, 'OES_texture_float_linear');
    this.floatLinearEnabled = !!bufferFloatExtension && !!floatLinearExtension;

    gl.insights.floatInterpolationEnabled = this.floatLinearEnabled;
  }

  public setSize(size: vec2) {
    this.bind();
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.floatLinearEnabled ? (this.gl as WebGL2RenderingContext).R16F : this.gl.RGBA,
      size.x,
      size.y,
      0,
      this.floatLinearEnabled ? (this.gl as WebGL2RenderingContext).RED : this.gl.RGBA,
      this.floatLinearEnabled
        ? (this.gl as WebGL2RenderingContext).FLOAT
        : this.gl.UNSIGNED_BYTE,
      null
    );
  }
}
