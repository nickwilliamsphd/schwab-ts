import * as fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { integerText, parseJson, WireNumber } from '../src/index.ts';

describe('parseJson', () => {
  it('keeps int64 digits that JSON.parse corrupts', () => {
    const text = '{"orderId":9007199254740993}';
    expect(JSON.parse(text)).toEqual({ orderId: 9_007_199_254_740_992 });
    expect(parseJson(text)).toEqual({ orderId: new WireNumber('9007199254740993') });
  });

  it('keeps numbers as written, at any depth', () => {
    expect(parseJson('[1.50,{"a":[1.0E-4]}]')).toEqual([
      new WireNumber('1.50'),
      { a: [new WireNumber('1.0E-4')] },
    ]);
    expect(parseJson('-0')).toEqual(new WireNumber('-0'));
  });

  it('leaves everything else alone, including numeric strings', () => {
    expect(parseJson('{"a":"421.55","b":null,"c":true}')).toEqual({
      a: '421.55',
      b: null,
      c: true,
    });
  });

  it.each(['', '{', '01', 'NaN'])('rejects invalid JSON %j', (text) => {
    expect(() => parseJson(text)).toThrow(SyntaxError);
  });

  it('preserves the digits of any integer', () => {
    fc.assert(
      fc.property(fc.bigInt(), (n) => {
        expect(String(parseJson(n.toString()))).toBe(n.toString());
      }),
    );
  });
});

describe('parseJson on a runtime without source text', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('throws instead of returning digits that may be wrong', async () => {
    const parse = JSON.parse;
    vi.spyOn(JSON, 'parse').mockImplementation((text, reviver) =>
      parse(text, (key, value): unknown =>
        reviver === undefined ? value : Reflect.apply(reviver, {}, [key, value, {}]),
      ),
    );
    vi.resetModules();
    const fresh = await import('../src/wire-number.ts');
    expect(() => fresh.parseJson('[1]')).toThrow('source text is unavailable');
  });
});

describe('WireNumber', () => {
  const n = new WireNumber('421.55');

  it('refuses arithmetic and loose comparison', () => {
    expect(() => Number(n)).toThrow(TypeError);
    expect(() => Reflect.apply(Math.max, undefined, [n, 1])).toThrow(TypeError);
  });

  it('keeps its digits when printed or serialized', () => {
    expect(String(n)).toBe('421.55');
    expect(n.toString()).toBe('421.55');
    expect(JSON.stringify({ n })).toBe('{"n":"421.55"}');
  });

  it.each(['', '01', '.5', '1.', '+1', 'NaN', 'Infinity', '1 '])('rejects %j', (text) => {
    expect(() => new WireNumber(text)).toThrow(RangeError);
  });
});

describe('integerText', () => {
  it('returns every digit', () => {
    expect(integerText(new WireNumber('9223372036854775807'))).toBe('9223372036854775807');
  });

  it.each(['-1', '1.0', '1e3'])('rejects %s', (text) => {
    expect(() => integerText(new WireNumber(text))).toThrow(RangeError);
  });
});
