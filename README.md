# schwab-ts

An unofficial TypeScript adapter for the Schwab Trader API (Individual).

> [!WARNING]
> **This software is being built to place real orders with real money.** It is
> pre-alpha, nothing is published, and it is not ready to trade with. You are
> responsible for every order it sends.

This project is not affiliated with, endorsed by, or supported by Charles
Schwab & Co., Inc. Nothing here is investment advice.

## Status

Early scaffolding. There is no usable code yet.

## Why another client

Existing clients mostly cover the endpoints. This one is about what happens
when a call goes wrong:

- **Uncertain outcomes are explicit.** A timed-out order is `unknown` until it
  is resolved. It is never assumed to have failed or succeeded.
- **"Not sent" is separate from "unknown".** If an order never left the
  process, for example because the weekly login expired, the result says so.
- **A failed lookup is not an absence.** Lookups return found, absent, or
  failed, so a failed request never looks like a flat account.
- **Order mutations are never retried automatically.** Schwab provides no
  idempotency key, so a blind retry can duplicate an order.
- **No floating-point prices or lossy IDs.** Both are parsed exactly.
- **Unrecognized venue values are preserved**, not mapped to a guess.

## Planned packages

| Package | Purpose |
|---|---|
| `money` | Exact price types with no dependencies |
| `broker-port` | Broker-neutral domain types and interface |
| `schwab-client` | Typed wire client for the Schwab APIs |
| `schwab-broker` | `broker-port` implemented over `schwab-client` |
| `sim-broker` | Deterministic simulator with fault injection |
| `broker-conformance` | One test suite that every broker must pass |

## Prior art

The design draws on [schwab-py](https://github.com/alexgolec/schwab-py),
[schwabdev](https://github.com/tylerebowers/Schwabdev),
[@sudowealth/schwab-api](https://github.com/sudowealth/schwab-api), and the
[NautilusTrader](https://nautilustrader.io/) adapter guide.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md). Report vulnerabilities privately as
described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
