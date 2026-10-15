import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const api=readFileSync('app/api/[[...route]]/route.ts','utf8');test('auth routes declared',()=>{assert.match(api,/id==='register'/);assert.match(api,/id==='login'/);assert.match(api,/id==='logout'/)});test('CRUD routes declared',()=>{for(const s of ["area==='rfqs'","area==='suppliers'","area==='quotes'"])assert.ok(api.includes(s))});test('tenant-scoped read',()=>assert.ok(api.includes('WHERE account_id=')));
test('quote revisions require tenant ownership',()=>{assert.match(api,/method==='PATCH'&&uuid\(id\)/);assert.match(api,/UPDATE quotes SET amount=/);assert.match(api,/WHERE id=\$\{id\} AND account_id=\$\{u.id\}/)});

test('exports are user-scoped and cache-disabled',()=>{assert.match(api,/area==='export'/);assert.match(api,/WHERE account_id=\$\{u.id\}/);assert.match(api,/text\/csv/);assert.match(api,/private, no-store/)});

test('RFQ lifecycle API limits allowed statuses and ownership',()=>{assert.match(api,/open','reviewing','awarded','closed/);assert.match(api,/UPDATE rfqs SET status=/);assert.match(api,/WHERE id=\$\{id\} AND account_id=\$\{u.id\}/)});

test('quote comparison scopes RFQ and supplier to account',()=>{assert.match(api,/action==='compare'/);assert.match(api,/potentialSavings:/);assert.match(api,/q\.account_id=\$\{u.id\}/);assert.match(api,/s\.account_id=\$\{u.id\}/)});
