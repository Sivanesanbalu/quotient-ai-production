import { existsSync } from 'node:fs';

const failures = [];
if (!process.env.DATABASE_URL) {
  failures.push('DATABASE_URL missing: configure a server-only Vercel environment variable');
}
if (!existsSync('package-lock.json')) {
  failures.push('package-lock.json missing: generate and commit a dependency lockfile');
}
for (const path of ['app/page.tsx', 'app/api/[[...route]]/route.ts', 'lib/db.ts', 'schema.sql']) {
  if (!existsSync(path)) failures.push('Missing production source: ' + path);
}


if (!process.env.VERCEL && process.env.NODE_ENV === 'production') {
  console.warn('[INFO] Production mode detected outside Vercel.');
}
if (process.env.DATABASE_URL) {
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) failures.push('DATABASE_URL must use PostgreSQL');
    if (!parsed.hostname) failures.push('DATABASE_URL hostname missing');
    if (parsed.searchParams.get('sslmode') === 'disable') failures.push('DATABASE_URL must not disable SSL');
  } catch {
    failures.push('DATABASE_URL is malformed');
  }
}

if (failures.length) {
  for (const failure of failures) console.error('[BLOCKED] ' + failure);
  process.exitCode = 1;
} else {
  console.log('Static release prerequisites present. Run build and live E2E tests separately.');
}
