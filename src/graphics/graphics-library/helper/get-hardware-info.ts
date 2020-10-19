import { UniversalRenderingContext } from '../universal-rendering-context';
import { tryEnableExtension } from './enable-extension';

export const getHardwareInfo = (
  gl: UniversalRenderingContext
): { vendor: string; renderer: string } | null => {
  const debugInfo = tryEnableExtension(gl, 'WEBGL_debug_renderer_info');
  if (debugInfo) {
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return {
      vendor,
      renderer,
    };
  }

  return null;
};
