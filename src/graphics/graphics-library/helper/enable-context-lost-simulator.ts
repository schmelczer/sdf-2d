import { formatLog } from '../../../helper/format-log';

/** @internal */
let isEnabled = false;

/** @internal */
export const enableContextLostSimulator = (canvas: HTMLCanvasElement) => {
  if (isEnabled) {
    return;
  }

  isEnabled = true;

  const gl = canvas.getContext('webgl2')!;
  const ext = gl.getExtension('WEBGL_lose_context')!;

  const simulateContextLost = () => {
    ext.loseContext();
    console.info(formatLog('context-lost-simulator', 'lost'));

    const restoreTimeout = Math.random() * 500;
    setTimeout(() => {
      ext.restoreContext();
      console.info(formatLog('context-lost-simulator', 'restored'));
    }, restoreTimeout);

    setTimeout(() => simulateContextLost(), restoreTimeout + Math.random() * 500);
  };

  setTimeout(simulateContextLost, 1000);
};
