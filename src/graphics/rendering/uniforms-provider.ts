import { mat2d, vec2, vec3 } from 'gl-matrix';
import { UniversalRenderingContext } from '../graphics-library/universal-rendering-context';

/** @internal */
export class UniformsProvider {
  public ambientLight!: vec3;
  public textures: { [textureName: string]: number } = {};

  private scaleWorldLengthToNDC = 1;
  private transformWorldToNDC = mat2d.create();
  private viewAreaBottomLeft = vec2.create();
  private worldAreaInView = vec2.create();
  private squareToAspectRatio = vec2.create();
  private uvToWorld = mat2d.create();

  public constructor(private readonly gl: UniversalRenderingContext) {}

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

  public getViewArea(): vec2 {
    return this.worldAreaInView;
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

  public screenToWorldPosition(screenPosition: vec2): vec2 {
    const transform = this.calculateScreenToWorldTransformation();
    return vec2.transformMat2d(vec2.create(), screenPosition, transform);
  }

  public worldToDisplayCoordinates(worldCoordinates: vec2): vec2 {
    const transform = this.calculateScreenToWorldTransformation();
    mat2d.invert(transform, transform);
    return vec2.transformMat2d(vec2.create(), worldCoordinates, transform);
  }

  private calculateScreenToWorldTransformation(): mat2d {
    const { width, height } = (this.gl
      .canvas as HTMLCanvasElement).getBoundingClientRect();
    const resolution = vec2.fromValues(width, height);

    const transform = mat2d.fromTranslation(mat2d.create(), this.viewAreaBottomLeft);
    mat2d.scale(
      transform,
      transform,
      vec2.divide(vec2.create(), this.worldAreaInView, resolution)
    );
    mat2d.translate(transform, transform, vec2.fromValues(0.5, height - 0.5));
    return mat2d.scale(transform, transform, vec2.fromValues(1, -1));
  }
}
