# BeyondPath Prototype v0.2

BeyondPath is a static proof-of-concept for an AI-native work network. It includes a public landing page, a client intake flow, a worker dashboard, mobile prototype screens, and a Tier B certification application flow.

This prototype is intentionally lightweight: React 18 UMD + Babel standalone, no package install, no build step.

## Live Demo

- Production landing page: https://prototype-v02.vercel.app/landing.html
- Client flow: https://prototype-v02.vercel.app/app.html?role=client&step=0
- Worker certification flow: https://prototype-v02.vercel.app/app.html?role=worker&onboarding=1
- Worker submitted state: https://prototype-v02.vercel.app/app.html?role=worker&onboarding=1&submitted=1
- Mobile prototype: https://prototype-v02.vercel.app/mobile.html

## Local Preview

```bash
python -m http.server 5858
```

Then open:

```text
http://localhost:5858/landing.html
```

## Main Entry Points

| File | Purpose |
| --- | --- |
| `landing.html` | Public-facing landing page and primary share link. |
| `app.html` | Product app shell for client and worker flows. |
| `mobile.html` | Mobile prototype entry. |
| `index.html` | Design-canvas view showing desktop and mobile artboards. |
| `components/worker.jsx` | Worker dashboard and Tier B certification application flow. |
| `components/app2.jsx` | Client intake flow and matching journey. |
| `components/styles.css` | Shared visual system and component styles. |
| `vercel.json` | Vercel static deployment headers. |

## Current State

- Deployed to Vercel production under `prototype-v02.vercel.app`.
- The homepage worker certification CTA routes to `app.html?role=worker&onboarding=1`.
- Applying for Tier B now stays in-page and shows the submitted confirmation state.
- The confirmation page provides an optional email draft link instead of auto-opening mail before the success state.
- Data is mock/demo only. Do not collect real personal data from this prototype.

## Collaboration

This repo is meant to be co-developed by:

- Sophie: Claude-side product/design implementation partner.
- Holl: Codex-side engineering/deployment partner.

Before editing, read:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/project-status.md`
- `docs/collaboration-protocol.md`

## Deployment

The folder is linked to Vercel as `prototype-v0.2`.

Current deployment command:

```bash
npx vercel@latest --prod --yes
```

The `.vercel` folder is intentionally ignored and should not be committed.
