# QuotientAI — Procurement SaaS

Next.js/React, Neon PostgreSQL and secure session-based procurement workflows.

**Status:** Repository initialization in progress. This is NOT yet a deployed production SaaS. Do not treat the currently deployed Vercel site as the database-backed application.

## Development

The complete audited source package is still being migrated into this repository. Before any deployment: ensure all source files are present; configure `DATABASE_URL` exclusively as a server-side encrypted Vercel secret; apply the PostgreSQL schema; install dependencies; run `npm run preflight`, `npm run test:source`, and `npm run build`; test registration, sessions, RFQs, suppliers, quotes, tenancy and export live.

Never commit any production credentials. Automated supplier outreach, billing and full E2E testing remain incomplete.

## Vercel full-stack deployment

The Git-linked Vercel project is `quotient-ai-fullstack` (project ID `prj_ry8IGRwCzDuS2NaHWXU0NXJmAJvy`).

**Status checked October 15, 2026:** Vercel reports a READY **older** Next.js production deployment from GitHub commit `acb8fb984f71163c7c291cc8e96ccf73801f096c`, available at https://quotient-ai-fullstack.vercel.app. This does **not** certify application functionality.

**Production blocker:** Vercel still has zero configured environment variables, including no server-side `DATABASE_URL`. Do not paste credentials into GitHub or commit them. Use Vercel Project → Settings → Environment Variables with an encrypted value for the correct deployment environments, then redeploy and verify the health endpoint.

Run `SMOKE_URL=https://quotient-ai-fullstack.vercel.app npm run test:smoke` only after deployment; it checks the real health endpoint without creating records. A pass is not a substitute for full signup, tenant-isolation, RFQ, supplier and quotation E2E testing.

The dependency lockfile remains uncommitted, and current GitHub Actions success remains unverified. Do not claim production readiness until these release gates and E2E tests pass.
