import type { UserConfig } from 'vite-plus';

type LintConfig = NonNullable<UserConfig['lint']>;

/** Packages whose behavior must depend only on their inputs (ADR-0008). */
export const DETERMINISTIC_PACKAGES = [
  'money',
  'broker-port',
  'sim-broker',
  'broker-conformance',
] as const;

const FIXTURES = 'tools/lint/fixtures/**';
const INJECT = 'Inject this instead (ADR-0008).';
const EXACT = 'Use @nickwilliamsphd/money to parse numbers exactly.';

const parseFloatGlobal = { name: 'parseFloat', message: EXACT };
const parseFloatProperty = { object: 'Number', property: 'parseFloat', message: EXACT };

const injectedGlobals = ['fetch', 'setTimeout', 'setInterval', 'crypto', 'globalThis'];
const injectedProperties = [
  { object: 'Date', property: 'now', message: INJECT },
  { object: 'performance', property: 'now', message: INJECT },
  { object: 'Math', property: 'random', message: INJECT },
  { object: 'process', property: 'env', message: INJECT },
];

export function lintConfig(options: { readonly includeFixtures: boolean }): LintConfig {
  return {
    plugins: ['typescript', 'import', 'unicorn', 'oxc'],
    jsPlugins: ['./tools/lint/plugin.js'],
    ignorePatterns: ['dist/**', 'coverage/**', ...(options.includeFixtures ? [] : [FIXTURES])],
    options: { typeAware: true, typeCheck: !options.includeFixtures },
    categories: { correctness: 'error', suspicious: 'error' },
    rules: {
      'no-console': 'error',
      'no-restricted-globals': ['error', parseFloatGlobal],
      'no-restricted-properties': ['error', parseFloatProperty],
      'import/no-default-export': 'error',
      'typescript/consistent-type-imports': 'error',
      'typescript/no-explicit-any': 'error',
      'typescript/no-floating-promises': 'error',
      'typescript/no-misused-promises': 'error',
      'typescript/no-non-null-assertion': 'error',
      'typescript/restrict-template-expressions': 'error',
      'typescript/switch-exhaustiveness-check': 'error',
    },
    overrides: [
      {
        files: DETERMINISTIC_PACKAGES.map((name) => `**/packages/${name}/src/**`),
        rules: {
          'local/no-current-date': 'error',
          'no-restricted-globals': [
            'error',
            parseFloatGlobal,
            ...injectedGlobals.map((name) => ({ name, message: INJECT })),
          ],
          'no-restricted-properties': ['error', parseFloatProperty, ...injectedProperties],
          'no-restricted-imports': [
            'error',
            { patterns: [{ group: ['node:*'], message: INJECT }] },
          ],
        },
      },
      {
        // Tools require a default export here.
        files: ['**/vite.config.ts', 'tools/lint/plugin.js'],
        rules: { 'import/no-default-export': 'off' },
      },
    ],
  };
}
