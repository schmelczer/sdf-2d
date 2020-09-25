import { Drawable } from './drawable';

export interface DrawableDescriptor {
  propertyUniformMapping: { [property: string]: string };
  uniformCountMacroName: string;
  sdf?: {
    shader: string;
    isInverted?: boolean;
    distanceFunctionName: string;
  };
  shaderCombinationSteps: Array<number>;
  readonly empty: Drawable;
}
