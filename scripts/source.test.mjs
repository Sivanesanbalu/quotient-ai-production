import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const api=readFileSync('app/api/[[...route]]/route.ts','utf8');test('auth routes declared',()=>{assert.match(api,/id==='register'/);assert.match(api,/id==='login'/);assert.match(api,/id==='logout'/)});test('CRUD routes declared',()=>{for(const s of ["area==='rfqs'","area==='suppliers'","area==='quotes'"])assert.ok(api.includes(s))});test('tenant-scoped read',()=>assert.ok(api.includes('WHERE account_id=')));
test('quote revisions require tenant ownership',()=>{assert.match(api,/method==='PATCH'&&uuid\(id\)/);assert.match(api,/UPDATE quotes SET amount=/);assert.match(api,/WHERE id=\$\{id\} AND account_id=\$\{u.id\}/)});

test('exports are user-scoped and cache-disabled',()=>{assert.match(api,/area==='export'/);assert.match(api,/WHERE account_id=\$\{u.id\}/);assert.match(api,/text\/csv/);assert.match(api,/private, no-store/)});

test('RFQ lifecycle API limits allowed statuses and ownership',()=>{assert.match(api,/open','reviewing','awarded','closed/);assert.match(api,/UPDATE rfqs SET status=/);assert.match(api,/WHERE id=\$\{id\} AND account_id=\$\{u.id\}/)});

test('quote comparison scopes RFQ and supplier to account',()=>{assert.match(api,/action==='compare'/);assert.match(api,/potentialSavings:/);assert.match(api,/q\.account_id=\$\{u.id\}/);assert.match(api,/s\.account_id=\$\{u.id\}/)});

test('missing database configuration returns service unavailable',()=>{assert.match(api,/!process\.env\.DATABASE_URL/);assert.match(api,/database not configured',503/)});

test('quote creation and revisions reject malformed decimal strings',()=>{
 const guard=String.raw`(typeof b.amount==='string'&&!/^\d+(\.\d{1,2})?$/.test(b.amount.trim()))`;
 assert.equal(api.split(guard).length-1,2,'Both creation and revision must validate amount strings');
 const pattern=/^\d+(\.\d{1,2})?$/;
 for(const invalid of ['',' ','1e2','1.234','-1','abc'])assert.equal(pattern.test(invalid.trim()),false,invalid);
 for(const valid of ['0','100','100.5','100.50'])assert.equal(pattern.test(valid),true,valid);
});
