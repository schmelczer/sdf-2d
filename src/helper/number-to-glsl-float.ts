/**
 * @internal
 *
 * Returns non-numbers as is.
 */
export const numberToGlslFloat = (value: number | string): string => {
  if (typeof value !== 'number') {
    return String(value);
  }

  const asString = value.toString();

  // Very large integers stringify in exponent notation (1e21)
  return Number.isInteger(value) && !asString.includes('e') ? `${asString}.0` : asString;
};
