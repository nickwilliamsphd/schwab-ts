import { defineConfig } from 'vite-plus';

import { lintConfig } from './tools/lint/config.ts';

export default defineConfig({
  fmt: {
    singleQuote: true,
    printWidth: 100,
    ignorePatterns: ['tools/lint/fixtures/**', '**/*.md'],
  },
  lint: lintConfig({ includeFixtures: process.env['LINT_FIXTURES'] === '1' }),
  test: {
    include: ['packages/*/test/**/*.test.ts', 'tools/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**'],
      thresholds: {
        'packages/money/src/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
      },
    },
  },
});
