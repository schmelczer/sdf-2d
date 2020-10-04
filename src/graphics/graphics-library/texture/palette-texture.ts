import { vec3, vec4 } from 'gl-matrix';
import { UniversalRenderingContext } from '../universal-rendering-context';
import { Texture } from './texture';

/** @internal */
export class PaletteTexture extends Texture {
  constructor(gl: UniversalRenderingContext, private readonly paletteSize: number) {
    super(gl, 1);
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
}
