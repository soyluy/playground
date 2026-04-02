export function parseArrayQueryParam<T>(
  value: string | string[],
  apply?: (value: string) => T,
): T[] {
  if (Array.isArray(value)) {
    if (apply) {
      return value.map(apply);
    } else {
      return value.map((v) => v as unknown as T);
    }
  } else {
    if (apply) {
      return [apply(value)];
    } else {
      return [value as unknown as T];
    }
  }
}
