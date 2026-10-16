// Read-only smoke test. Never creates accounts or changes production records.
const base = process.env.SMOKE_URL;
if (!base) { console.error('SMOKE_URL is required'); process.exit(1); }
let url;
try { const origin = new URL(base); if (origin.protocol !== 'https:') throw new Error('HTTPS required'); url = new URL('/api/health', origin); }
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
  // Read-only negative checks: origin rejection happens before any write operation.
  for (const path of ['/api/auth/register','/api/auth/login','/api/rfqs','/api/suppliers','/api/quotes']) {
    const result = await fetch(new URL(path, url), {
      method: 'POST',
      headers: {'Origin':'https://untrusted.invalid','Content-Type':'application/json'},
      body: '{}',
      cache:'no-store',
      redirect:'manual',
      signal:AbortSignal.timeout(10000)
    });
    if (result.status !== 403) throw new Error('Cross-origin POST was not denied: '+path+' (received '+result.status+')');
    if (!result.headers.get('content-type')?.includes('application/json')) throw new Error('Cross-origin rejection returned non-JSON: '+path);
    if (!result.headers.get('cache-control')?.includes('no-store')) throw new Error('Cross-origin rejection missing no-store: '+path);
  }
  console.log('Health, anonymous access, and cross-origin POST rejection checks passed; authenticated write-path E2E remains unverified.');
} catch (error) {
  console.error('Smoke test failed: '+error.message);
  process.exitCode = 1;
}
