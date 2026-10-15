import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('release gate fails without a configured database',()=>{
 const env={...process.env};delete env.DATABASE_URL;
 const result=spawnSync(process.execPath,['scripts/production-readiness.mjs'],{encoding:'utf8',env});
 assert.equal(result.status,1);
 assert.match(result.stderr,/DATABASE_URL missing/);
});

test('release gate does not claim build or E2E success',()=>{
 const env={...process.env,DATABASE_URL:'postgresql://example.invalid/placeholder'};
 const result=spawnSync(process.execPath,['scripts/production-readiness.mjs'],{encoding:'utf8',env});
 if(result.status===0)assert.match(result.stdout,/Run build and live E2E tests separately/);
});

test('release gate rejects malformed database URLs without printing secrets',()=>{
 const env={...process.env,DATABASE_URL:'invalid-secret-placeholder'};
 const result=spawnSync(process.execPath,['scripts/production-readiness.mjs'],{encoding:'utf8',env});
 assert.equal(result.status,1);
 assert.match(result.stderr,/DATABASE_URL is malformed/);
 assert.doesNotMatch(result.stderr,/invalid-secret-placeholder/);
});

test('release gate rejects disabled PostgreSQL SSL',()=>{
 const env={...process.env,DATABASE_URL:'postgresql://user:password@db.example.invalid/neondb?sslmode=disable'};
 const result=spawnSync(process.execPath,['scripts/production-readiness.mjs'],{encoding:'utf8',env});
 assert.equal(result.status,1);
 assert.match(result.stderr,/must not disable SSL/);
});
