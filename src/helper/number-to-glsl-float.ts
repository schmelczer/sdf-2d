/**
 * @internal
 *
 * Returns non-numbers as is.
 */
export const numberToGlslFloat = (value: number | string): string =>
  Number.isInteger(value) ? `${value}.0` : value.toString();
