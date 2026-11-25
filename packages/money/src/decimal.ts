import type { WireNumber } from './wire-number.js';

/** Internal exact decimal: `coefficient / 10^scale`, with `scale >= 0`. */
export type Decimal = { readonly coefficient: bigint; readonly scale: number };

// Far beyond any real amount. Stops hostile exponents from allocating memory.
const MAX_DIGITS = 100;
const MAX_EXPONENT = 100;

const DECIMAL = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

export function parseDecimal(text: string): Decimal {
  if (text.length > MAX_DIGITS || !DECIMAL.test(text)) {
    throw new RangeError(`invalid decimal: ${text.slice(0, MAX_DIGITS)}`);
  }
  const e = text.search(/[eE]/);
  const mantissa = unscaled(e === -1 ? text : text.slice(0, e));
  const exponent = e === -1 ? 0 : Number(text.slice(e + 1));
  if (Math.abs(exponent) > MAX_EXPONENT) throw new RangeError(`exponent out of range: ${text}`);

  const scale = mantissa.scale - exponent;
  return scale >= 0
    ? stripZeros(mantissa.coefficient, scale)
    : { coefficient: mantissa.coefficient * 10n ** BigInt(-scale), scale: 0 };
}

/** Split plain decimal text, already validated, into digits and places. */
export function unscaled(text: string): Decimal {
  const dot = text.indexOf('.');
  return {
    coefficient: BigInt(text.replace('.', '')),
    scale: dot === -1 ? 0 : text.length - dot - 1,
  };
}

export function decimalFromWire(n: WireNumber): Decimal {
  return parseDecimal(n.text);
}

function stripZeros(coefficient: bigint, scale: number): Decimal {
  let c = coefficient;
  let s = scale;
  while (s > 0 && c % 10n === 0n) {
    c /= 10n;
    s -= 1;
  }
  return { coefficient: c, scale: s };
}

export function formatScaled(coefficient: bigint, scale: number): string {
  const negative = coefficient < 0n;
  const digits = (negative ? -coefficient : coefficient).toString().padStart(scale + 1, '0');
  const split = digits.length - scale;
  const body = scale === 0 ? digits : `${digits.slice(0, split)}.${digits.slice(split)}`;
  return negative ? `-${body}` : body;
}
