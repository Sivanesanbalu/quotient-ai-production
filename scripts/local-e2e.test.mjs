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

test('E2E executable refuses remote production targets before any request',async()=>{
  const {spawnSync}=await import('node:child_process');
  for(const [url,optIn] of [
    ['https://quotient-ai-fullstack.vercel.app','YES'],
    ['https://example.com','YES'],
    ['http://127.0.0.1:65534','NO'],
  ]){
    const run=spawnSync(process.execPath,['scripts/local-e2e.mjs'],{
      env:{...process.env,E2E_BASE_URL:url,E2E_DISPOSABLE_DB:optIn},
      encoding:'utf8',timeout:5000
    });
    assert.notEqual(run.status,0,'Unsafe E2E target unexpectedly accepted: '+url);
    assert.match(run.stderr,/Refusing writes:/);
  }
});
