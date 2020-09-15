export const exponentialDecay = (
  accumulator: number,
  nextValue: number,
  biasOfNextValue: number
) => accumulator * (1 - biasOfNextValue) + nextValue * biasOfNextValue;
