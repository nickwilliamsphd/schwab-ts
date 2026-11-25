// This package is not deterministic, so only the repo-wide rules apply.
export const okNow = Date.now();
export const okDate = new Date();
export const a = parseFloat('1'); // expect: eslint(no-restricted-globals)
export const b = Number.parseFloat('1'); // expect: eslint(no-restricted-properties)
console.log(a); // expect: eslint(no-console)

async function work(): Promise<void> {
  await Promise.resolve();
}

export function pick(kind: 'x' | 'y'): number {
  work(); // expect: typescript(no-floating-promises)
  // expect-next: typescript(switch-exhaustiveness-check)
  switch (kind) {
    case 'x':
      return 1;
  }
  return 0;
}

export const misused = [1].filter(work); // expect: typescript(no-misused-promises)

export function maybe(value: string | undefined): string {
  return value!; // expect: typescript(no-non-null-assertion)
}

// expect-next: import(no-default-export)
export default a;
