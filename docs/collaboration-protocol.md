# Collaboration Protocol

This project will be co-developed by Sophie (Claude) and Holl (Codex).

## Roles

- Sophie: product narrative, landing copy, UX flow, visual refinement, user-facing demo polish.
- Holl: repo hygiene, deployment, browser verification, production fixes, engineering structure.

The roles are flexible, but every change should leave the next collaborator with enough context to continue.

## Before Starting Work

1. Read `README.md`.
2. Read `docs/project-status.md`.
3. Check whether the requested change touches deployable files.
4. Preview locally before and after meaningful UI changes.

## Change Discipline

- Keep changes scoped to the request.
- Do not rename entry files casually.
- Do not remove prototype disclaimers from public/demo flows.
- Do not add login, payments, file upload, or data collection without explicit approval.
- Do not commit `.vercel`, local caches, or machine-specific credentials.

## Verification Checklist

For landing changes:

- Open `landing.html`.
- Confirm the client CTA still reaches `app.html?role=client&step=0`.
- Confirm the worker CTA still reaches `app.html?role=worker&onboarding=1`.

For worker application changes:

- Open `app.html?role=worker&onboarding=1`.
- Click `Apply for Tier B Certification`.
- Confirm the URL becomes `app.html?role=worker&onboarding=1&submitted=1`.
- Confirm the submitted page shows `APPLICATION RECEIVED`.

For deployment:

- Run `npx vercel@latest --prod --yes`.
- Verify the production URL in a browser.
