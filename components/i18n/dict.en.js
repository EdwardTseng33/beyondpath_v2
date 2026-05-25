/*
 * BeyondPath i18n - English dictionary - v0.2 FULL TRANSLATION
 * 對應 dict.zh.js · 結構 1:1 對應
 *
 * 2026-05-25 Sophie ship full translation for overseas PMF validation
 * Edward 拍板「投入海外市場做 PMF 驗證」+ 平台內部全包
 * 規則:
 *   - 每 key value 為正式英文 · 不再 placeholder
 *   - 海外 PMF tone: AI-era startup / Linear-Stripe-Vercel 風格 · clean direct premium
 *   - AI 詞彙保留英文 (AI brief / workflow / milestone / Tier / NPS)
 *   - 台灣案例 brand 名與 NT$ 價格保留 (證據完整性)
 *   - hello@ / edwardt0303@gmail.com 不翻
 */
(function (g) {
  if (!g.BPi18n) g.BPi18n = { dicts: {} };
  if (!g.BPi18n.dicts) g.BPi18n.dicts = {};
  g.BPi18n.dicts.en = {
  "meta": {
    "title": "BeyondPath · The work delivery network for the AI era",
    "description": "BeyondPath turns fuzzy briefs into verifiable deliverables for SMBs and brands. AI-first review, verified supply, milestone delivery — built to lower uncertainty in the AI era of work.",
    "og_title": "BeyondPath · The work delivery network for the AI era",
    "og_description": "Turn fuzzy briefs into verifiable deliverables. AI-first review, verified supply, milestone delivery — built to lower uncertainty.",
    "og_image_alt": "BeyondPath · The work delivery network for the AI era"
  },
  "disc": {
    "top_label": "EARLY BETA · Invitation only",
    "top_body_before": "First-wave projects matched with BeyondPath-verified workers, first response within 24h · ",
    "top_link": "Join the waitlist →",
    "top_close_aria": "Dismiss notice",
    "foot_text": "BeyondPath · Early Beta v0.8 · 2026-05-15 · Invitation only · Platform quality review in progress · Lawyer-reviewed contract in progress · ",
    "foot_privacy": "Privacy & terms",
    "foot_waitlist": "Join the waitlist →"
  },
  "nav": {
    "brand_version": "v0.5β",
    "link_problem": "Problem",
    "link_how": "How",
    "link_trust": "Trust",
    "link_cases": "Cases",
    "link_tier": "Tier",
    "link_faq": "FAQ",
    "cta_signin": "SIGN IN",
    "cta_apply": "▲ APPLY · BETA"
  },
  "lang": {
    "switch_aria": "Switch language",
    "label_zh": "中",
    "label_en": "EN"
  },
  "staticbar": {
    "network_label": "NETWORK",
    "network_value": "v0.5β · TAIWAN BETA",
    "review_label": "FIRST REVIEW",
    "review_value": "24H",
    "project_label": "FIRST PROJECT",
    "project_value": "NT$50K+",
    "mode_label": "MODE",
    "mode_value": "AI-reviewed"
  },
  "poc": {
    "header_title": "◆ Q3 2026 PRIVATE BETA",
    "header_target": "PRIVATE BETA · ROADMAP",
    "row1_label": "Verified supply certification",
    "row1_sub": "Tier B / B+ · Sample invitation list in progress",
    "row1_stat": "Private beta",
    "row2_label": "Matched paid delivery",
    "row2_sub": "NPS ≥ 50 · First client list in progress",
    "row2_stat": "Private beta",
    "row3_label": "Two-sided NPS rating",
    "row3_sub": "Client + worker · Active once beta data is in",
    "row3_stat": "Q3 2026"
  },
  "hero": {
    "eyebrow": "// AI ERA WORK NETWORK · Taiwan beta · Two-sided verification",
    "headline_part1_before": "Join the next era of ",
    "headline_part1_ai": "AI",
    "headline_part1_after": " work.",
    "headline_sub": "Turn uncertainty into verifiable delivery.",
    "pill_1": "Break anxious requests into scope, deliverables and acceptance criteria",
    "pill_2": "AI matches you to the right domain, budget and candidate direction",
    "pill_3": "Verified supply and milestones lower delivery uncertainty",
    "blurb_before": "AI makes everyone look capable — and makes briefing and hiring more anxious: how to scope it, how to judge talent, how to verify results. BeyondPath uses ",
    "blurb_bold": "AI-first review, verified supply and milestone delivery",
    "blurb_after": " to turn fuzzy briefs into a trustable AI workflow.",
    "trust_label": "next work network · AI review · verified supply",
    "cta_primary_main": "I want to brief an AI project →",
    "cta_primary_sub": "Submit brief · First response in 24h",
    "cta_secondary_main": "I want to join the AI expert network →",
    "cta_secondary_sub": "Submit portfolio and AI workflow",
    "cta_demo": "Preview the Worker Console →",
    "stream_label": "◆ AGENT // STREAM",
    "stream_meta": "tok/s · 38",
    "legend_before": "▸ ",
    "legend_spec": "SPEC",
    "legend_spec_after": " = platform design standard · post-ship acceptance bar   ·   ",
    "legend_live": "LIVE",
    "legend_live_after": " = real-time data",
    "tel_focus_label": "BETA FOCUS",
    "tel_focus_value": "SMB",
    "tel_review_label": "REVIEW TIME",
    "tel_review_value": "24h",
    "tel_project_label": "FIRST PROJECT",
    "tel_project_value": "50K+"
  },
  "usecases": {
    "eyebrow": "◆ BETA USE CASES · Best-fit first projects",
    "headline_part1": "Don't buy more tools.",
    "headline_part2_before": "Ship your next ",
    "headline_part2_em": "AI project",
    "headline_part2_after": " first.",
    "intro": "BeyondPath beta only takes projects with clear scope, verifiable deliverables and obvious AI acceleration. You don't need to know the tools — you only need to know the result you want.",
    "label_budget": "BUDGET",
    "label_timeline": "TIMELINE",
    "cases": [
      {
        "who": "DTC / e-commerce brands",
        "job": "AI content pipeline and product page assets",
        "deliver": "Short-form video scripts, social assets, EDM, product page copy",
        "budget": "NT$50K-100K",
        "time": "2-6 weeks"
      },
      {
        "who": "Design studios / brand teams",
        "job": "Brand DNA × AI visual system",
        "deliver": "Visual templates, prompt spec, asset specs, delivery checklist",
        "budget": "NT$60K-120K",
        "time": "3-8 weeks"
      },
      {
        "who": "SMBs / lean ops teams",
        "job": "Website refresh and internal workflow automation",
        "deliver": "Landing page, support FAQ, automated forms and SOPs",
        "budget": "NT$50K-150K",
        "time": "3-8 weeks"
      },
      {
        "who": "B2B SaaS / consulting services",
        "job": "GTM content and sales assets",
        "deliver": "Sales deck, demo script, case study pages, lead list workflow",
        "budget": "NT$50K-120K",
        "time": "2-6 weeks"
      }
    ]
  },
  "story": {
    "label": "◆ Why BeyondPath",
    "headline_part1": "AI makes everyone look like an expert.",
    "headline_part2": "It also makes it harder to tell who can actually deliver.",
    "client_eyebrow": "▸ If you're a brand owner",
    "client_pain": "Your pain · You're not short on budget, and you're not against AI. You're afraid you'll spend the money and still end up coaching, fixing and cleaning up yourself.",
    "client_get_label": "What you get on BeyondPath →",
    "client_pt1_bold": "① Validate with a first project",
    "client_pt1_body": " · Start with a ",
    "client_pt1_em": "NT$50-100K",
    "client_pt1_tail": " delivery — no long-term contract on day one.",
    "client_pt2_bold": "② Less uncertainty to manage",
    "client_pt2_body": " · Submit your brief, and within ",
    "client_pt2_em": "24 hours",
    "client_pt2_tail": " you get candidate direction and next steps — no need to send 30 cold emails.",
    "client_pt3_bold": "③ AI helps you decide first",
    "client_pt3_tail": " · In POC, AI breaks down scope and shortlists direction; humans review delivery terms.",
    "client_pt4_bold": "④ Verifiable delivery",
    "client_pt4_tail": " · Every project starts with milestones and acceptance criteria — no more 'we did a lot, but is it done?'",
    "client_replace": "▸ Replaces 'friend referral + monthly agency retainer + Fiverr'",
    "worker_eyebrow": "▸ If you're an expert",
    "worker_pain": "Your pain · You can already ship AI-powered work, but the market still prices you against generic freelancers. Clients can't see your workflow, judgment or delivery quality.",
    "worker_get_label": "What you get on BeyondPath →",
    "worker_pt1_bold": "① Get into the first-wave pool",
    "worker_pt1_tail": " · Once verified, you join the beta shortlist — first projects are matched from this pool first.",
    "worker_pt2_bold": "② No race to the bottom on price",
    "worker_pt2_tail": " · Early beta confirms scope and rate per project. Good delivery gets seen — not the cheapest pitch.",
    "worker_pt3_bold": "③ Show clients why you're worth it",
    "worker_pt3_tail": " · Cases, toolchain and delivery quality become Tier evidence clients can read.",
    "worker_pt4_bold": "④ Trust compounds across projects",
    "worker_pt4_tail": " · Every completed project becomes a recommendation reason for the next — instead of starting from zero each time.",
    "worker_replace": "▸ Replaces 'cold pitching + low-bid contests + dry pipeline'",
    "bottom_para_bold": "This isn't another freelance marketplace.",
    "bottom_para_after": " It's a new set of delivery rules for the AI era: AI-first review, fair scoring, verified supply, verifiable delivery.",
    "bottom_cta_client": "I want to brief an AI project →",
    "bottom_cta_worker": "I want to join the AI expert network →",
    "bottom_cta_demo": "Preview the Worker Console →"
  },
  "problem": {
    "eyebrow": "◆ THE ANXIETY · AI didn't amplify tools. It amplified uncertainty.",
    "headline_part1": "AI multiplied opportunity.",
    "headline_part2_before": "It also blew up ",
    "headline_part2_em": "decision cost",
    "headline_part2_after": ".",
    "intro": "Clients fear hiring the wrong person, betting on the wrong project, not understanding the result. Workers fear their real ability gets benchmarked against cheap templates. BeyondPath isn't filling a tool gap — it's tackling the anxiety, doubt and uncertainty across the AI work network.",
    "fix_label": "→ How BeyondPath turns it into order",
    "items": [
      {
        "lbl": "ANXIETY 1 · CLIENTS",
        "title": "Who can actually deliver?",
        "pain": "Everyone says they can do AI. You can't tell who can demo, who can make graphics, and who can actually ship a result.",
        "fix": "BeyondPath: translate capability into readable delivery risk — through AI-first review, portfolio evidence, and candidate reasoning."
      },
      {
        "lbl": "ANXIETY 2 · WORKERS",
        "title": "How do I get seen?",
        "pain": "You already have an AI workflow, but the market still puts you back in low-bid contests and friend-of-a-friend intros.",
        "fix": "BeyondPath: structure your work, toolchain and delivery quality into verified evidence, so good capability has a fairer entry point."
      },
      {
        "lbl": "ANXIETY 3 · BOTH SIDES",
        "title": "What counts as done?",
        "pain": "The scary part of AI projects isn't starting — it's doing a lot, revising forever, and no one being able to say if it shipped.",
        "fix": "BeyondPath: scope milestones, deliverables and acceptance criteria before kickoff, so both sides share the same rules from day one."
      }
    ]
  },
  "engines": {
    "eyebrow": "◆ HOW IT WORKS · From fuzzy brief to verifiable delivery",
    "headline_part1": "You only need to describe the result.",
    "headline_part2": "We turn it into something briefable, matchable and verifiable.",
    "protocol_label": "◆ 12-step protocol · 4 stages",
    "items": [
      {
        "n": "01",
        "en": "AI BRIEF PARSER",
        "zh": "Brief parsing engine",
        "d": "Turns a natural-language request into goals, deliverables, timeline, budget and acceptance points. In POC, our team reviews each one.",
        "you": "So you → don't need to write a pro brief to scope a project clearly"
      },
      {
        "n": "02",
        "en": "TIER MATCH ENGINE",
        "zh": "Tier matching engine",
        "d": "Recommends Top 3 based on domain, portfolio, toolchain and delivery history — with reasons for each fit.",
        "you": "So you → don't email 30 people. You learn what kind of expert to look for, in 24h.",
        "static_label": "MATCH · TIER A+ / A / B"
      },
      {
        "n": "03",
        "en": "SCOPE + MILESTONE",
        "zh": "Scope × acceptance",
        "d": "POC confirms deliverables, timeline, risks and acceptance criteria. Payment and contract are handled directly between parties.",
        "you": "So you → know what 'done' means before kickoff. No hanging the project on verbal agreements."
      },
      {
        "n": "04",
        "en": "PROJECT DASHBOARD",
        "zh": "Project dashboard",
        "d": "Centralizes progress, versions, deliverables and open items — so projects don't scatter across email, chat and cloud folders.",
        "you": "So you → see where it's stuck without having to chase",
        "static_label": "MILESTONE · AUDIT-READY"
      },
      {
        "n": "05",
        "en": "NPS FLYWHEEL",
        "zh": "Two-sided NPS flywheel",
        "d": "Every closeout records client feedback, delivery quality and collaboration history — gradually shaping recommendation weight.",
        "you": "So you → good workers get seen, not just the well-networked or loud",
        "static_label": "ANTI-MATTHEW · 5-DIM NPS"
      },
      {
        "n": "06",
        "en": "RETAINER ENGINE",
        "zh": "Retainer engine",
        "d": "If the first project goes well, turn one-off needs into a monthly retainer proposal.",
        "you": "So you → keep working with people who deliver — not start the search over each time",
        "static_label": "AUTO-PROPOSAL · MONTHLY"
      }
    ],
    "stages": [
      {
        "i": "I",
        "zh": "Intake",
        "en": "INTAKE",
        "steps": "01 pick domain · 02 upload brief · 03 confirm expectations"
      },
      {
        "i": "II",
        "zh": "Match",
        "en": "MATCH",
        "steps": "04 AI match · 05 accept"
      },
      {
        "i": "III",
        "zh": "Execute",
        "en": "EXECUTE",
        "steps": "06 scope · 07 milestone · 08 dashboard · 09 deliver & accept"
      },
      {
        "i": "IV",
        "zh": "Compound",
        "en": "COMPOUND",
        "steps": "10 two-sided NPS · 11 Tier flywheel · 12 retainer proposal"
      }
    ]
  },
  "trust3": {
    "eyebrow": "◆ TRUST · AI-first, but no one goes into a black box",
    "headline_part1": "Use AI to lower uncertainty.",
    "headline_part2_before": "Then build the ",
    "headline_part2_em": "trust layer",
    "headline_part2_after": " through review and acceptance.",
    "items": [
      {
        "v": "AI",
        "en": "AI REVIEW",
        "zh": "AI review + human verify",
        "facts": [
          "AI first breaks down the brief and delivery scope",
          "Humans review candidates and risk",
          "You're never just dumped into a platform black box"
        ]
      },
      {
        "v": "24h",
        "en": "MATCH DIRECTION",
        "zh": "Candidate direction first",
        "facts": [
          "First-cut judgment on domain and budget fit",
          "Native understanding of briefs in your language",
          "Direction first, shortlist second"
        ]
      },
      {
        "v": "M1",
        "en": "MILESTONE",
        "zh": "Acceptance per project",
        "facts": [
          "Deliverables, timeline and risk defined upfront",
          "Payment and contract handled between parties",
          "No debating 'is it done?' after the fact"
        ]
      }
    ]
  },
  "moat": {
    "eyebrow": "◆ WHY BEYONDPATH · When LLMs can also match — what's left?",
    "headline_part1": "LLMs can recommend people.",
    "headline_part2_before": "Trust comes from ",
    "headline_part2_em": "delivery evidence",
    "headline_part2_after": ".",
    "intro": "BeyondPath doesn't bet on 'better matching than AI.' We're building the trust data layer for AI work: who has actually delivered which type of project, with what workflow, how it was accepted, and why they're worth recommending next time.",
    "items": [
      {
        "axis": "LLMs can do",
        "ttl": "Recommend someone who looks like a fit",
        "body": "Any LLM will eventually read briefs, generate shortlists and compare portfolios. That becomes table stakes, not a moat.",
        "peer": "▸ Lists get cheaper over time"
      },
      {
        "axis": "BeyondPath compounds",
        "ttl": "Who has actually delivered, and how",
        "body": "We capture AI workflow, deliverables, acceptance records, two-sided NPS and contextual fit — so the next recommendation isn't a guess, it's grounded in delivery evidence.",
        "peer": "▸ Trust gets thicker with use"
      },
      {
        "axis": "What's irreplaceable",
        "ttl": "Not the matching algorithm — the AI work trust data",
        "body": "What's scarce is local-context briefs, industry-specific needs, worker workflow proof, delivery quality and collaboration records. That data shapes BeyondPath's recommendation weight and certification rules.",
        "peer": "▸ From 'find someone' to a work trust layer"
      }
    ]
  },
  "cases": {
    "eyebrow": "◆ CASE STUDIES · Real projects, real records",
    "headline_part1": "See how BeyondPath ",
    "headline_em": "actually runs",
    "headline_part2": ".",
    "intro_before": "3 cases are early BeyondPath sample collaborations (DTC vertical) — showing the real shape of brief → match → deliver → accept.",
    "intro_paren_before": "(14 other verticals accumulating · for a sample in your vertical, ",
    "intro_paren_link": "submit a brief",
    "intro_paren_after": " and we'll email a real match within 24h)",
    "label_brief": "① BRIEF",
    "label_match": "② MATCH",
    "label_deliver": "③ DELIVER",
    "label_accept": "④ ACCEPT",
    "label_result": "⑤ RESULT · ",
    "footer_before": "▸ Want more?",
    "footer_link": "Email BeyondPath for the work sample pack",
    "items": [
      {
        "brand": "LUMINE",
        "sector": "DTC skincare",
        "brief": "Launching 3 'Night Repair' SKUs end of September — needs 2 hero KV variants + 6 IG Reels scripts + 3 product page articles + EDM copy, scheduled across Meta + LINE.",
        "matched": "Tier A+ domain expert · Visual KV + Brand DNA × AI · match score 92 / 100",
        "delivered": "2 KVs × 4 alts each · 4-week delivery · NPS 4.94 / 5",
        "proof": "Delivery evidence: brief, version log, acceptance checklist, NPS 4.94 / 5",
        "state": "Moved into retainer · ongoing through Q1 2027 launches",
        "badge": "Closed · NPS 4.94"
      },
      {
        "brand": "HANA Fragrance",
        "sector": "spring restage",
        "brief": "2 SKUs in the new fragrance line, spring visual restage — 2 KV variants + 8 social assets in 4 weeks.",
        "matched": "Same Tier A+ expert (already on LUMINE retainer) · capacity 75% · platform priority recommendation",
        "delivered": "2 KVs × 4 alts · wk 2 / 4 · 50% progress",
        "proof": "Delivery evidence: wk 2 versions uploaded, mid-review complete 2/4",
        "state": "● In progress · ON TRACK",
        "badge": "In progress · WK 2 / 4"
      },
      {
        "brand": "Plant by Plant",
        "sector": "packaging design",
        "brief": "Plant-based skincare line packaging refresh — brand DNA spec + 6 SKU packaging dielines in 6 weeks.",
        "matched": "Tier A+ Brand DNA × AI expert · match score 88 / 100",
        "delivered": "6 SKU dielines · 32-page brand spec · final review stage",
        "proof": "Delivery evidence: 6 SKU dielines, 32-page brand spec, final review",
        "state": "● Final review · WK 6 / 6",
        "badge": "WK 6 / 6 · FINAL REVIEW"
      }
    ]
  },
  "tier": {
    "eyebrow": "◆ TIER · 5 levels · ranked by NPS",
    "headline_part1": "Tier isn't decoration · ",
    "headline_em": "it's recommendation weight",
    "headline_part2": ".",
    "intro": "Tier is ranked by closing NPS, domain certification, client referrals + Anti-Matthew +10 (slot reserved for workers with no projects in the last 3 months). Workers see 'what's missing to level up'; clients see 'why this worker costs more.'",
    "typical_label": "typical",
    "day1_label_part1": "▸ DAY 1",
    "day1_label_part2": "path",
    "day1_body_main": "Get verified → join the beta first-wave pool → first projects prioritized from the verified list.",
    "day1_body_sub": "We turn your cases, toolchain and delivery quality into evidence clients can read — then NPS and recommendation weight compound over time.",
    "items": [
      {
        "id": "S",
        "zh": "Paragon",
        "sub": "PARAGON · 5+ cross-domain · NPS ≥ 4.7",
        "stat": "10+ cases · NT$ 400K+"
      },
      {
        "id": "A+",
        "zh": "Master",
        "sub": "MASTER · 30+ projects · domain NPS ≥ 4.5",
        "stat": "30+ cases · NT$ 220K"
      },
      {
        "id": "A",
        "zh": "Pro",
        "sub": "PRO · 30+ projects · 3+ client referrals",
        "stat": "30+ cases · NT$ 145K"
      },
      {
        "id": "B",
        "zh": "Verified entry",
        "sub": "ENTRY · 4-stage certification complete",
        "stat": "5-30 cases · NT$ 78K"
      },
      {
        "id": "C",
        "zh": "Trainee",
        "sub": "TRAINEE · In application / completing docs",
        "stat": "0-5 cases · —"
      }
    ]
  },
  "network": {
    "eyebrow": "◆ NETWORK · 15 verticals · 24h first-cut judgment",
    "headline_part1": "15 ",
    "headline_em": "verticals",
    "headline_part2": " — start by knowing what kind of expert to look for.",
    "footer": "▸ HOT VERTICALS · +47% MoM growth · DTC + AI Agent",
    "hot_tag": "HOT",
    "verticals": [
      "DTC content automation",
      "Design brand × AI",
      "Short-form video · editing",
      "Web design + frontend",
      "Custom software dev",
      "Custom systems build",
      "AI agent · bot",
      "Data · BI",
      "B2B SaaS GTM",
      "Brand & market research",
      "Marketing ops",
      "SEO · content ops",
      "Support automation",
      "Translation · localization",
      "Other"
    ]
  },
  "services": {
    "eyebrow": "◆ SERVICES · What's available now + price reference",
    "headline_part1": "4 main delivery types — ",
    "headline_em": "each with matched Tier and budget reference",
    "headline_part2": ".",
    "intro": "These ranges are reference, not fixed quotes. Actual price depends on scope complexity, deliverable range and timeline. Submit a brief and within 24h you'll get a matched proposal with suggested budget.",
    "label_range": "RANGE",
    "data_label": "◆ DATA HANDLING · How your data is treated",
    "data_body_before": "Briefs, emails and portfolios submitted to BeyondPath go to our internal team + AI review tools only — not public, not resold. Retention follows business need (future matching and retainer invitations); email ",
    "data_body_link": "hello@beyondpath.tw",
    "data_body_after": " any time to request deletion.",
    "data_cta": "Read the full privacy policy →",
    "items": [
      {
        "n": "01",
        "en": "AI WORKFLOW",
        "zh": "AI workflow consulting + build",
        "desc": "From scoping to toolchain setup, including handoff docs. Common: support automation, content pipelines, internal agents.",
        "tiers": "Tier B+ / A+",
        "range": "NT$ 150K-800K"
      },
      {
        "n": "02",
        "en": "BRAND CONTENT",
        "zh": "DTC brand content",
        "desc": "Visual KV, brand DNA, social content ops. Common: skincare / food / design brand launches + ongoing operation.",
        "tiers": "Tier B / B+ / A+",
        "range": "NT$ 50K-600K"
      },
      {
        "n": "03",
        "en": "REELS · VIDEO",
        "zh": "Short-form video + Reels",
        "desc": "Script + shoot + edit, end-to-end. Common: brand storytelling, UGC style, product demos, tutorials.",
        "tiers": "Tier B / B+",
        "range": "NT$ 30K-250K"
      },
      {
        "n": "04",
        "en": "CUSTOM DEV",
        "zh": "Custom software / AI agent / workflows",
        "desc": "Prototype to production: API integration, bots, internal tools. Common: Slack agents, CRM automation, Make / n8n flows.",
        "tiers": "Tier B+ / A+",
        "range": "NT$ 100K-1.2M"
      }
    ]
  },
  "faq": {
    "eyebrow": "◆ FAQ · The real questions",
    "headline_part1": "Seven ",
    "headline_em": "honest questions",
    "headline_part2": ".",
    "intro_before": "First 4 are for clients, last 3 are for experts. Anything not covered — email BeyondPath → ",
    "intro_email": "edwardt0303@gmail.com",
    "items": [
      {
        "n": "01",
        "tag": "CLIENT",
        "q": "I already work with freelancers / designers — why switch to BeyondPath?",
        "a": "You don't switch — you run BeyondPath in parallel. We solve a specific scenario: a new type of AI deliverable that's outside your existing network. Example: your usual designer doesn't edit short-form video, and you don't want to re-brief 30 strangers for one Reel. Submit a brief and within 24h you learn what domain, budget and candidate direction fit; then look at Top 3 with reasoning. First project is yours to judge — no lock-in, no subscription."
      },
      {
        "n": "02",
        "tag": "CLIENT",
        "q": "What if the work doesn't get done / quality is off?",
        "a": "POC won't throw you into a fully automated black box. We use AI to break down the request, judge domain and risk first, then humans review milestones, acceptance criteria and candidates. Early beta doesn't custody payment; payment and contract are handled directly between parties. BeyondPath's job at this stage is to get the brief, candidate and acceptance record right."
      },
      {
        "n": "03",
        "tag": "CLIENT",
        "q": "If LLMs can match people in the future, do you still need BeyondPath?",
        "a": "If it were just shortlists, yes — LLMs will commoditize that. What BeyondPath compounds is what LLMs can't directly own: a worker's AI workflow, real deliverables, acceptance records, two-sided NPS, fit context and failure risk. Lists are the start. The value is evidence for 'why this person is worth trusting.'"
      },
      {
        "n": "04",
        "tag": "CLIENT",
        "q": "Is this more expensive than Fiverr / cheaper than an agency? How do you price?",
        "a": "We sit between Fiverr and a monthly agency retainer. Early on we'll test pricing across brief diagnosis, shortlists, certification fees or matching service fees — we don't custody project payment. What you pay for isn't the list; it's scope breakdown, candidate reasoning, an acceptance framework, and the judgment cost saved from picking wrong."
      },
      {
        "n": "05",
        "tag": "EXPERT",
        "q": "I want to apply — how? Is acceptance really under 10%?",
        "a": "Two stages: Stage 1 (Tier B entry — AI screening + simple verification) ~28% passes. Stage 2 (Tier A full certification) is <10%. Full 4-stage certification: (1) skill test in your domain, (2) peer review by certified workers, (3) simulated client project — you receive a fake brief and submit a real deliverable, (4) head review committee — only after passing the first three. End-to-end ~2-3 weeks. If you don't pass, you can re-apply in 6 months with platform feedback on what to strengthen."
      },
      {
        "n": "06",
        "tag": "EXPERT",
        "q": "How does the platform charge me? Do I pay upfront?",
        "a": "Early beta doesn't custody project payment and doesn't lock in a commission promise. BeyondPath will test pricing across brief diagnosis, shortlists, certification or matching fees. Applying is free, and you're not asked to commit exclusivity."
      },
      {
        "n": "07",
        "tag": "EXPERT",
        "q": "What if I go a while without getting matched — does the platform help?",
        "a": "Yes. We have Anti-Matthew +10: workers without a project in 3 months get +10 priority in matching, newly certified (<30 days) get +5, and 20% of the first-wave slot is reserved for new workers. This is on top of <10% certification — not a lowered bar, just a fair shot for the already-verified. An AI coach also nudges 'what's missing to level up' and 'which verticals are hot.'"
      }
    ]
  },
  "finalcta": {
    "roadmap_label": "◆ ROADMAP · Before you join the queue · our progress",
    "eyebrow": "◆ JOIN · PRIVATE BETA",
    "headline": "Join the first AI work network.",
    "blurb": "The first beta cohort runs AI-first review with human verification in parallel. Clients can submit briefs and turn uncertain AI projects into a verifiable workflow. Experts can submit portfolio and AI workflow — and have their capability verified, understood and recommended.",
    "cta_client_main": "I want to brief an AI project →",
    "cta_client_sub": "Client",
    "cta_worker_main": "I want to join the AI expert network →",
    "cta_worker_sub": "Expert",
    "cta_demo": "Preview the Worker Console →",
    "cta_waitlist_main": "Join the beta waitlist →",
    "cta_waitlist_sub": "Manually reviewed",
    "meta_left": "EARLY BETA",
    "meta_right": "Submission goes to human review · not a formal contract or payment"
  },
  "footer": {
    "brand_tag": "Taiwan beta starts with AI content, websites, automation and GTM delivery. Lower hiring and delivery risk through briefs, candidates and milestones.",
    "col_product": "PRODUCT",
    "col_network": "NETWORK",
    "col_company": "COMPANY",
    "col_legal": "LEGAL",
    "link_protocol": "Workflow protocol · 12 steps",
    "link_engines": "Core engines · 6",
    "link_tier": "Tier flywheel",
    "link_trust": "Trust mechanism",
    "link_why": "WHY BEYONDPATH",
    "link_client_apply": "Client application",
    "link_expert_apply": "Expert application",
    "link_15verticals": "15 verticals overview",
    "link_master_wall": "A+ master wall · soon",
    "link_retainer": "Retainer plans · soon",
    "link_about": "About BeyondPath",
    "link_feedback": "Collaboration feedback · soon",
    "link_join_us": "Join us",
    "link_contact_email": "edwardt0303@gmail.com",
    "link_terms": "Terms · soon",
    "link_privacy": "Privacy · soon",
    "link_acceptance": "Acceptance rules",
    "link_dispute": "Dispute & record process",
    "link_security": "Security whitepaper · v0.4 · soon",
    "copyright": "© 2026 BEYONDPATH NETWORK",
    "cities": "TAIPEI × SINGAPORE × TOKYO · Y1->Y3",
    "version_status": "v0.5β · LIVE · BETA COHORT OPEN"
  },
  "banner": {
    "label": "◆ WORKER DECISION",
    "ok_title": "Match invitation accepted",
    "ok_body": "BeyondPath will prepare a contract draft and initial milestone within 24-72 hours, sent to your email. The client will also be notified that the worker has confirmed. If you don't receive it within 72 hours, contact hello@beyondpath.tw.",
    "decline_title": "Match decline recorded",
    "decline_body": "Thanks for letting us know. We'll keep you in priority for the next fitting project.",
    "error_title": "Match link expired or invalid",
    "error_body": "Invitation links are valid for 7 days. Please contact BeyondPath: hello@beyondpath.tw",
    "default_title": "Thanks for your response",
    "default_body": "Any questions, contact BeyondPath: hello@beyondpath.tw",
    "close_aria": "Close"
  },
  "misc": {
    "back_to_top": "Back to top",
    "engines_ahead": "/* engines ahead · 6 friction points, one at a time */"
  }
};
})(window);
