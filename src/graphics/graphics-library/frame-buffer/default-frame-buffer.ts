import { ReadonlyVec2 } from 'gl-matrix';
import { UniversalRenderingContext } from '../universal-rendering-context';
import { FrameBuffer } from './frame-buffer';

/** @internal */
export class DefaultFrameBuffer extends FrameBuffer {
  constructor(gl: UniversalRenderingContext, canvasSize: ReadonlyVec2) {
    super(gl);
    this.frameBuffer = null;
    this.setSize(canvasSize);
  }

  public setSize(canvasSize: ReadonlyVec2): boolean {
    const hasChanged = super.setSize(canvasSize);

    if (hasChanged) {
      this.gl.canvas.width = this.size.x;
      this.gl.canvas.height = this.size.y;
    }

    return hasChanged;
  }
}
