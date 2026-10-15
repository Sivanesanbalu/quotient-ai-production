# QuotientAI — Procurement SaaS

Next.js/React, Neon PostgreSQL and secure session-based procurement workflows.

**Status:** Repository initialization in progress. This is NOT yet a deployed production SaaS. Do not treat the currently deployed Vercel site as the database-backed application.

## Development

The complete audited source package is still being migrated into this repository. Before any deployment: ensure all source files are present; configure `DATABASE_URL` exclusively as a server-side encrypted Vercel secret; apply the PostgreSQL schema; install dependencies; run `npm run preflight`, `npm run test:source`, and `npm run build`; test registration, sessions, RFQs, suppliers, quotes, tenancy and export live.

Never commit any production credentials. Automated supplier outreach, billing and full E2E testing remain incomplete.

## Vercel project

The full-stack Vercel project `quotient-ai-fullstack` is Git-connected to this repository and uses the Next.js framework. Project ID: `prj_ry8IGRwCzDuS2NaHWXU0NXJmAJvy`.

As of October 15, 2026, its initial preview deployment is **blocked by Vercel's daily deployment limit (HTTP 402)**. No full-stack deployment URL exists yet. The older `quotient-ai-procurement` site remains a static preview.

Before shipping, configure `DATABASE_URL` as a private server-only environment variable for the new project, confirm schema compatibility, verify GitHub Actions and the Next.js production build, and run end-to-end browser tests. Never commit database credentials.
