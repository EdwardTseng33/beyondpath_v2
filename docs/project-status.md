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
- `waitlist.html`: manual waitlist contact page for prototype-stage visitors.

## Recent Fixes

- Fixed the homepage worker certification application path.
- Changed Tier B apply behavior so the user reaches an in-page submitted state first.
- Moved the email draft to an optional link on the submitted page.
- Added cache-busting on `components/worker.jsx` references in `app.html` and `index.html`.
- Repositioned the landing page for Taiwan beta acquisition: clearer client promise, concrete beta use cases, founder-led trust layer, and more credible worker certification CTA.
- Strengthened the landing page narrative around the AI work trust layer: sharper client/worker pains, less platform jargon above the fold, clearer founder commitment, and split CTAs for client shortlist vs. worker candidate pool.
- Clarified the worker application submitted state: the prototype does not auto-submit data, so applicants are instructed to email `edwardt0303@gmail.com`, with a mailto draft and visible manual recipient fallback.
- Added a direct Worker Console demo path so the worker-side prototype is visible without being trapped behind the certification application flow: `app.html?role=worker&view=worker-demo`.
- Updated the shell logout action so demo users clear role/onboarding state and return to `landing.html`.
- Added `waitlist.html` as a manual waitlist contact page with visible recipient email, copy-email fallback, and email draft link; prototype banners now link there instead of directly opening mailto.
- Reworked the landing hero and related copy from "trial/test project" language toward "可驗收的 AI 交付專案 / 首案交付", and added `docs/product-flow-competitor-review-2026-05-11.md` with competitor-informed product recommendations.
- Updated the landing promise from "3 天候選人" to a more accurate AI-assisted service promise: "24 小時初步判斷" first, then shortlist matching.
- Shifted visible landing language from "人工把關" to "AI 把關 / AI 初審 + 人工覆核" so the product feels more AI-native while staying credible for beta.
- Reframed the landing page around joining the next AI work network and reducing anxiety, unease, and uncertainty for both clients and AI-native workers.
- Removed visible escrow / platform payout positioning from the public prototype; early service now emphasizes scope review, candidate matching, acceptance records, and off-platform commercial terms.
- Added an irreplaceability section to the landing page: LLMs can recommend names, but BeyondPath compounds delivery evidence, workflow proof, NPS, and acceptance records into a trust data layer.
- Removed the founder letter section from the landing page; future credibility should come from client and worker feedback instead of founder narrative.
- Replaced the worker Tier B certification page (`app.html?role=worker&onboarding=1`) from a static 4-step description into a 5-step interactive apply flow: basic info → 3 portfolio cases → AI brief generator (prefilled prompt + open Claude/ChatGPT/Gemini buttons) → paste back AI's JSON result → preview an ability card with L score, 6-axis skill matrix, layer-2 objective assessment (scenario test + continuous NPS + future pilot case), and layer-3 education routing keyed to the L score. Submit still routes to the existing mailto-based submitted state. All state is client-side; no real submission, no backend.

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
