export enum WrapOptions {
  CLAMP_TO_EDGE = 'CLAMP_TO_EDGE',
  REPEAT = 'REPEAT',
  MIRRORED_REPEAT = 'MIRRORED_REPEAT',
}

export enum FilteringOptions {
  LINEAR = 'LINEAR',
  NEAREST = 'NEAREST',
}

export interface TextureOptions {
  wrapS: WrapOptions;
  wrapT: WrapOptions;
  minFilter: FilteringOptions;
  maxFilter: FilteringOptions;
}

export type TextureWithOptions = {
  source: TexImageSource;
  overrides: Partial<TextureOptions>;
};
