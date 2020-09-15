import { vec2 } from 'gl-matrix';
export declare class UniformsProvider {
    private gl;
    private scaleWorldLengthToNDC;
    private transformWorldToNDC;
    private viewAreaBottomLeft;
    private worldAreaInView;
    private squareToAspectRatio;
    private uvToWorld;
    private cursorPosition;
    softShadowsEnabled?: boolean;
    constructor(gl: WebGL2RenderingContext);
    getUniforms(uniforms: any): any;
    private getScreenToWorldTransform;
    uvToWorldCoordinate(screenUvPosition: vec2): vec2;
    setViewArea(topLeft: vec2, size: vec2): void;
    setCursorPosition(position: vec2): void;
}
