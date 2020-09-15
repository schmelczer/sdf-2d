import { IDrawable } from './i-drawable';

export interface IDrawableDescriptor {
  uniformName: string;
  countMacroName: string;
  shaderCombinationSteps: Array<number>;
  readonly empty: IDrawable;
}
