# Sophie Handoff

Sophie is the Claude-side collaborator for product, narrative, and UI iteration.

Read these first:

- `README.md`
- `docs/project-status.md`
- `docs/collaboration-protocol.md`
- `AGENTS.md`

## What Matters Most

- Keep the POC shareable and demo-safe.
- Do not break the current Vercel entry links.
- Keep the homepage worker CTA flowing to the certification application page.
- Keep the submitted state reachable at `app.html?role=worker&onboarding=1&submitted=1`.
- Avoid adding real backend collection until the user explicitly asks for it.

## Local Preview

```bash
python -m http.server 5858
```

Open:

```text
http://localhost:5858/landing.html
```
