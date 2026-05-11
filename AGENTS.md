# Agent Instructions

This repository is a static BeyondPath POC. Keep changes small, visible, and easy to review.

## Operating Rules

- Do not add a build system unless the task explicitly requires it.
- Preserve existing entry URLs: `landing.html`, `app.html`, `mobile.html`, and `index.html`.
- Treat `landing.html` as the external share page.
- Treat `app.html?role=worker&onboarding=1` as the worker certification application flow.
- Keep prototype disclaimers visible when adding forms, payment, contract, KYC, or certification copy.
- Do not collect, store, or submit real personal data from the prototype.
- After changing JSX/CSS/HTML, test locally with `python -m http.server 5858`.
- After changing deployable files, deploy with `npx vercel@latest --prod --yes` only when the user asks or when finishing a production fix.

## Code Style

- This is React 18 UMD + Babel standalone.
- Components attach to `window.*`; follow that pattern for now.
- Prefer editing existing files over adding new frameworks.
- Keep public copy in Traditional Chinese where the surrounding UI is Traditional Chinese.
- Add cache-busting query params to script tags when changing shared JSX that might be cached in production.

## Handoff Notes

- Use `docs/project-status.md` for current state.
- Use `docs/collaboration-protocol.md` for Sophie / Holl workflow.
- Leave a short note in the final response with changed files and verification steps.
