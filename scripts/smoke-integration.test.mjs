import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';

async function exercise({healthy=true,anonymousStatus=401}={}){
  const routes=[];
  const server=createServer((req,res)=>{
    routes.push(req.url);
    res.setHeader('content-type','application/json');
    res.setHeader('cache-control','private, no-store');
    if(req.url==='/'){
      res.setHeader('content-type','text/html; charset=utf-8');
      res.statusCode=200;
      res.end('<html><body>QuotientAI workspace</body></html>');
    }else if(req.url==='/api/health'){
      res.statusCode=healthy?200:503;
      res.end(JSON.stringify({ok:healthy}));
    }else{
      res.statusCode=anonymousStatus;
      res.end(JSON.stringify({error:'Unauthorized'}));
    }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  try{
    const child=spawn(process.execPath,['scripts/smoke.mjs'],{env:{...process.env,SMOKE_URL:url,SMOKE_ALLOW_HTTP_LOOPBACK:'1'},stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    for(const stream of [child.stdout,child.stderr]){
      stream.setEncoding('utf8');
      stream.on('data',chunk=>{if(stream===child.stdout)stdout+=chunk;else stderr+=chunk});
    }
    const status=await new Promise(resolve=>child.on('exit',resolve));
    return {status,stdout,stderr,routes};
  }finally{
    await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  }
}

test('healthy endpoint with protected routes passes without writes',async()=>{
  const r=await exercise();
  assert.equal(r.status,0,r.stderr);
  for(const path of ['/api/health','/api/auth/me','/api/rfqs','/api/suppliers','/api/quotes','/api/export','/'])assert.ok(r.routes.includes(path),path);
  assert.match(r.stdout,/guards passed/);
});

test('missing database health returns nonzero',async()=>{
  const r=await exercise({healthy:false});
  assert.notEqual(r.status,0);
  assert.match(r.stderr,/Health check failed/);
});

test('unprotected supplier endpoint fails the release probe',async()=>{
  const r=await exercise({anonymousStatus:200});
  assert.notEqual(r.status,0);
  assert.match(r.stderr,/did not return HTTP 401/);
});
