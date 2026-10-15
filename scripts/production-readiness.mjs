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

if (failures.length) {
  for (const failure of failures) console.error('[BLOCKED] ' + failure);
  process.exitCode = 1;
} else {
  console.log('Static release prerequisites present. Run build and live E2E tests separately.');
}
