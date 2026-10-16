// Production-safe API contract regression tests. No database writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../app/api/[[...route]]/route.ts',import.meta.url),'utf8');

test('all API JSON responses opt out of caching',()=>{
  assert.match(source,/const json=\(data:any,status=200\)=>NextResponse\.json\(data,\{status,headers:\{'Cache-Control':'private, no-store'\}\}\)/);
});
test('mutations validate browser Origin against request hosts before route handling',()=>{
  assert.match(source,/if\(method!=='GET'\)\{const origin=req\.headers\.get\('origin'\)/);
  assert.match(source,/new URL\(origin\)/);
  assert.match(source,/allowedHosts\.includes\(parsed\.host\)/);
  assert.match(source,/return error\('Cross-origin request denied',403\)/);
});
test('session cookie has HttpOnly and SameSite Lax',()=>{
  assert.match(source,/res\.cookies\.set\('qa_session',token,\{httpOnly:true,secure:process\.env\.NODE_ENV==='production',sameSite:'lax'/);
});
test('authenticated queries scope records to the account',()=>{
  for(const entity of ['rfqs','suppliers','quotes'])assert.match(source,new RegExp('FROM '+entity+' WHERE account_id=\\$\\{u\\.id\\}'));
});
test('quote creation validates ownership of both linked records',()=>{
  assert.match(source,/FROM rfqs r JOIN suppliers s ON s\.id=\$\{b\.supplier_id\} AND s\.account_id=\$\{u\.id\}/);
  assert.match(source,/WHERE r\.id=\$\{b\.rfq_id\} AND r\.account_id=\$\{u\.id\}/);
});
test('CSV export neutralizes formula injection',()=>{
  assert.match(source,/if\(\/\^\[\\s\]\*\[=\+@-\]\/\.test\(x\)\)x=/);
});
test('auth response projections omit password hashes',()=>{
  assert.match(source,/RETURNING id,email,name/);
  assert.match(source,/user:\{id:u\.id,name:u\.name,email:u\.email\}/);
});
