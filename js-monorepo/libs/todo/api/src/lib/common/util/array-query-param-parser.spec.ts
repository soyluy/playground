import { parseArrayQueryParam } from './array-query-param-parser';

describe('parseArrayQueryParam', () => {
  describe('when value is a single string', () => {
    it('wraps the transformed value in an array', () => {
      const result = parseArrayQueryParam('42', Number);

      expect(result).toEqual([42]);
    });

    it('applies the transform function to the single value', () => {
      const upper = (s: string) => s.toUpperCase();

      expect(parseArrayQueryParam('hello', upper)).toEqual(['HELLO']);
    });
  });

  describe('when value is an array of strings', () => {
    it('applies the transform to every element', () => {
      const result = parseArrayQueryParam(['1', '2', '3'], Number);

      expect(result).toEqual([1, 2, 3]);
    });

    it('preserves the order of elements', () => {
      const result = parseArrayQueryParam(['c', 'a', 'b'], (s) => s);

      expect(result).toEqual(['c', 'a', 'b']);
    });

    it('returns an empty array when given an empty array', () => {
      const result = parseArrayQueryParam([], Number);

      expect(result).toEqual([]);
    });
  });
});
