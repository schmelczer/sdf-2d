import { ReadonlyVec2, vec2 } from 'gl-matrix';
import { Texture } from '../texture/texture';
import { UniversalRenderingContext } from '../universal-rendering-context';

/** @internal */
export abstract class FrameBuffer {
  public renderScale = 1;
  public enableHighDpiRendering!: boolean;

  protected size = vec2.create();

  // null means the default framebuffer
  protected frameBuffer: WebGLFramebuffer | null = null;

  constructor(protected readonly gl: UniversalRenderingContext) {}

  public bindAndClear(inputTextures: Array<Texture>) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);

    inputTextures.forEach((t) => t.bind());

    this.gl.viewport(0, 0, this.size.x, this.size.y);
  }

  public destroy(): void {
    this.gl.deleteFramebuffer(this.frameBuffer);
  }

  public setSize(canvasSize: ReadonlyVec2): boolean {
    const realToCssPixels =
      (this.enableHighDpiRendering ? devicePixelRatio : 1) * this.renderScale;

    const displayWidth = Math.floor(canvasSize.x * realToCssPixels);
    const displayHeight = Math.floor(canvasSize.y * realToCssPixels);

    const oldSize = vec2.clone(this.getSize());
    this.size = vec2.fromValues(displayWidth, displayHeight);

    return this.size.x != oldSize.x || this.size.y != oldSize.y;
  }

  public getSize(): vec2 {
    return this.size;
  }
}
