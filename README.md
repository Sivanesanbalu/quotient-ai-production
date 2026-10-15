# QuotientAI — Procurement SaaS

Next.js/React, Neon PostgreSQL and secure session-based procurement workflows.

**Status:** Repository initialization in progress. This is NOT yet a deployed production SaaS. Do not treat the currently deployed Vercel site as the database-backed application.

## Development

The complete audited source package is still being migrated into this repository. Before any deployment: ensure all source files are present; configure `DATABASE_URL` exclusively as a server-side encrypted Vercel secret; apply the PostgreSQL schema; install dependencies; run `npm run preflight`, `npm run test:source`, and `npm run build`; test registration, sessions, RFQs, suppliers, quotes, tenancy and export live.

Never commit any production credentials. Automated supplier outreach, billing and full E2E testing remain incomplete.
