import { mat2d, vec2 } from 'gl-matrix';
import { getCombinations } from '../../../helper/get-combinations';
import { last } from '../../../helper/last';
import { IDrawableDescriptor } from '../../drawables/i-drawable-descriptor';
import { FragmentShaderOnlyProgram } from './fragment-shader-only-program';
import { IProgram } from './i-program';

export class UniformArrayAutoScalingProgram implements IProgram {
  private programs: Array<{
    program: FragmentShaderOnlyProgram;
    values: Array<number>;
  }> = [];

  private current?: FragmentShaderOnlyProgram;
  private drawingRectangleBottomLeft = vec2.fromValues(0, 0);
  private drawingRectangleSize = vec2.fromValues(1, 1);

  constructor(
    private gl: WebGL2RenderingContext,
    shaderSources: [string, string],
    private descriptors: Array<IDrawableDescriptor>
  ) {
    const names = descriptors.map((o) => o.countMacroName);
    for (const combination of getCombinations(
      descriptors.map((o) => o.shaderCombinationSteps)
    )) {
      this.createProgram(names, combination, shaderSources);
    }
  }

  public async initialize(): Promise<void> {
    await Promise.all(this.programs.map((p) => p.program.initialize()));
  }

  public bindAndSetUniforms(uniforms: { [name: string]: any }): void {
    const values = this.descriptors.map((d) =>
      uniforms[d.uniformName] ? uniforms[d.uniformName].length : 0
    );

    const closest = this.programs.find((p) => p.values.every((v, i) => v >= values[i]));

    this.current = closest ? closest.program : last(this.programs)?.program;

    if (closest) {
      this.descriptors.map((d, i) => {
        const difference = closest.values[i] - values[i];
        for (let i = 0; i < difference; i++) {
          d.empty.serializeToUniforms(uniforms, 0, mat2d.create());
        }
      });
    }

    this.current?.setDrawingRectangleUV(
      this.drawingRectangleBottomLeft,
      this.drawingRectangleSize
    );
    this.current?.bindAndSetUniforms(uniforms);
  }

  public setDrawingRectangleUV(bottomLeft: vec2, size: vec2) {
    this.drawingRectangleBottomLeft = bottomLeft;
    this.drawingRectangleSize = size;
  }

  public draw(): void {
    if (!this.current) {
      throw new Error('Method bindAndSetUniforms have not been called yet');
    }

    this.current.draw();
  }

  public delete(): void {
    this.programs.forEach((p) => p.program.delete());
  }

  private createProgram(
    names: Array<string>,
    combination: Array<number>,
    shaderSources: [string, string]
  ): FragmentShaderOnlyProgram {
    const substitutions = {};
    names.forEach((v, i) => (substitutions[v] = combination[i].toString()));

    const program = new FragmentShaderOnlyProgram(this.gl, shaderSources, substitutions);

    this.programs.push({
      program,
      values: combination,
    });

    return program;
  }
}
