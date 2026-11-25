import * as fc from 'fast-check';
import { describe, expect, it } from 'vite-plus/test';

import {
  addPrice,
  comparePrice,
  priceFromString,
  priceFromWire,
  priceToWire,
  subPrice,
  WireNumber,
} from '../src/index.ts';

const wire = (text: string) => priceFromWire(new WireNumber(text));

describe('priceFromString', () => {
  it.each([
    ['421.55', 421_550_000n],
    ['0.000001', 1n],
    ['-1.5', -1_500_000n],
    ['-0', 0n],
    ['7', 7_000_000n],
    ['9007199254740993.000001', 9_007_199_254_740_993_000_001n],
  ])('parses %s exactly', (text, micros) => {
    expect(priceFromString(text)).toBe(micros);
  });

  it.each(['', '.5', '1.', '1e2', '+1', ' 1', '1\n', '1,000', '0.0000001', 'NaN', '0x10', '١'])(
    'rejects %j',
    (text) => {
      expect(() => priceFromString(text)).toThrow(RangeError);
    },
  );
});

describe('priceFromWire', () => {
  it.each([
    ['421.55', 421_550_000n],
    ['421.5500000000', 421_550_000n],
    ['1.0E-4', 100n],
    ['4.2155e+2', 421_550_000n],
    ['1E3', 1_000_000_000n],
    ['-0.0', 0n],
  ])('converts %s exactly', (text, micros) => {
    expect(wire(text)).toBe(micros);
  });

  it.each(['23.456789012', '5e-7'])('throws rather than rounds %s', (text) => {
    expect(() => wire(text)).toThrow('more than 6 places');
  });

  it.each(['1e101', '1e-101', '1e999999999'])('rejects the extreme exponent %s', (text) => {
    expect(() => wire(text)).toThrow('exponent out of range');
  });

  it('rejects absurdly long numbers', () => {
    expect(() => wire('1'.repeat(101))).toThrow('invalid decimal');
  });
});

describe('priceToWire', () => {
  it.each([
    ['421.5', 2, '421.50'],
    ['0.05', 2, '0.05'],
    ['-0.05', 2, '-0.05'],
    ['0', 2, '0.00'],
    ['0.1234', 4, '0.1234'],
  ] as const)('formats %s at %d places', (text, decimals, out) => {
    expect(priceToWire(priceFromString(text), decimals)).toBe(out);
  });

  it('defaults to 2 places and throws rather than rounds', () => {
    expect(priceToWire(priceFromString('1.25'))).toBe('1.25');
    expect(() => priceToWire(priceFromString('1.255'))).toThrow('not representable at 2 places');
    expect(() => priceToWire(priceFromString('-1.25555'), 4)).toThrow(RangeError);
  });
});

describe('arithmetic', () => {
  it('adds and subtracts exactly where doubles do not', () => {
    const sum = addPrice(priceFromString('0.1'), priceFromString('0.2'));
    expect(sum).toBe(priceFromString('0.3'));
    expect(subPrice(sum, priceFromString('0.1'))).toBe(priceFromString('0.2'));
  });

  it('compares', () => {
    const [low, high] = [priceFromString('1.01'), priceFromString('1.02')];
    expect([comparePrice(low, high), comparePrice(high, low), comparePrice(low, low)]).toEqual([
      -1, 1, 0,
    ]);
  });
});

describe('properties', () => {
  const ticks = fc.bigInt({ min: -(10n ** 18n), max: 10n ** 18n });

  it.each([2, 4] as const)('round-trips every price at %d places', (decimals) => {
    fc.assert(
      fc.property(ticks, (n) => {
        const digits = (n < 0n ? -n : n).toString().padStart(decimals + 1, '0');
        const text = `${n < 0n ? '-' : ''}${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`;
        expect(priceToWire(priceFromString(text), decimals)).toBe(text);
        expect(wire(text)).toBe(priceFromString(text));
      }),
    );
  });

  it('subtraction undoes addition', () => {
    fc.assert(
      fc.property(ticks, ticks, (a, b) => {
        const [x, y] = [priceFromString(a.toString()), priceFromString(b.toString())];
        expect(subPrice(addPrice(x, y), y)).toBe(x);
      }),
    );
  });
});
