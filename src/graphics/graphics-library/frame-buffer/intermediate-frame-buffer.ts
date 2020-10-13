import { ColorTexture } from '../texture/color-texture';
import { DistanceTexture } from '../texture/distance-texture';
import { Texture } from '../texture/texture';
import { UniversalRenderingContext } from '../universal-rendering-context';
import { FrameBuffer } from './frame-buffer';

/** @internal */
export class IntermediateFrameBuffer extends FrameBuffer {
  private distanceTexture?: DistanceTexture;
  private colorTexture: ColorTexture;

  constructor(gl: UniversalRenderingContext) {
    super(gl);

    this.colorTexture = new ColorTexture(gl);

    if (gl.isWebGL2) {
      this.distanceTexture = new DistanceTexture(gl);
    }

    this.frameBuffer = this.gl.createFramebuffer()!;
    this.configureFrameBuffer();

    this.setSize();
  }

  public destroy(): void {
    if (this.distanceTexture) {
      this.gl.deleteTexture(this.distanceTexture);
    }
    this.gl.deleteTexture(this.colorTexture);
    this.gl.deleteFramebuffer(this.frameBuffer);
  }

  public get textures(): Array<Texture> {
    return this.distanceTexture
      ? [this.distanceTexture, this.colorTexture]
      : [this.colorTexture];
  }

  public setSize(): boolean {
    const hasChanged = super.setSize();

    if (hasChanged) {
      this.colorTexture.setSize(this.size);
      this.distanceTexture?.setSize(this.size);
    }

    return hasChanged;
  }

  private configureFrameBuffer() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.colorTexture.colorTexture,
      0
    );

    if (this.gl.isWebGL2) {
      this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER,
        this.gl.COLOR_ATTACHMENT1,
        this.gl.TEXTURE_2D,
        this.distanceTexture!.colorTexture,
        0
      );
    }
  }
}
