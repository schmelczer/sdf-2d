import { mat2d, ReadonlyVec2, vec2, vec3 } from 'gl-matrix';
import { Renderer } from './renderer/renderer';

/** @internal */
export class UniformsProvider {
  public ambientLight!: vec3;
  public textures: { [textureName: string]: number } = {};

  private scaleWorldLengthToNDC = 1;
  private transformWorldToNDC = mat2d.create();
  private viewAreaBottomLeft = vec2.create();
  private worldAreaInView: ReadonlyVec2 = vec2.create();
  private squareToAspectRatio = vec2.create();
  private uvToWorld = mat2d.create();
  private screenToWorldTransformation = mat2d.create();
  private worldToScreenTransformation = mat2d.create();

  public constructor(private readonly renderer: Renderer) {}

  public getUniforms(uniforms: any): any {
    return {
      ...uniforms,
      ...this.textures,
      ambientLight: this.ambientLight,
      uvToWorld: this.uvToWorld,
      worldAreaInView: this.worldAreaInView,
      squareToAspectRatio: this.squareToAspectRatio,
      squareToAspectRatioTimes2: vec2.scale(vec2.create(), this.squareToAspectRatio, 2),
      scaleWorldLengthToNDC: this.scaleWorldLengthToNDC,
      transformWorldToNDC: this.transformWorldToNDC,
    };
  }

  public getViewArea(): ReadonlyVec2 {
    return this.worldAreaInView;
  }

  public setViewArea(topLeft: ReadonlyVec2, size: ReadonlyVec2) {
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

    this.calculateScreenToWorldTransformations();
  }

  public screenToWorldPosition(screenPosition: ReadonlyVec2): vec2 {
    return vec2.transformMat2d(
      vec2.create(),
      screenPosition,
      this.screenToWorldTransformation
    );
  }

  public worldToDisplayCoordinates(worldCoordinates: ReadonlyVec2): vec2 {
    return vec2.transformMat2d(
      vec2.create(),
      worldCoordinates,
      this.worldToScreenTransformation
    );
  }

  public calculateScreenToWorldTransformations() {
    const width = this.renderer.canvasSize.x;
    const height = this.renderer.canvasSize.y;
    const resolution = vec2.fromValues(width, height);

    const transform = mat2d.fromTranslation(
      this.screenToWorldTransformation,
      this.viewAreaBottomLeft
    );
    mat2d.scale(
      transform,
      transform,
      vec2.divide(vec2.create(), this.worldAreaInView, resolution)
    );
    mat2d.translate(transform, transform, vec2.fromValues(0.5, height - 0.5));
    mat2d.scale(transform, transform, vec2.fromValues(1, -1));

    mat2d.invert(this.worldToScreenTransformation, this.screenToWorldTransformation);
  }
}
