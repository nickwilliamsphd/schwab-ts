import { describe, expect, it } from 'vite-plus/test';

import { compareDerived, derivedFromWire, derivedToString, WireNumber } from '../src/index.ts';

const derived = (text: string) => derivedFromWire(new WireNumber(text));

describe('DerivedAmount', () => {
  it.each([
    ['23.456789012', '23.456789012'],
    ['0.3333333333333333', '0.3333333333333333'],
    ['5e-7', '0.0000005'],
    ['-12.500', '-12.5'],
    ['1E3', '1000'],
    ['0', '0'],
  ])('keeps %s exactly', (text, out) => {
    expect(derivedToString(derived(text))).toBe(out);
  });

  it('compares across scales', () => {
    expect(compareDerived(derived('1.5'), derived('1.50'))).toBe(0);
    expect(compareDerived(derived('1.5'), derived('1.51'))).toBe(-1);
    expect(compareDerived(derived('-1'), derived('-1.0000001'))).toBe(1);
  });
});
