import { mat2d, vec2 } from 'gl-matrix';

export class UniformsProvider {
  private scaleWorldLengthToNDC = 1;
  private transformWorldToNDC = mat2d.create();

  private viewAreaBottomLeft = vec2.create();
  private worldAreaInView = vec2.create();
  private squareToAspectRatio = vec2.create();
  private uvToWorld = mat2d.create();
  private cursorPosition = vec2.create();

  public softShadowsEnabled?: boolean;

  public constructor(private gl: WebGL2RenderingContext) {}

  public getUniforms(uniforms: any): any {
    const cursorPosition = this.uvToWorldCoordinate(this.cursorPosition);
    return {
      ...uniforms,
      cursorPosition,
      uvToWorld: this.uvToWorld,
      worldAreaInView: this.worldAreaInView,
      squareToAspectRatio: this.squareToAspectRatio,
      scaleWorldLengthToNDC: this.scaleWorldLengthToNDC,
      transformWorldToNDC: this.transformWorldToNDC,
      squareToAspectRatioTimes2: vec2.scale(vec2.create(), this.squareToAspectRatio, 2),
      softShadowsEnabled: this.softShadowsEnabled,
    };
  }

  private getScreenToWorldTransform(screenSize: vec2) {
    const transform = mat2d.fromTranslation(mat2d.create(), this.viewAreaBottomLeft);
    mat2d.scale(
      transform,
      transform,
      vec2.divide(vec2.create(), this.worldAreaInView, screenSize)
    );
    mat2d.translate(transform, transform, vec2.fromValues(0.5, 0.5));

    return transform;
  }

  public uvToWorldCoordinate(screenUvPosition: vec2): vec2 {
    const resolution = vec2.fromValues(this.gl.canvas.width, this.gl.canvas.height);

    return vec2.transformMat2d(
      vec2.create(),
      vec2.multiply(vec2.create(), screenUvPosition, resolution),
      this.getScreenToWorldTransform(resolution)
    );
  }

  public setViewArea(topLeft: vec2, size: vec2) {
    this.worldAreaInView = size;

    // world coordinates
    this.viewAreaBottomLeft = vec2.add(
      vec2.create(),
      topLeft,
      vec2.fromValues(0, -size.y)
    );

    const scaleLongerEdgeTo1 =
      1 / Math.max(this.worldAreaInView.x, this.worldAreaInView.y);

    this.squareToAspectRatio = vec2.fromValues(
      this.worldAreaInView.x * scaleLongerEdgeTo1,
      this.worldAreaInView.y * scaleLongerEdgeTo1
    );

    this.scaleWorldLengthToNDC = scaleLongerEdgeTo1 * 2;

    mat2d.fromScaling(
      this.transformWorldToNDC,
      vec2.fromValues(this.scaleWorldLengthToNDC, this.scaleWorldLengthToNDC)
    );
    mat2d.translate(
      this.transformWorldToNDC,
      this.transformWorldToNDC,
      vec2.fromValues(
        -this.viewAreaBottomLeft.x - 0.5 * this.worldAreaInView.x,
        -this.viewAreaBottomLeft.y - 0.5 * this.worldAreaInView.y
      )
    );

    this.uvToWorld = mat2d.fromTranslation(mat2d.create(), this.viewAreaBottomLeft);
    mat2d.scale(this.uvToWorld, this.uvToWorld, this.worldAreaInView);
  }

  public setCursorPosition(position: vec2): void {
    this.cursorPosition = position;
  }
}
