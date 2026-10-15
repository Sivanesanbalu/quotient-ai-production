import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const smoke=readFileSync('scripts/smoke.mjs','utf8');
test('read-only smoke test enforces health and tenant access guards',()=>{
  for(const route of ['/api/auth/me','/api/rfqs','/api/suppliers','/api/quotes','/api/export'])assert.ok(smoke.includes(route),'Missing protected route '+route);
  assert.match(smoke,/result\.status!==401/);
  assert.match(smoke,/response\.ok/);
});
test('smoke test never requests record creation or deletion',()=>{
  assert.doesNotMatch(smoke,/method:\s*['"](?:POST|PATCH|PUT|DELETE)['"]/);
});
