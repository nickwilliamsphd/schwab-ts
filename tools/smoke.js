// Imports a built package by name, as a consumer would. This checks that its
// "exports" map points at files that the build really produced.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const name = process.argv[2];
const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const types = manifest.exports['.'].types;
if (!existsSync(types)) throw new Error(`${name}: missing ${types}`);

// Resolved from the package's own directory, through its own exports.
const { resolve } = createRequire(`${process.cwd()}/package.json`);
const url = pathToFileURL(resolve(name)).href;
const exported = Object.keys(await import(url));
if (exported.length === 0) throw new Error(`${name} exports nothing`);
