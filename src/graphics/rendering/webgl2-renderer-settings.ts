export interface WebGl2RendererSettings {
  enableHighDpiRendering: boolean;
  enableStopwatch: boolean;
  tileMultiplier: number;
  shaderMacros: {
    softShadowTraceCount: string;
    hardShadowTraceCount: string;
  };
}
