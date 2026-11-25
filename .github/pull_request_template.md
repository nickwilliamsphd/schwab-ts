## What and why

## How it was tested

## Checklist

- [ ] No credentials, tokens, account numbers, or account hashes
- [ ] Fixtures are redacted, and I read each one in full
- [ ] Tests make no network calls
- [ ] No floating-point arithmetic on prices; IDs keep full precision
- [ ] Order mutations are never retried automatically
- [ ] "Not sent", "rejected", "accepted, ID unknown", and "unknown" stay distinct
- [ ] A failed or too-early lookup is never treated as an absence
- [ ] Unrecognized venue values are preserved
- [ ] An ADR is added or updated if a design decision changed
