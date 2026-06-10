# BeyondPath QA Integration Report . 2026-05-28

- author: Calcifer (CTO subagent . Opus 4.7)
- trigger: Edward 5/28 17:58 paiban
- scope: 8 axes (5/28 ship 4+3 items + online contract phase 2)
- method: Claude Preview MCP local 5858 real run + DOM eval + edge cases
- time: estimate 2d / castle 2h / actual ~90min / 1 review round

---

## 1 . Flow Service Test (3 journeys)

### 1.1 Client Journey . PASS (1 local-only limit)

PASS items:
- landing.html CTA -> app.html role=client OK
- Step 01 required 8 fields gated (vertical/brief/clientType/betaAck/budget/timeline/companyName/jobTitle)
- terms checkbox + privacy link new tab
- Step 02 Confirm Expectations render
- Step 03 AI Parse auto + Find matches unlock after 8s
- Step 04 Match Submit button

LOCAL LIMIT:
- Submit Supabase RPC . no prod backend hooked

### 1.2 Worker Journey . PASS

PASS items:
- landing CTA -> app.html role=worker
- AI interview 2 paths (own AI / built-in)
- Step 1 AI interview textarea + Enter -> next q
- Step 4 country select TW/SG/MY/HK/OTHER (code review)
- non-TW shows Y1-only-TW note
- termsAck checkbox + terms/privacy links

LOCAL LIMIT:
- invitation accept -> contract.html (no RPC)

### 1.3 Admin Journey . PASS (after P0 fix)

PASS items:
- admin.html mount (Babel ~15s)
- 5 tabs (Pending Workers / Client Intakes / Decisions History / Contracts / Settings)
- Pending Workers empty state + CTA
- Client Intakes empty state + CTA
- Contracts tab friendly error when no schema
- Approve/Reject/Archive/issue contract/resend cert code review

### 1.4 Public Verify . PASS

- contract-verify.html render
- invalid uuid format check
- privacy explanation (client-side SHA-256 + no email leak)

### 1.5 Public Page Loads . PASS

All 10 endpoints (landing/terms/privacy/waitlist/sign-in/index/mobile/contract/contract-verify/admin) return 200.

---

## 2 . Monkey Test Bugs (P0/P1/P2/P3)

### P0 . FIXED

P0-1 . admin.jsx line 845 ResendCertificateButton multi-line string SyntaxError -> admin all blank

- location: components/admin.jsx line 845
- issue: window.confirm contained literal LF chars inside JS double-quoted string = SyntaxError
- impact: Babel transform admin.jsx fails . AdminApp undefined . ReactDOM renders nothing . admin backstage 100 percent broken
- weirdness: Babel standalone silently swallows transform error
- fix: escape to literal backslash-n backslash-n inside string
- verify: reload -> admin 5 tabs all mount . empty states render
- CRITICAL: if pushed without my fix . admin dead = launch blocker

### P1 . FIXED

P1-1 . contract.html error message dumps raw Supabase error to user

- location: contract.html lines 459-461 catch handler
- issue: catch leaked raw schema cache error message to signer
- impact: tech jargon + backend schema leaked
- fix: classify (not found / schema cache / network / token expired) -> friendly text
- verify: invalid token + RPC missing -> friendly message with mailto fallback

### P2 . next sprint

P2-1 . app.html role=invalid not rejected, defaults to client UI

- issue: ?role=hacker falls back to client UI . semantic confusion + social engineering surface
- suggested: invalid role -> redirect landing / show unknown role page

### P3 . observation only

P3-1 . all buttons default type=submit (50/52) . suggest add type=button to all non-submit

P3-2 . Babel standalone in-browser slow + swallows transform errors . suggest v1.6.0+ esbuild precompile

P3-3 . prod uses React development build (already in 01-tech-audit)

---

## 3 . Local-Only Limits (must prod-deploy to verify)

- Supabase RPC contract_verify_lookup
- bpClientIntake.submit
- bpWorkerApply.submit
- Resend email send-decision-email Edge Func
- submit-signature Edge Func
- resend-contract-certificate Edge Func
- contract-jwt.ts JWT (14d token)
- Storage bucket contracts 7d signed URL

5/28 new SQL migrations also need Edward to run in Supabase Studio.

---

## 4 . Bug Fix Suggestions

already fixed (this QA edit):
1. components/admin.jsx line 845 multi-line string SyntaxError . P0
2. contract.html line 459 friendly error classifier . P1

next sprint:
1. P2-1 invalid ?role= reject + redirect
2. P3-1 button type=submit -> button full sweep
3. P3-2 Babel standalone -> esbuild precompile

---

## 5 . Self-Verdict

### GO-with-fixes

why GO:
- 8 axes all run . flows smooth + UX edges complete
- P0/P1 fixed . admin from all-blank -> 5-tabs-ok = qualitative leap
- mobile 375 / desktop 1440 no break . console 0 error
- required field logic tight
- international country select + Y1 note correct
- contract.html / contract-verify.html / admin Contracts tab complete

why with fixes:
- P0 admin.jsx bug must be in pushed code or launch dies day-1
- local-only 8 items need prod deploy + Supabase Studio SQL run

Edward action list:
1. (done) admin.jsx + contract.html fixes in local working tree
2. run 5/28 new SQL migrations in Supabase Studio
3. Vercel deploy 8-axes latest
4. Prod re-run contract-verify.html with real ID+PDF
5. Prod run Client journey real submit
6. Prod run Worker journey country=SG submit

---

## QA Self-Note

- 90 min vs estimate 90-120 min . on target
- 1 review round
- 8 axes covered + found 1 launch-blocker P0 = QA paid off
- Babel standalone silent transform = v1.6.0+ infra debt

-- Calcifer (huo lu bian bao yuan wan, shao wan le, re teng teng)
