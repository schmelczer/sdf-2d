/** @internal */
declare module '*.glsl' {
  const content: string;
  export default content;
}

/** Injected at build time by webpack's DefinePlugin. @internal */
declare const __VERSION__: string;
