import { FrameBuffer } from './frame-buffer';

export class DefaultFrameBuffer extends FrameBuffer {
  constructor(gl: WebGL2RenderingContext) {
    super(gl);
    this.frameBuffer = null;
    this.setSize();
  }

  public setSize(): boolean {
    const hasChanged = super.setSize();
    if (hasChanged) {
      this.gl.canvas.width = this.size.x;
      this.gl.canvas.height = this.size.y;
    }

    return hasChanged;
  }
}
