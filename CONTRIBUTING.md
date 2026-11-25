# Contributing

This project is at an early stage and its interfaces will change. Please open
an issue before starting anything large.

## Hard rules

These protect people's money. A pull request that breaks one won't be merged.

1. **No credentials or account data**, anywhere, including history.
2. **No network access in tests.** Live checks are manual and opt-in.
3. **No floating-point arithmetic on prices.**
4. **Never retry an order mutation automatically.** This covers place, replace,
   and cancel.
5. **Keep outcomes distinct.** "Not sent", "rejected", "accepted but the ID is
   unknown", and "unknown" are different results.
6. **A failed or too-early lookup is not an absence.**
7. **Preserve unrecognized venue values.** Never map them to a known meaning.
8. **Inject time, randomness, and transport** in deterministic packages.
9. **Wrap secrets** so they cannot be printed or serialized.

## Fixtures

Raw Schwab payloads stay in the ignored `recordings/` or `fixtures-raw/`
directories. Before committing a fixture:

- Replace account numbers, account hashes, names, and tokens with `REDACTED`.
- Replace order and transaction IDs with invented values of the same shape.
- Use distinct symbols and prices so that swapped fields fail a test.
- Read the whole file yourself. Scanners miss things.

## Pull requests

- Branch from `main` and keep each change focused.
- Add tests for behavior changes, including failure paths.
- Record significant design decisions in an ADR.
- Fill in the pull request checklist.
- Pin GitHub Actions to a full commit SHA and containers to a digest.

Please report security problems through [SECURITY.md](SECURITY.md) instead of a
public issue or pull request.
