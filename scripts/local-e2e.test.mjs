import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('./local-e2e.mjs',import.meta.url),'utf8');

test('destructive E2E requires explicit disposable database opt-in',()=>{
  assert.match(source,/process\.env\.E2E_DISPOSABLE_DB\s*!==\s*'YES'/);
  assert.match(source,/throw Error\('Refusing writes:/);
});

test('destructive E2E restricts target to HTTP loopback',()=>{
  assert.match(source,/origin\.protocol\s*!==\s*'http:'/);
  for(const hostname of ['localhost','127.0.0.1','[::1]'])assert.ok(source.includes(hostname));
  assert.doesNotMatch(source,/https:\/\/quotient-ai-fullstack\.vercel\.app/);
});

test('E2E checks tenant isolation and cross-tenant writes',()=>{
  assert.match(source,/Tenant B sees another tenant records/);
  assert.match(source,/Cross-tenant quote creation must fail/);
});

test('E2E checks auth, procurement flow, comparison and CSV',()=>{
  for(const path of ['/api/auth/register','/api/auth/login','/api/rfqs','/api/suppliers','/api/quotes','/api/export'])assert.ok(source.includes(path));
  assert.ok(source.includes('/compare'));
});
