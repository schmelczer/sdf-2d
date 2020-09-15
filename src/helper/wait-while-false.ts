export const waitWhileFalse = (body: () => boolean): Promise<void> => {
  let resolveOnDone: () => void;
  let rejectOnDone: (e: Error) => void;

  const onDone = new Promise<void>((resolve, reject) => {
    resolveOnDone = resolve;
    rejectOnDone = reject;
  });

  const waiter = () => {
    let success: boolean;

    try {
      success = body();
    } catch (e) {
      rejectOnDone(e);
      return;
    }

    if (success) {
      resolveOnDone();
    } else {
      requestAnimationFrame(waiter);
    }
  };

  waiter();
  return onDone;
};
