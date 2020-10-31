export interface RendererInfo {
  isWebGL2: boolean;
  vendor?: string;
  renderer?: string;
  sdf2dVersion?: string;
  extensions: { [name: string]: boolean };
  floatInterpolationEnabled?: boolean;
  programCount?: number;
  renderPasses: {
    distance: {
      renderScale?: number;
      drawableCount?: number;
      drawnDrawableCount?: number;
      tileCount?: number;
    };
    lights: {
      renderScale?: number;
      drawnDrawableCount?: number;
    };
  };
  startupTimeInMilliseconds?: number;
  [k: string]: any;
}
