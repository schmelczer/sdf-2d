import { mat2d, vec2 } from 'gl-matrix';
import { settings } from '../../settings';
import { createProgram } from '../compiling/create-program';
import { loadUniform } from '../helper/load-uniform';
import { IProgram } from './i-program';

export default abstract class Program implements IProgram {
  protected program?: WebGLProgram;

  private modelTransform = mat2d.identity(mat2d.create());
  private readonly ndcToUv = mat2d.fromValues(0.5, 0, 0, 0.5, 0.5, 0.5);
  private uniforms: Array<{
    name: Array<string>;
    location: WebGLUniformLocation;
    type: GLenum;
  }> = [];

  constructor(
    protected gl: WebGL2RenderingContext,
    [vertexShaderSource, fragmentShaderSource]: [string, string],
    substitutions: { [name: string]: string }
  ) {
    substitutions = { ...settings.shaderMacros, ...substitutions };

    this.program = createProgram(
      this.gl,
      vertexShaderSource,
      fragmentShaderSource,
      substitutions
    );

    this.queryUniforms();
  }

  public bindAndSetUniforms(values: { [name: string]: any }) {
    this.bind();
    this.setUniforms({ modelTransform: this.modelTransform, ...values });
  }

  public setDrawingRectangleUV(bottomLeft: vec2, size: vec2) {
    mat2d.invert(this.modelTransform, this.ndcToUv);
    mat2d.translate(this.modelTransform, this.modelTransform, bottomLeft);
    mat2d.scale(this.modelTransform, this.modelTransform, size);
    mat2d.multiply(this.modelTransform, this.modelTransform, this.ndcToUv);
  }

  public setUniforms(values: { [name: string]: any }) {
    this.uniforms.forEach(({ name, location, type }) => {
      const value = name.reduce(
        (prev, prop) => (prev !== null && prop in prev ? prev[prop] : null),
        values
      );

      if (value !== null) {
        loadUniform(this.gl, value, type, location);
      }
    });
  }

  public delete() {
    this.gl.getAttachedShaders(this.program!)?.forEach((s) => this.gl.deleteShader(s));
    this.gl.deleteProgram(this.program!);
  }

  public abstract draw(): void;

  protected bind() {
    this.gl.useProgram(this.program!);
  }

  private queryUniforms() {
    const uniformCount = this.gl.getProgramParameter(
      this.program!,
      WebGL2RenderingContext.ACTIVE_UNIFORMS
    );

    for (let i = 0; i < uniformCount; i++) {
      const glUniform = this.gl.getActiveUniform(this.program!, i)!;

      this.uniforms.push({
        name: glUniform.name.split(/\[|\]\.|\]|\./).filter((p) => p !== ''),
        location: this.gl.getUniformLocation(this.program!, glUniform.name)!,
        type: glUniform.type,
      });
    }

    this.uniforms.map((u1) => {
      const isSingle =
        this.uniforms.filter((u2) => u2.name.includes(u1.name[0])).length == 1;

      if (u1.name.includes('0') && isSingle) {
        u1.name = u1.name.slice(0, -1);
      }

      return u1;
    });
  }
}
