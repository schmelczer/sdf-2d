import { enableExtension } from '../helper/enable-extension';
import { FrameBuffer } from './frame-buffer';

export class IntermediateFrameBuffer extends FrameBuffer {
  private frameTexture: WebGLTexture;
  private floatLinearEnabled = false;

  constructor(gl: WebGL2RenderingContext, enableHighDpiRendering: boolean) {
    super(gl, enableHighDpiRendering);

    enableExtension(gl, 'EXT_color_buffer_float');

    try {
      enableExtension(gl, 'OES_texture_float_linear');
      this.floatLinearEnabled = true;
    } catch {
      // it's okay
    }

    // can only return null on lost context
    this.frameTexture = this.gl.createTexture()!;
    this.configureTexture();

    // can only return null on lost context
    this.frameBuffer = this.gl.createFramebuffer()!;
    this.configureFrameBuffer();

    this.setSize();
  }

  public get colorTexture(): WebGLTexture {
    return this.frameTexture;
  }

  public setSize(): boolean {
    const hasChanged = super.setSize();
    if (hasChanged) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.frameTexture);

      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RG16F,
        this.size.x,
        this.size.y,
        0,
        this.gl.RG,
        this.gl.FLOAT,
        null
      );
    }

    return hasChanged;
  }

  private configureTexture() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.frameTexture);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.floatLinearEnabled ? this.gl.LINEAR : this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.floatLinearEnabled ? this.gl.LINEAR : this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
  }

  private configureFrameBuffer() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    const attachmentPoint = this.gl.COLOR_ATTACHMENT0;
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      attachmentPoint,
      this.gl.TEXTURE_2D,
      this.frameTexture,
      0
    );
  }
}
