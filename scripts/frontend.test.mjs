import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const frontend=readFileSync('app/page.tsx','utf8');
test('dashboard data failure does not clear the authenticated user',()=>{
 assert.match(frontend,/setUser\(me\.user\);try\{/);
 assert.match(frontend,/Dashboard data unavailable:/);
 assert.doesNotMatch(frontend,/setQuotes\(q\.quotes\|\|\[\]\)\}catch\{setUser\(null\)\}/);
});
