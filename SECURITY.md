# Security policy

## Supported versions

Nothing has been released. Only the latest commit on `main` is supported.

## Reporting a vulnerability

Please **do not open a public issue**. Use
[private vulnerability reporting](https://github.com/nickwilliamsphd/schwab-ts/security/advisories/new).

This is a solo project, so responses are best effort.

**Never include live credentials, tokens, account numbers, or account hashes in
a report.** Replace them with `REDACTED`.

## In scope

- Credentials, tokens, or account data exposed in logs, errors, fixtures, or
  package contents
- Duplicate, wrong, or unintended orders
- An uncertain outcome reported as certain, such as a timeout reported as a
  rejection or a failed lookup reported as flat
- Prices, quantities, or IDs corrupted in parsing or serialization
- Supply-chain problems in dependencies, workflows, or releases

Vulnerabilities in Schwab's own systems should go to Schwab.

## If you expose a credential

1. Treat it as compromised, even if you deleted the commit. Public Git data can
   be copied before you remove it.
2. Reset the app secret or revoke the app's access through Schwab. Do this
   before cleaning up Git history.
3. Check the account for orders you did not place, and contact Schwab if you
   find any.
4. Report it privately if this project caused the exposure.

## Credentials in this repository

Schwab credentials are never stored in GitHub, including in Actions secrets.
Tests that need them run only on a maintainer's own machine.
