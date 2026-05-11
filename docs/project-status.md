# Project Status

Last updated: 2026-05-11

## Deployment

- Production: https://prototype-v02.vercel.app/landing.html
- Vercel project name: `prototype-v0.2`
- Local folder: `C:\Users\Administrator\Claude\BeyondPath2.0\prototype-v0.2`

## Product Surface

- `landing.html`: public landing page.
- `app.html?role=client&step=0`: client intake flow.
- `app.html?role=worker&onboarding=1`: worker certification application flow.
- `app.html?role=worker&onboarding=1&submitted=1`: worker application submitted state.
- `mobile.html`: mobile prototype.
- `index.html`: design canvas / artboard view.

## Recent Fixes

- Fixed the homepage worker certification application path.
- Changed Tier B apply behavior so the user reaches an in-page submitted state first.
- Moved the email draft to an optional link on the submitted page.
- Added cache-busting on `components/worker.jsx` references in `app.html` and `index.html`.

## Known Constraints

- No backend.
- No real form submission.
- No user accounts.
- No real payment, contract, KYC, certification review, or data storage.
- React/Babel are loaded from public CDNs, so the prototype needs internet access.

## Next Useful Work

- Replace remaining mojibake text in older backup/spec files if they become active references.
- Decide whether the repo should keep generated single-file demo artifacts or move them into a release-only workflow.
- Add a real waitlist/form backend only after privacy and trust copy are finalized.
- Convert the static prototype into a maintainable app only after the product flow settles.
