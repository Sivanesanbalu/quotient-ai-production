// Read-only smoke test. Never creates accounts or changes production records.
const base = process.env.SMOKE_URL;
if (!base) { console.error('SMOKE_URL is required'); process.exit(1); }
let url;
try { url = new URL('/api/health', new URL(base)); }
catch { console.error('SMOKE_URL must be a valid absolute URL'); process.exit(1); }
try {
  const response = await fetch(url, {cache:'no-store', signal:AbortSignal.timeout(10000), redirect:'manual'});
  const type = response.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    throw new Error('Expected JSON health response; received HTTP '+response.status+' ('+type+'). Check deployment protection and API routing.');
  }
  const body = await response.json();
  if (!response.ok || body.ok !== true) {
    throw new Error('Health check failed: HTTP '+response.status+'. Database may be missing, offline, or schema incomplete.');
  }
  console.log('Health endpoint passed; authentication and data mutation E2E tests remain unverified.');
} catch (error) {
  console.error('Smoke test failed: '+error.message);
  process.exitCode = 1;
}
