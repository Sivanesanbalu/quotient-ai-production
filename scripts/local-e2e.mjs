// Destructive integration test: run ONLY against a disposable local database.
// Never point this script at production, staging, or a shared environment.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const base=process.env.E2E_BASE_URL;
if(!base)throw Error('E2E_BASE_URL is required');
const origin=new URL(base);
if(!['localhost','127.0.0.1','[::1]'].includes(origin.hostname)||origin.protocol!=='http:'||process.env.E2E_DISPOSABLE_DB!=='YES'){
  throw Error('Refusing writes: requires HTTP loopback and E2E_DISPOSABLE_DB=YES');
}
const prefix=randomUUID().slice(0,8);
const password='Temporary!E2E-'+randomUUID();
async function request(path,{method='GET',data,cookie}={}){
 const response=await fetch(new URL(path,origin),{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:data?JSON.stringify(data):undefined,redirect:'manual'});
 const type=response.headers.get('content-type')||'';
 const body=type.includes('json')?await response.json():await response.text();
 return {status:response.status,body,cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
const signup=async(name)=>{const r=await request('/api/auth/register',{method:'POST',data:{email:`qa-e2e-${prefix}-${name}@example.invalid`,name,password}});assert.equal(r.status,201,JSON.stringify(r.body));assert.ok(r.cookie);return r.cookie};
const a=await signup('alpha'),b=await signup('beta');
const login=await request('/api/auth/login',{method:'POST',data:{email:`qa-e2e-${prefix}-alpha@example.invalid`,password}});
assert.equal(login.status,200);assert.ok(login.cookie);
const rfq=await request('/api/rfqs',{method:'POST',cookie:a,data:{product:'E2E pH meter',quantity:2,unit:'pcs',spec:'Disposable test fixture'}});
assert.equal(rfq.status,201,JSON.stringify(rfq.body));
const supplier=await request('/api/suppliers',{method:'POST',cookie:a,data:{name:'E2E Supplier',email:'supplier@example.invalid'}});
assert.equal(supplier.status,201,JSON.stringify(supplier.body));
const rfqId=rfq.body.rfq.id,supplierId=supplier.body.supplier.id;
const quote=await request('/api/quotes',{method:'POST',cookie:a,data:{rfq_id:rfqId,supplier_id:supplierId,amount:123.45,notes:'Synthetic test'}});
assert.equal(quote.status,201,JSON.stringify(quote.body));
const comparison=await request(`/api/rfqs/${rfqId}/compare`,{cookie:a});
assert.equal(comparison.status,200);assert.equal(comparison.body.summary.count,1);
const exportResult=await request('/api/export',{cookie:a});
assert.equal(exportResult.status,200);assert.match(exportResult.body,/E2E pH meter/);
for(const path of ['/api/rfqs','/api/suppliers','/api/quotes']){
 const result=await request(path,{cookie:b});
 assert.equal(result.status,200);assert.equal(Object.values(result.body)[0].length,0,'Tenant B sees another tenant records');
}
const cross=await request('/api/quotes',{method:'POST',cookie:b,data:{rfq_id:rfqId,supplier_id:supplierId,amount:5}});
assert.equal(cross.status,404,'Cross-tenant quote creation must fail');
const unauthorized=await request('/api/rfqs');assert.equal(unauthorized.status,401);
console.log('PASS: local disposable DB signup/login, RFQ, supplier, quote, comparison, CSV, tenant isolation, anonymous guard.');
console.log('Synthetic fixtures intentionally remain in disposable local database; discard database after testing.');
