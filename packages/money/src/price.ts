import { decimalFromWire, formatScaled, unscaled } from './decimal.js';
import type { Decimal } from './decimal.js';
import type { WireNumber } from './wire-number.js';

declare const PriceBrand: unique symbol;

/** Fixed-point price in integer micro-units (1e-6). Never a JS number. */
export type Price = bigint & { readonly [PriceBrand]: true };

const PRICE_SCALE = 6;
const PRICE = /^-?\d{1,30}(?:\.\d{1,6})?$/;

/** Parse a plain decimal such as "421.55". Rejects exponents and over 6 places. */
export function priceFromString(text: string): Price {
  if (!PRICE.test(text)) throw new RangeError(`invalid price: ${text.slice(0, 100)}`);
  return toMicros(unscaled(text));
}

/**
 * Convert a venue price exactly. Exponent form is accepted because it is valid
 * JSON. Throws rather than rounds when the value needs more than 6 places.
 */
export function priceFromWire(n: WireNumber): Price {
  const decimal = decimalFromWire(n);
  if (decimal.scale > PRICE_SCALE) {
    throw new RangeError(`price needs more than 6 places: ${n.text}`);
  }
  return toMicros(decimal);
}

/** The only place a bigint becomes a Price. */
function brand(micros: bigint): Price {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the brand exists only in the type system
  return micros as Price;
}

function toMicros({ coefficient, scale }: Decimal): Price {
  return brand(coefficient * 10n ** BigInt(PRICE_SCALE - scale));
}

/** Format for the wire. Throws rather than rounds. */
export function priceToWire(price: Price, decimals: 2 | 4 = 2): string {
  const step = 10n ** BigInt(PRICE_SCALE - decimals);
  if (price % step !== 0n) {
    throw new RangeError(`price not representable at ${String(decimals)} places`);
  }
  return formatScaled(price / step, decimals);
}

export function addPrice(a: Price, b: Price): Price {
  return brand(a + b);
}

export function subPrice(a: Price, b: Price): Price {
  return brand(a - b);
}

export function comparePrice(a: Price, b: Price): -1 | 0 | 1 {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
