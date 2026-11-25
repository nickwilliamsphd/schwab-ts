// Each "expect:" line must be reported by exactly that rule, and nothing else
// in this file may be reported.
export const a = Date.now(); // expect: eslint(no-restricted-properties)
export const b = new Date(); // expect: local(no-current-date)
export const c = Date(); // expect: local(no-current-date)
export const okDate = new Date(0);
export const d = performance.now(); // expect: eslint(no-restricted-properties)
export const e = Math.random(); // expect: eslint(no-restricted-properties)
export const f = process.env; // expect: eslint(no-restricted-properties)
export const g = fetch; // expect: eslint(no-restricted-globals)
export const h = setTimeout; // expect: eslint(no-restricted-globals)
export const i = setInterval; // expect: eslint(no-restricted-globals)
export const j = crypto; // expect: eslint(no-restricted-globals)
export const k = globalThis; // expect: eslint(no-restricted-globals)
export const l = parseFloat; // expect: eslint(no-restricted-globals)
export const m = Number.parseFloat('1'); // expect: eslint(no-restricted-properties)
export { readFile } from 'node:fs'; // expect: eslint(no-restricted-imports)
