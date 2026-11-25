import { decimalFromWire, formatScaled } from './decimal.js';
import type { WireNumber } from './wire-number.js';

declare const DerivedBrand: unique symbol;

/**
 * An exact amount the venue computed, such as average cost. It can have more
 * places than any price, so it is not a {@link Price} and cannot be ordered at.
 */
export type DerivedAmount = {
  readonly coefficient: bigint;
  readonly scale: number;
  readonly [DerivedBrand]: true;
};

export function derivedFromWire(n: WireNumber): DerivedAmount {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the brand exists only in the type system
  return decimalFromWire(n) as DerivedAmount;
}

export function derivedToString(amount: DerivedAmount): string {
  return formatScaled(amount.coefficient, amount.scale);
}

export function compareDerived(a: DerivedAmount, b: DerivedAmount): -1 | 0 | 1 {
  const scale = Math.max(a.scale, b.scale);
  const left = a.coefficient * 10n ** BigInt(scale - a.scale);
  const right = b.coefficient * 10n ** BigInt(scale - b.scale);
  if (left === right) return 0;
  return left < right ? -1 : 1;
}
