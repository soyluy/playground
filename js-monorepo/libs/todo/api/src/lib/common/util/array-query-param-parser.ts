export function parseArrayQueryParam<T>(
  value: string | string[],
  apply: (value: string) => T,
): T[] {
  if (Array.isArray(value)) {
    return value.map(apply);
  }
  return [apply(value)];
}
