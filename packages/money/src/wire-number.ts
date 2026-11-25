/**
 * A JSON number kept as the exact text the venue sent.
 *
 * `JSON.parse` turns every number into a double before anyone sees it, which
 * corrupts integers above 2^53 and hides how a price was written. Arithmetic on
 * a WireNumber throws, so it has to be converted on purpose.
 */
export class WireNumber {
  readonly text: string;

  constructor(text: string) {
    if (!JSON_NUMBER.test(text)) throw new RangeError(`not a JSON number: ${text}`);
    this.text = text;
  }

  toString(): string {
    return this.text;
  }

  /** Serializes as a string, so the digits survive logs and recordings. */
  toJSON(): string {
    return this.text;
  }

  [Symbol.toPrimitive](hint: string): string {
    if (hint === 'string') return this.text;
    throw new TypeError('WireNumber cannot be used in arithmetic; convert it explicitly');
  }
}

const JSON_NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

type SourceReviver = (
  key: string,
  value: unknown,
  context: { readonly source?: string },
) => unknown;

// The reviver's third argument is in every supported Node, but not yet in the
// TypeScript 7.0 library types.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see above
const parseWithSource = JSON.parse as (text: string, reviver: SourceReviver) => unknown;

/** Parse JSON with every number replaced by a {@link WireNumber}. */
export function parseJson(text: string): unknown {
  return parseWithSource(text, (_key, value, context) => {
    if (typeof value !== 'number') return value;
    // Without the source text the digits may already be wrong.
    if (context.source === undefined) throw new Error('JSON source text is unavailable');
    return new WireNumber(context.source);
  });
}

/** Read an integer ID as text, so int64 values keep every digit. */
export function integerText(n: WireNumber): string {
  if (!/^\d+$/.test(n.text)) throw new RangeError(`not a non-negative integer: ${n.text}`);
  return n.text;
}
