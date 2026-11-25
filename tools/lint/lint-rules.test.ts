import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vite-plus/test';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const FIXTURES = [
  'tools/lint/fixtures/packages/money/src/violations.ts',
  'tools/lint/fixtures/packages/schwab-client/src/violations.ts',
];

type Report = {
  readonly diagnostics: readonly {
    readonly code: string;
    readonly filename: string;
    readonly labels: readonly { readonly span: { readonly line: number } }[];
  }[];
};

function expected(file: string): string[] {
  const lines = readFileSync(`${ROOT}/${file}`, 'utf8').split('\n');
  return lines
    .flatMap((line, index) => {
      const match = /\/\/ expect(-next)?: (\S+)/.exec(line);
      if (match === null) return [];
      return [`${String(index + (match[1] === undefined ? 1 : 2))} ${String(match[2])}`];
    })
    .toSorted();
}

describe('lint rules', () => {
  let report: Report;

  beforeAll(async () => {
    const stdout = await new Promise<string>((resolve) => {
      execFile(
        `${ROOT}/node_modules/.bin/vp`,
        ['lint', '-f', 'json', ...FIXTURES],
        { cwd: ROOT, env: { ...process.env, LINT_FIXTURES: '1' } },
        // Violations make the exit code non-zero, so only the output matters.
        (_error, out) => {
          resolve(out);
        },
      );
    });
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a wrong shape fails the tests
    report = JSON.parse(stdout) as Report;
  }, 60_000);

  it.each(FIXTURES)('%s reports exactly the expected violations', (file) => {
    const actual = report.diagnostics
      .filter((d) => d.filename === file)
      .map((d) => `${String(d.labels[0]?.span.line)} ${d.code}`)
      .toSorted();
    expect(expected(file).length).toBeGreaterThan(0);
    expect(actual).toEqual(expected(file));
  });
});
