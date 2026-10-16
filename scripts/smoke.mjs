// Read-only smoke test. Never creates accounts or changes production records.
const base = process.env.SMOKE_URL;
if (!base) { console.error('SMOKE_URL is required'); process.exit(1); }
let url;
try { const origin = new URL(base); if (origin.protocol !== 'https:' && !(process.env.SMOKE_ALLOW_HTTP_LOOPBACK === '1' && origin.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(origin.hostname))) throw new Error('HTTPS required (except explicit local test loopback)'); url = new URL('/api/health', origin); }
catch { console.error('SMOKE_URL must be a valid HTTPS URL'); process.exit(1); }
try {
  const response = await fetch(url, {cache:'no-store', signal:AbortSignal.timeout(10000), redirect:'manual'});
  const type = response.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    throw new Error('Expected JSON health response; received HTTP '+response.status+' ('+type+'). Check deployment protection and API routing.');
  }
  const body = await response.json();
  if (response.headers.get('cache-control')?.includes('no-store') !== true) throw new Error('Health response must not be cached');
  if (!response.ok || body.ok !== true) {
    throw new Error('Health check failed: HTTP '+response.status+'. Database may be missing, offline, or schema incomplete.');
  }
  const protectedPaths=['/api/auth/me','/api/rfqs','/api/suppliers','/api/quotes','/api/export'];
  for(const path of protectedPaths){
    const endpoint=new URL(path,url);
    const result=await fetch(endpoint,{cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(10000)});
    if(result.status!==401)throw new Error('Anonymous endpoint did not return HTTP 401: '+path+' (received '+result.status+')');
    if (!result.headers.get('content-type')?.includes('application/json')) throw new Error('Protected endpoint returned non-JSON: '+path);
    if (!result.headers.get('cache-control')?.includes('no-store')) throw new Error('Protected endpoint missing no-store: '+path);
  }
  const homepage=await fetch(new URL('/',url),{cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(10000)});
  if(homepage.status!==200)throw new Error('Homepage failed: HTTP '+homepage.status);
  const html=await homepage.text();
  if(!html.includes('Quotient')||!html.includes('workspace'))throw new Error('Homepage missing expected application content');
  console.log('PASS: production health, anonymous access guards, and homepage HTML. Authenticated E2E is verified separately in disposable CI PostgreSQL.');
} catch (error) {
  console.error('Smoke test failed: '+error.message);
  process.exitCode = 1;
}
