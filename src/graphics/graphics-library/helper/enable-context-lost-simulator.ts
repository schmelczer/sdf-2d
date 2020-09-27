let isEnabled = false;

export const enableContextLostSimulator = (canvas: HTMLCanvasElement) => {
  if (isEnabled) {
    return;
  }

  isEnabled = true;

  const gl = canvas.getContext('webgl2')!;
  const ext = gl.getExtension('WEBGL_lose_context');

  const simulateContextLost = () => {
    ext!.loseContext();
    console.log('lost');

    const restoreTimeout = Math.random() * 500;
    setTimeout(() => {
      ext!.restoreContext();
      console.log('restored');
    }, restoreTimeout);

    setTimeout(() => simulateContextLost(), restoreTimeout + Math.random() * 500);
  };

  setTimeout(simulateContextLost, 1000);
};
