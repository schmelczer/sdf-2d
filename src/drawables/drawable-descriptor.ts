import { Drawable } from './drawable';

export interface DrawableDescriptor {
  uniformName: string;
  countMacroName: string;
  shaderCombinationSteps: Array<number>;
  readonly empty: Drawable;
}
