type TransformInput = {
  value: unknown;
};

const isNonNullObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toNumber = ({ value }: TransformInput): number => Number(value);

export const toStringArray = ({ value }: TransformInput): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    return [value];
  }

  return [];
};

export const toOptionalStringArray = ({
  value,
}: TransformInput): string[] | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    return [value];
  }

  return undefined;
};

export const toObjectOrDefault = ({
  value,
}: TransformInput): Record<string, unknown> => {
  if (value === null || value === undefined) {
    return {};
  }

  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value);
      return isNonNullObject(parsedValue) ? parsedValue : {};
    } catch {
      return {};
    }
  }

  return isNonNullObject(value) ? value : {};
};

export const toOptionalObject = ({
  value,
}: TransformInput): Record<string, unknown> | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value);
      return isNonNullObject(parsedValue) ? parsedValue : undefined;
    } catch {
      return undefined;
    }
  }

  return isNonNullObject(value) ? value : undefined;
};
