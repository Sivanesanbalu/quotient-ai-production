import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('scripts/check-database.mjs','utf8');
test('database check verifies all required tables without altering records',()=>{
 for(const table of ['accounts','sessions','rfqs','suppliers','quotes','auth_rate_limits'])assert.ok(source.includes(table));
 assert.match(source,/information_schema\.columns/);
 assert.doesNotMatch(source,/sql`\s*(?:INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)/i);
});
test('database check does not echo the connection string',()=>{
 assert.doesNotMatch(source,/console\.(?:log|error)\(process\.env\.DATABASE_URL/);
});
