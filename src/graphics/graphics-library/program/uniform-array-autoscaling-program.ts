import { mat2d, vec2 } from 'gl-matrix';
import { DrawableDescriptor } from '../../../drawables/drawable-descriptor';
import { getCombinations } from '../../../helper/get-combinations';
import { last } from '../../../helper/last';
import { UniversalRenderingContext } from '../universal-rendering-context';
import { FragmentShaderOnlyProgram } from './fragment-shader-only-program';
import { IProgram } from './i-program';

export class UniformArrayAutoScalingProgram implements IProgram {
  private programs: Array<{
    program: FragmentShaderOnlyProgram;
    values: Array<number>;
  }> = [];

  private current?: FragmentShaderOnlyProgram;
  private descriptors?: Array<DrawableDescriptor>;
  private drawingRectangleBottomLeft = vec2.fromValues(0, 0);
  private drawingRectangleSize = vec2.fromValues(1, 1);

  constructor(private readonly gl: UniversalRenderingContext) {}

  public async initialize(
    shaderSources: [string, string],
    descriptors: Array<DrawableDescriptor>,
    substitutions: { [name: string]: any }
  ): Promise<void> {
    this.descriptors = descriptors;

    const promises: Array<Promise<void>> = [];

    for (const combination of getCombinations(
      descriptors.map((o) => o.shaderCombinationSteps)
    )) {
      promises.push(
        this.createProgram(descriptors, substitutions, combination, shaderSources)
      );
    }

    await Promise.all(promises);
  }

  public setDrawingRectangleUV(bottomLeft: vec2, size: vec2) {
    this.drawingRectangleBottomLeft = bottomLeft;
    this.drawingRectangleSize = size;
  }

  public draw(uniforms: { [name: string]: any }): void {
    const values = this.descriptors!.map((d) => {
      const uniformNames = last(Object.entries(d.propertyUniformMapping));
      if (!uniformNames) {
        return 0;
      }
      const uniformName = uniformNames[1];
      return uniforms[uniformName] ? uniforms[uniformName].length : 0;
    });

    const closest = this.programs.find((p) => p.values.every((v, i) => v >= values[i]));

    this.current = closest ? closest.program : last(this.programs)?.program;

    if (closest) {
      this.descriptors!.map((d, i) => {
        const difference = closest.values[i] - values[i];
        for (let i = 0; i < difference; i++) {
          d.empty.serializeToUniforms(uniforms, mat2d.create(), 0);
        }
      });
    }

    this.current!.setDrawingRectangleUV(
      this.drawingRectangleBottomLeft,
      this.drawingRectangleSize
    );

    this.current!.draw(uniforms);
  }

  public destroy(): void {
    this.programs.forEach((p) => p.program.destroy());
  }

  private async createProgram(
    descriptors: Array<DrawableDescriptor>,
    substitutions: { [name: string]: any },
    combination: Array<number>,
    shaderSources: [string, string]
  ): Promise<void> {
    const processedSubstitutions = {
      macroDefinitions: this.getMacroDefinitions(combination, descriptors),
      declarations: this.getDeclarations(combination, descriptors),
      functionCalls: this.getFunctionCalls(combination, descriptors),
      ...substitutions,
    };

    const program = new FragmentShaderOnlyProgram(this.gl);
    await program.initialize(shaderSources, processedSubstitutions);

    this.programs.push({
      program,
      values: combination,
    });
  }

  private getMacroDefinitions(
    combination: Array<number>,
    descriptors: Array<DrawableDescriptor>
  ): string {
    return combination
      .map((v, i) => `#define ${descriptors[i].uniformCountMacroName} ${v}`)
      .join('\n');
  }

  private getDeclarations(
    combination: Array<number>,
    descriptors: Array<DrawableDescriptor>
  ): string {
    return combination
      .map((v, i) => {
        if (v == 0 || descriptors[i].sdf === undefined) {
          return '';
        }

        return descriptors[i].sdf!.shader;
      })
      .join('\n');
  }

  private getFunctionCalls(
    combination: Array<number>,
    descriptors: Array<DrawableDescriptor>
  ): string {
    return combination
      .map((v, i) => {
        if (v == 0 || descriptors[i].sdf === undefined) {
          return '';
        }

        return `${descriptors[i].sdf!.distanceFunctionName}(minDistance, color);`;
      })
      .join('\n');
  }
}
