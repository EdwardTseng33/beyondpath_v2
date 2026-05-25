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
  },
  "waitlist": {
    "meta_title": "[EN] 加入 Waitlist · BeyondPath",
    "meta_description": "[EN] 加入 BeyondPath waitlist。Prototype 階段不會自動收集個資，請寄信給 Edward 或複製 email 手動聯繫。",
    "top_back": "BACK TO LANDING",
    "eyebrow": "[EN] ◆ JOIN WAITLIST · PROTOTYPE STAGE",
    "h1": "[EN] 想收到 BeyondPath beta 進度，先寄信給 Edward。",
    "sub": "[EN] 目前 prototype 還沒有正式表單後端，不會自動收集或儲存你的個資。你可以用 email 告訴我你是發案方、接案者，或只是想追蹤產品進度。",
    "note_label": "[EN] 建議信件內容：",
    "note_body": "[EN] 你的名字、角色、想看的方向、是否願意參與第一批 beta 試做。",
    "manual_label": "[EN] manual recipient",
    "btn_copy": "[EN] 複製 EMAIL",
    "btn_copy_done": "[EN] 已複製",
    "role_client_title": "[EN] 發案方",
    "role_client_sub": "[EN] CLIENT · WANT PILOT",
    "role_worker_title": "[EN] 接案者",
    "role_worker_sub": "[EN] WORKER · WANT CERT",
    "role_follow_title": "[EN] 追蹤進度",
    "role_follow_sub": "[EN] FOLLOW · PRODUCT UPDATES",
    "btn_email_draft": "[EN] 開啟 waitlist email 草稿 →",
    "btn_back": "[EN] 回產品頁",
    "footer": "[EN] BeyondPath · Prototype v0.2 · waitlist uses manual email until a privacy-reviewed form backend is ready."
  },
  "admin": {
    "label_skill_matrix_title": "[EN] ◆ Skill Matrix · 6 維 (1-10)",
    "label_skill_workflow": "Workflow",
    "label_skill_tools": "Tools",
    "label_skill_judgment": "Judgment",
    "label_skill_domain": "Domain",
    "label_skill_comm": "Comm",
    "label_skill_delivery": "Delivery",
    "label_audit_flags_title": "[EN] ◆ Audit Flags · 訪談證據偵測",
    "label_ai_proof_raw": "[EN] ◆ ai_proof (raw)",
    "label_unified_card": "[EN] ◆ unified_card",
    "label_unified_card_empty": "[EN] (尚未產生 unified_card · 訪談未完成或 mapping fail)",
    "card_label_applied": "[EN] 申請",
    "card_label_submitted": "[EN] 送出",
    "card_label_sent_time": "[EN] 寄出時間",
    "card_label_decided_time": "[EN] 決定時間",
    "placeholder_admin_notes": "[EN] admin_notes (optional · 內部備註、不對外)",
    "placeholder_worker_msg": "[EN] 給 worker 的訊息 (optional · 會放進 email 內容)",
    "btn_processing": "[EN] 處理中…",
    "btn_approve": "[EN] ✓ Approve (進 worker pool)",
    "btn_reject": "[EN] ✗ Reject",
    "btn_archive": "Archive",
    "btn_collapse": "[EN] 收起",
    "btn_expand_raw": "[EN] 展開原始資料",
    "btn_expand": "[EN] 展開",
    "btn_run_match": "[EN] ◆ 跑 AI 配對（match-workers）",
    "btn_sending": "[EN] 寄信中…",
    "btn_send_invites": "[EN] ✉ 寄邀請信給選中的 worker",
    "btn_rerun_match": "[EN] 重新跑配對",
    "btn_save_weights": "[EN] 儲存權重",
    "btn_reset_default": "[EN] 回 default",
    "err_select_one_worker": "[EN] 至少選 1 位 worker 邀請",
    "msg_matching": "[EN] 跑配對演算法中…",
    "msg_match_failed_prefix": "[EN] 配對失敗：",
    "msg_match_failed_suffix": "[EN] （可能 match-workers Edge Function 還沒部署、或 worker pool 該 vertical 沒人）",
    "msg_send_failed_prefix": "[EN] 寄信失敗：",
    "msg_send_ok_prefix": "[EN] ✓ 已寄出 ",
    "msg_send_ok_suffix": "[EN]  封邀請信",
    "label_top_match_prefix": "[EN] ◆ TOP ",
    "label_top_match_suffix": "[EN]  MATCH 候選",
    "label_invite": "[EN] 邀請",
    "label_load_decisions": "[EN] 載入決定紀錄中…",
    "msg_load_decisions_failed_prefix": "[EN] 載入失敗：",
    "msg_load_decisions_failed_suffix": "[EN] （可能 worker_decisions table 還沒建）",
    "msg_no_decisions": "[EN] 尚無配對決定紀錄",
    "err_save_failed": "[EN] 儲存失敗",
    "err_reset_failed": "[EN] 重置失敗",
    "weight_tier_label": "[EN] Tier 對位",
    "weight_tier_hint": "[EN] client required_tier 跟 worker 當前 Tier 的吻合度",
    "weight_capacity_label": "[EN] 容量",
    "weight_capacity_hint": "[EN] worker 當前接案餘力 · timeline rush 加權",
    "weight_domain_label": "[EN] 領域吻合",
    "weight_domain_hint": "[EN] client.vertical 跟 worker.verticals 主／鄰近 + 任務 → skill_matrix 對應",
    "weight_lscore_label": "L-score",
    "weight_lscore_hint": "[EN] worker 自評 AI 使用 leverage 程度 0-10",
    "weight_mercy_label": "[EN] 反馬太效應",
    "weight_mercy_hint": "[EN] > 90 天沒接案的 worker 補一個 boost · 防新人凍結",
    "settings_title": "[EN] 5 維配對權重",
    "settings_sub": "[EN] 改完按「儲存」、下次 runMatch 自動帶 · 儲存在你瀏覽器 localStorage",
    "settings_sum_label": "Sum",
    "settings_sum_hint": "[EN] sum 100 = 平衡配置（每維權重 / 100 = 影響力百分比）· 大於 100 等於相對放大、小於 100 等於相對縮小。",
    "settings_default_hint": "[EN] 目前 default：tier 25 / capacity 20 / domain 30 / L_score 15 / mercy 10 = 100",
    "settings_saved_msg": "[EN] ✓ 已儲存 · 下次配對自動帶這組權重",
    "tab_pending_workers": "Pending Workers",
    "tab_client_intakes": "Client Intakes",
    "tab_decisions_history": "Decisions History",
    "tab_settings": "⚙ Settings",
    "err_action_prefix": "[EN] 操作失敗：",
    "msg_loading_workers": "[EN] 載入 worker 名單中…",
    "msg_load_workers_failed_prefix": "[EN] 載入失敗：",
    "msg_no_pending_workers": "[EN] 目前沒有 pending / tier_b / tier_b_plus 的 worker",
    "msg_loading_intakes": "[EN] 載入 client intake 中…",
    "msg_load_intakes_failed_prefix": "[EN] 載入失敗：",
    "msg_no_intakes": "[EN] 目前沒有 new / reviewing 的 client intake",
    "title_admin": "Admin Console",
    "meta_internal": "POC · INTERNAL ONLY · v0.1"
  },
  "app": {
    "disc_top_label": "[EN] PROTOTYPE DEMO · 非正式服務",
    "disc_top_body": "[EN] 所有資料皆為模擬 · 真實服務尚未開放 · 不收費 / 不處理真實個資 / 不簽法律效力文件 · 正式上線預計 2026 Q3 · ",
    "disc_top_waitlist": "[EN] 加入 waitlist →",
    "disc_top_close_aria": "[EN] 關閉提醒",
    "disc_foot": "[EN] BeyondPath · Prototype v0.2 · 2026-05-09 · 所有合約 / 付款 / 認證內容僅為展示、無法律效力 · 正式上線前完整律師審視中 · ",
    "step_label_pre_intake": "[EN] Step 01 / Pre-intake · 選領域 + 上傳需求",
    "step_label_confirm": "[EN] Step 02 / Confirm · 確認期待",
    "step_label_ai_parse": "[EN] Step 03 / AI Parse · AI 拆解需求",
    "step_label_match": "[EN] Step 04 / Match · AI 配對 + 人工覆核",
    "step_name_01": "[EN] 選領域 + 上傳需求",
    "step_name_02": "[EN] 確認期待",
    "step_name_03": "[EN] AI 拆解需求",
    "step_name_04": "[EN] AI 自動配對",
    "step_short_01": "Pre-intake",
    "step_short_02": "Confirm",
    "step_short_03": "AI Parse",
    "step_short_04": "Match"
  },
  "client": {
    "h1_step01_zh": "[EN] 選擇案件垂直領域，匯入需求文件。",
    "h1_step02_zh": "[EN] 補完 AI 拆解中沒涵蓋的偏好。",
    "sub_step01_full": "[EN] BeyondPath 用領域分流，每個領域有自己的需求模板與專屬 worker pool。先選領域，再用平台 AI 模板整理你的需求 — 或直接貼進來，我們幫你拆。",
    "early_beta_label": "[EN] ◆ Early Beta · 不代收專案款",
    "early_beta_body": "[EN]  ：平台只做需求拆解、候選推薦、驗收紀錄；合約與付款由雙方確認。",
    "section_vertical_zh": "[EN] 垂直領域",
    "section_brief_zh": "[EN] 需求文件",
    "section_enterprise_zh": "[EN] 企業流程",
    "section_about_you_zh": "[EN] 關於你",
    "optional_label": "[EN] optional · 選填",
    "vertical_placeholder": "[EN] 搜尋領域 / search…",
    "vertical_no_match": "[EN] 沒有符合的領域。試試清除搜尋或切「Other」分流給平台客服。",
    "brief_template_hint1": "[EN] 可下載我們的",
    "brief_template_hint2": "[EN] ，用 ChatGPT / Claude 套版整理後上傳。AI 會掃描 PII 並自動遮罩。",
    "brief_placeholder": "[EN] # 我們是 ____\n# 我們需要 ____\n# 預算 ____ 時間 ____",
    "enterprise_hint": "[EN] B2B / 大型企業案、勾選後 BeyondPath 24h 內回信時一併處理 NDA / 發票 / 合約 / 預約視訊。不勾沒關係、預設走個人案流程。",
    "ent_nda_label": "[EN] 需要 NDA",
    "ent_nda_sub": "[EN] 簽保密協議才能談",
    "ent_invoice_label": "[EN] 需要公司發票",
    "ent_invoice_sub": "[EN] 三聯式 / 含統編",
    "ent_contract_label": "[EN] 公司對公司簽約",
    "ent_contract_sub": "[EN] 正式服務合約 · 不接受 PayPal",
    "ent_talk_label": "[EN] 想先跟 BeyondPath 團隊聊 30 min",
    "ent_talk_sub": "[EN] 大金額 / 複雜案 · 視訊預約",
    "about_you_hint": "[EN] 讓我們更了解你的身分。資料只用於配對、不對外公開。",
    "about_company_label": "[EN] 公司 / 品牌主",
    "about_company_sub": "[EN] 有正式登記、發案做 B2B / B2C",
    "about_individual_label": "[EN] 個人 / 自由業",
    "about_individual_sub": "[EN] freelancer / soloist · 個人專案",
    "about_studio_label": "[EN] 工作室 / 創辦人",
    "about_studio_sub": "[EN] 2-10 人團隊、想擴 capacity",
    "about_student_label": "[EN] 學生 / 學習中",
    "about_student_sub": "[EN] 校內專案 / 投資組合 / 練手",
    "beta_ack_prefix": "[EN] 我了解 Early Beta 階段規則",
    "beta_ack_body": "[EN] ：BeyondPath 不代收專案款、合約由雙方確認；送出 brief 進人工審核、不代表正式承諾或付款。",
    "err_brief_too_short": "[EN] brief 內容太短（< 20 字）、無法 AI 拆解。請回 Step 01 補充。",
    "err_supabase_not_loaded": "[EN] Supabase client 尚未載入、請重整頁面。",
    "err_call_failed_prefix": "[EN] 呼叫失敗：",
    "err_ai_parse_failed_prefix": "[EN] AI 拆解失敗：",
    "err_unknown": "[EN] 未知錯誤",
    "err_network_retry": "[EN] 網路錯誤、請重試",
    "step03_sub": "[EN] 平台 AI 正在拆解你的需求成可執行任務。",
    "trace_title": "[EN] 推理日誌",
    "result_title": "[EN] 結構化卡片",
    "lbl_tasks": "[EN] 任務拆解",
    "lbl_budget": "[EN] 預估",
    "lbl_effort": "[EN] 總工時",
    "lbl_flags": "[EN] AI 提醒",
    "phase_error_hint": "[EN] ↻ 修正後重試、cards 才會出現",
    "phase_pending_hint": "awaiting trace · cards will materialise",
    "confirm_pill": "[EN] 補完 AI 沒猜到的",
    "tier_b_zh": "[EN] 實踐者",
    "tier_a_zh": "[EN] 專家",
    "tier_aplus_zh": "[EN] 大師",
    "tier_s_zh": "[EN] 典範",
    "tier_any_price": "[EN] 看 AI 拆解",
    "tier_price_note": "[EN] ※ 價格區間為平台統計、實際報價依案件複雜度 + Claude AI 顧問建議調整（含 +15% 平台溢價）",
    "lbl_deliverables_zh": "[EN] 交付內容",
    "deliv_kv": "[EN] KV 主視覺",
    "deliv_reels": "[EN] Reels 腳本",
    "deliv_copy": "[EN] 產品文案",
    "deliv_schedule": "[EN] 排程操盤",
    "deliv_roas": "[EN] ROAS 解讀",
    "lbl_delivery_window_zh": "[EN] 期待交付時間",
    "delivery_flex": "[EN] 彈性",
    "lbl_budget_cap_zh": "[EN] 預算上限（彈性 / 嚴格）",
    "lbl_multi_zh": "[EN] 是否接受多人共案",
    "multi_on": "[EN] ON · 接受 2-3 expert",
    "multi_off": "[EN] OFF · 單一 worker",
    "lbl_nps_zh": "[EN] 過往 NPS 門檻",
    "nps_loose": "[EN] 寬鬆",
    "nps_standard": "[EN] 標準",
    "nps_strict": "[EN] 嚴格",
    "nps_top": "[EN] 頂級",
    "lbl_bonus_zh": "[EN] 加分條件（複選）",
    "bonus_voice_zh": "[EN] 希望 worker 自帶 IG/Threads 聲量",
    "bonus_local_zh": "[EN] 希望 worker 熟台灣市場文化",
    "bonus_loyalty_zh": "[EN] 優先曾合作過的 worker",
    "bonus_mercy_zh": "[EN] 願意給新銳 worker 機會（非主流選項加分）",
    "vertical_fallback": "[EN] 你選的領域",
    "step04_pill_poc": "[EN] ● POC · 早期合作",
    "pool_real_title": "[EN] 已通過認證的真實 worker pool",
    "pool_demo_title": "[EN] 目前該領域認證 worker 累積中、以下為過往合作案例展示",
    "pool_loading": "[EN] ● 載入中…",
    "pool_real": "[EN] ● 真實配對池",
    "pool_demo": "[EN] ● 案例展示",
    "match_demo_hint_prefix": "[EN] 下方為「",
    "match_demo_hint_suffix": "[EN] 」領域過往合作案例參考、實際配對 24h 內以 email 寄出。",
    "match_received_label": "[EN] 已收到你的「",
    "match_received_mid": "[EN] 」需求、進入後台",
    "match_demo_body_prefix": "[EN] 下方為「",
    "match_demo_body_mid": "[EN] 」領域過往合作案例參考。",
    "match_demo_body_emph": "[EN] 實際配對方案 24h 內寄到你的 email",
    "match_demo_body_suffix": "[EN] ：含 AI 初審 + 團隊人工覆核 + 候選 worker + 報價區間。早期合作 · 第一批一對一處理。",
    "match_no_match": "[EN] 沒有符合的 worker。試試放寬條件，或 24h 客服介入。",
    "mercy_label": "[EN] +10 反馬太",
    "submit_eyebrow": "[EN] ◆ 取得 24h 配對方案",
    "submit_title": "[EN] 送出需求 · 取得 24h 配對方案",
    "submit_sub": "[EN] 24h 內：AI 初審 + 人工覆核 → 配對方案、候選人與時程寄到你的 email。Early Beta · 送出進人工審核、不代表正式合約或付款。",
    "submit_email_placeholder": "[EN] your@email.com（必填）",
    "submit_company_placeholder": "[EN] 公司 / 品牌名（可選）",
    "submit_btn_cancel": "[EN] 取消",
    "submit_btn_submit": "[EN] → 取得 24h 配對方案",
    "submit_btn_submitting": "[EN] 送出中…",
    "submit_disclaimer": "[EN] Early Beta · 你的 brief + 配對結果進入 BeyondPath 後台、不會公開 · 24h 內 email 回覆 · 第一次送出僅取得配對方案、不代表正式合約或付款",
    "err_email_invalid": "[EN] 請填一個有效 email · BeyondPath 24h 內回覆配對結果",
    "err_submit_failed_prefix": "[EN] 送出失敗：",
    "err_submit_failed_suffix": "[EN] 。先複製 brief 寄到 edwardt0303@gmail.com 也行。",
    "submit_done_label": "[EN] 合約草稿預覽 →",
    "submit_normal_label": "Submit · 取得 24h 配對方案 →"
  },
  "worker": {
    "header_desc_zh": "[EN] 這是通過認證後的接案方畫面範例 · 資料皆為模擬",
    "header_subsidy_label": "[EN] terms + AI 補貼",
    "demo_entry_eyebrow": "[EN] ◆ 首次進入 · TIER B APPLY",
    "demo_entry_title": "[EN] 先做你的 AI 認證評估、生成能力卡",
    "demo_entry_sub": "[EN] 5 步 · 30-45 分鐘 · 用你自己的 AI 整理工作證據 · 24h 內 AI 初步回覆、3-7 天人工覆核",
    "demo_entry_cta": "[EN] → 開始評估",
    "demo_preview_banner_label": "[EN] 通過後預覽",
    "demo_preview_banner_body": "[EN]  · 下方是通過 Tier B 認證後你會看到的 Worker Console · 目前是 demo 樣態、實際數據以你通過後為準",
    "status_sub": "[EN] 3 個案在跑、1 個提案待回。",
    "tier_ladder_title": "[EN] 從入門到大師",
    "tier_c_zh": "[EN] 未通過審核",
    "tier_c_sub": "[EN] 此狀態無法接案 · 不進入配對池",
    "tier_b_zh": "[EN] 實踐者",
    "tier_b_sub": "[EN] 通過基礎驗證 · 市價 −10%",
    "tier_b_crit": "[EN] 1–2 案",
    "tier_a_zh": "[EN] 專家",
    "tier_a_sub": "[EN] 通過認證，平均 NPS 4.3 · 市價",
    "tier_a_crit": "[EN] 3–9 案",
    "tier_aplus_zh": "[EN] 大師",
    "tier_aplus_sub": "[EN] 通過垂直認證 · 市價 +15%",
    "tier_aplus_crit": "[EN] 10–29 案",
    "tier_s_zh": "[EN] 典範",
    "tier_s_sub": "[EN] ≥ 30 案，平均 NPS 4.7 · 市價 +35%",
    "tier_s_crit": "[EN] 30+ 案",
    "upgrade_checklist_title": "[EN] 升級到 Tier S 還差什麼 · UPGRADE CHECKLIST",
    "tier_s_label": "[EN] TIER S · 典範",
    "checklist_nps_t": "[EN] 平均 NPS ≥ 4.7",
    "checklist_nps_sub": "[EN] current 4.94 · streak 6 個月",
    "checklist_retainer_t": "[EN] 至少 2 個 retainer 案",
    "checklist_retainer_sub": "[EN] 2 / 2 · LUMINE + HANA",
    "checklist_brand_t": "[EN] 解鎖「Brand DNA × AI」垂直認證",
    "checklist_brand_sub": "[EN] unlocked 2024-12",
    "checklist_high_nps_t": "[EN] 累積 24+ 高 NPS 案",
    "checklist_high_nps_sub": "[EN] 24 / 24 · 已達基線",
    "checklist_casestudy_t": "[EN] 完成 Tier S 認證 case study",
    "checklist_casestudy_sub": "[EN] 0 / 2 · 需 NPS ≥ 4.9 案件作評審 sample",
    "checklist_avg_budget_t": "[EN] 平均 case 預算 ≥ NT$120K",
    "checklist_avg_budget_sub": "[EN] current avg NT$98K · 還差 NT$22K",
    "checklist_review_t": "[EN] 通過 S-tier 客戶推薦審查",
    "checklist_review_sub": "[EN] 0 / 1 · 需 1 位 Tier S 客戶推薦或委員會審核",
    "upgrade_trigger_zh": "[EN] 完成 1 個 NT$120K+ 高 NPS 案 + 認證 case study × 2 → 觸發 Tier S 委員會審核 →",
    "badges_title": "[EN] 你的徽章牆",
    "weighting_title": "[EN] 你目前的推薦權重",
    "tool_subsidy_title": "[EN] AI 工具補貼 · Tier A+ benefit",
    "subsidy_label": "[EN] AI 工具補貼",
    "no_collect_zh": "[EN] 早期不在平台內代收專案款；報價、付款與合約由雙方自行約定，BeyondPath 先累積驗收與交付證據。",
    "coach_title": "[EN] AI 教練 · skill assessment",
    "skillgap_label": "[EN] skill gap analysis · 你 vs Tier A+ DTC 中位",
    "skillgap_rank": "[EN] 4 / 6 領先 · 2 / 6 落後",
    "summary_intro_p1": "[EN] 你的 <b>Visual + Brand DNA</b> 已穩居 Tier A+ DTC 領先群。下一個 unlock（Tier S）的瓶頸是 ",
    "summary_warn1": "[EN] Reels 短影音 ",
    "summary_and": "[EN] 與 ",
    "summary_warn2": "[EN] 績效型文案",
    "summary_outro": "[EN] ——這兩塊正是 LUMINE 案中由 Mei 補上的部分。 補齊後預估推薦權重再 +12%。",
    "recommended_title": "[EN] 補足學習路徑（個人化）",
    "tools_title": "[EN] 你還沒接上的最新工具（AI 自動偵測）",
    "tools_state_connected": "[EN] 已接",
    "tools_state_try": "[EN] 推薦",
    "tools_state_connected_badge": "✓ connected",
    "tools_state_try_badge": "+ try",
    "learning_zh": "[EN] 學習路徑由 AI 根據你 24 個案例 / 162 件交付物 + Tier S 標準缺口反推。完成後自動回填至 B3 Tier 進度，不需手動申請。",
    "inbox_title": "[EN] inbox · 3 待回",
    "month_quota_zh": "[EN] 本月新人加成名額已用罄 · 你目前處於 ",
    "tier_aplus_flywheel": "[EN] Tier A+ 飛輪複利區",
    "tier_aplus_flywheel_after": "[EN] ，每多一個高 NPS 案 → 推薦權重 +0.7%。"
  }

};
})(window);
