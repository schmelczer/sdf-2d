/**
 * @internal
 */
export const formatLog = (originator: string, message: any): string => {
  return `[SDF-2D][${originator}]: ${message}`;
};
