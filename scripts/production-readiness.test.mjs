import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = join(dirname(fileURLToPath(import.meta.url)), 'production-readiness.mjs');
const required = ['app/page.tsx', 'app/api/[[...route]]/route.ts', 'lib/db.ts', 'schema.sql'];

function check(lockfile) {
  const dir = mkdtempSync(join(tmpdir(), 'quotient-readiness-'));
  try {
    for (const path of required) {
      const target = join(dir, path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, '');
    }
    copyFileSync(script, join(dir, 'production-readiness.mjs'));
    // The readiness checker uses ESM imports; preserve module semantics.
    writeFileSync(join(dir, 'package.json'), '{"type":"module"}');
    if (lockfile !== undefined) writeFileSync(join(dir, 'package-lock.json'), lockfile);
    return spawnSync(process.execPath, ['production-readiness.mjs'], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: 'postgresql://test:test@localhost:5432/test?sslmode=require', NODE_ENV: 'test' }
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('readiness rejects missing lockfile', () => {
  const result = check();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /package-lock.json missing/);
});

test('readiness rejects empty lockfile', () => {
  const result = check('');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot be parsed/);
});

test('readiness rejects malformed lockfile structure', () => {
  const result = check(JSON.stringify({ lockfileVersion: 3, packages: { '': {} } }));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid or empty/);
});

test('readiness accepts valid lockfile structure', () => {
  const result = check(JSON.stringify({
    lockfileVersion: 3,
    packages: { '': { name: 'quotient-ai-production' }, 'node_modules/example': { version: '1.0.0' } }
  }));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Static release prerequisites present/);
});
