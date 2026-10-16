import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const frontend=readFileSync('app/page.tsx','utf8');
const css=readFileSync('app/style.css','utf8');

test('public homepage exposes usable workspace navigation and account entry',()=>{
  for(const fragment of ['id="workspace"','href="#workspace"','href="#features"','href="#pricing"','submitAuth','Create account','Sign in']){
    assert.ok(frontend.includes(fragment),'Missing public UI entry: '+fragment);
  }
});

test('authenticated dashboard has RFQ, supplier and quotation workflows',()=>{
  for(const fragment of ["['rfqs','suppliers','quotes']","'POST'","'PATCH'","'DELETE'","compareRFQ","reviseQuote","exportCSV","updateRFQStatus"]){
    assert.ok(frontend.includes(fragment),'Missing dashboard action: '+fragment);
  }
});

test('client requests include session credentials and avoid cached API responses',()=>{
  assert.match(frontend,/credentials:'include'/);
  assert.match(frontend,/cache:'no-store'/);
  assert.match(frontend,/setError\(e\.message\)/);
});

test('critical forms have native validation and visible error feedback',()=>{
  for(const fragment of ['required minLength','type="email"','type="number"','min="1"','role="alert"','disabled={loading}']){
    assert.ok(frontend.includes(fragment),'Missing form protection: '+fragment);
  }
});

test('responsive stylesheet has mobile breakpoints',()=>{
  assert.match(css,/@media/);
});
