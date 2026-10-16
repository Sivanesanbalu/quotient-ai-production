# QuotientAI Production Incident & Rollback Runbook

## Scope and boundaries
Production: https://quotient-ai-fullstack.vercel.app
GitHub repository: https://github.com/Sivanesanbalu/quotient-ai-production
CI: .github/workflows/ci.yml
Read-only production smoke: .github/workflows/production-smoke.yml
Database: Neon project `quotient-ai-production`, production main branch.

Never paste database credentials, session tokens or customer data into issues, logs, or support tickets. Never run synthetic write tests against production.

## Detect and triage
1. Check `/api/health` (expect HTTP 200, `ok:true`, `database:ready`). If unavailable, inspect the Vercel deployment status and Neon project health.
2. Check anonymous `/api/auth/me` and `/api/rfqs` (expect HTTP 401). Unexpected HTTP 200 without a session is a security incident; restrict access and investigate before restoring traffic.
3. Check latest GitHub Actions CI and the scheduled production smoke workflow. A passing CI run does not prove the latest commit is deployed.
4. Inspect recent changes, deployment logs, request error rates and database connectivity. Avoid logging full request bodies or authentication cookies.
5. Identify incident owner, start time, affected endpoint(s), customer impact, and mitigation. Preserve timestamps and sanitized evidence.

## Roll back application safely
1. Find the **last known good** production deployment in Vercel; verify its commit SHA, environment, and health checks.
2. If the latest deployment causes a regression, use Vercel's supported rollback/promote controls to restore the last known good deployment. Confirm the intended project, target environment and production alias before approving.
3. Re-run read-only production smoke checks and verify key endpoints. Watch logs and error rates after rollback.
4. Do **not** assume rolling back the application also reverses database migrations. Verify schema compatibility first.
5. Record incident timeline, rollback deployment ID, validation evidence, and follow-up actions in the release tracker.

## Database incidents
1. Check Neon branch, compute, connectivity, and schema health without changing records.
2. If a migration or data corruption is suspected, stop writes and take an incident-specific backup/snapshot before recovery actions.
3. Never restore or reset the production branch as an automatic response. Require explicit owner approval, assess data loss and point-in-time recovery options, and verify on an isolated branch first.
4. After recovery, validate the six required tables, authentication and tenant isolation using non-destructive checks.

## Release gate
- Source/security tests, TypeScript validation and production build pass.
- Disposable PostgreSQL authenticated E2E passes.
- Vercel deployment for the intended commit is READY and production alias matches.
- Read-only production smoke passes after deployment.
- Owner confirms production release and rollback path. Do not claim complete readiness before all gates are met.

## Escalation and follow-up
Treat cross-tenant data exposure, unexpected anonymous access, leaked credentials or destructive database activity as urgent. Restrict affected access, rotate compromised secrets through the provider, and preserve sanitized audit evidence. Update GitHub issue #1 with factual observations and remediation status.
