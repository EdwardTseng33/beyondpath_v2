/*
 * BeyondPath i18n - Chinese dictionary - v0.1
 * 對應 landing.html 全頁 user-facing 字串
 * key 命名: <section>.<element>_<purpose> snake_case
 *
 * Phase 1 Step 1 (2026-05-25) - i18n 框架 + landing demo
 * 載入順序: index.js -> dict.zh.js (本檔) -> dict.en.js -> LangSwitcher.jsx
 */
(function (g) {
  if (!g.BPi18n) g.BPi18n = { dicts: {} };
  if (!g.BPi18n.dicts) g.BPi18n.dicts = {};
  g.BPi18n.dicts.zh = {
  "meta": {
    "title": "BeyondPath · AI 時代的工作交付網路",
    "description": "BeyondPath 是 AI 時代的發案與接案產品，幫台灣品牌與中小企業把模糊需求變成可驗收交付，用 AI 初審、認證化供給與 milestone 交付降低不確定性。",
    "og_title": "BeyondPath · AI 時代的工作交付網路",
    "og_description": "幫台灣品牌與中小企業把模糊需求變成可驗收交付。AI 初審、認證化供給、Milestone 交付，降低不確定性。",
    "og_image_alt": "BeyondPath · AI 時代的工作交付網路"
  },
  "disc": {
    "top_label": "EARLY BETA · 邀請制",
    "top_body_before": "首批案件 BeyondPath 認證 worker 配對、24h 內系統回覆 · ",
    "top_link": "加入 waitlist →",
    "top_close_aria": "關閉提醒",
    "foot_text": "BeyondPath · Early Beta v0.8 · 2026-05-15 · 邀請制 · 平台品質審核中 · 律師合約完整版審視中 · ",
    "foot_privacy": "隱私權與服務條款",
    "foot_waitlist": "加入 waitlist →"
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
    "switch_aria": "切換語言",
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
    "mode_value": "AI 把關"
  },
  "poc": {
    "header_title": "◆ Q3 2026 啟動內測",
    "header_target": "PRIVATE BETA · ROADMAP",
    "row1_label": "合格供給端認證",
    "row1_sub": "Tier B / B+ · 樣本邀請名單收集中",
    "row1_stat": "啟動內測",
    "row2_label": "媒合付費交付專案",
    "row2_sub": "NPS ≥ 50 · 首批客戶名單建構中",
    "row2_stat": "啟動內測",
    "row3_label": "雙邊 NPS 評鑑",
    "row3_sub": "client + worker · 內測收集後啟用",
    "row3_stat": "Q3 2026"
  },
  "hero": {
    "eyebrow": "// AI ERA WORK NETWORK · 台灣 beta · 發案與接案雙邊認證",
    "headline_part1_before": "加入 ",
    "headline_part1_ai": "AI",
    "headline_part1_after": " 工作的下一個時代。",
    "headline_sub": "把不確定，變成可驗收的交付。",
    "pill_1": "把焦慮的需求，拆成範圍、交付物與驗收標準",
    "pill_2": "AI 初審適配領域、預算與候選方向",
    "pill_3": "用認證化供給與 milestone 降低交付不確定性",
    "blurb_before": "AI 讓每個人都像能交付，也讓發案與接案更焦慮：需求怎麼拆、能力怎麼判斷、成果怎麼驗收。BeyondPath 用 ",
    "blurb_bold": "AI 初審、認證化供給與 milestone 交付",
    "blurb_after": "，把模糊需求變成一套可被信任的 AI 工作流程。",
    "trust_label": "next work network · AI review · verified supply",
    "cta_primary_main": "我想進入 AI 發案流程 →",
    "cta_primary_sub": "留下需求 · 24 小時內初步回覆",
    "cta_secondary_main": "我想加入 AI 接案網路 →",
    "cta_secondary_sub": "提交作品與 AI workflow",
    "cta_demo": "先看通過後的 Worker Console →",
    "stream_label": "◆ AGENT // STREAM",
    "stream_meta": "tok/s · 38",
    "legend_before": "▸ ",
    "legend_spec": "SPEC",
    "legend_spec_after": " = 平台設計標準 · ship 後驗收門檻   ·   ",
    "legend_live": "LIVE",
    "legend_live_after": " = 即時數據",
    "tel_focus_label": "BETA FOCUS",
    "tel_focus_value": "SMB",
    "tel_review_label": "REVIEW TIME",
    "tel_review_value": "24h",
    "tel_project_label": "FIRST PROJECT",
    "tel_project_value": "50K+"
  },
  "usecases": {
    "eyebrow": "◆ BETA USE CASES · 第一批最適合發的案子",
    "headline_part1": "不要先買更多工具。",
    "headline_part2_before": "先把下一個",
    "headline_part2_em": "AI 專案",
    "headline_part2_after": "交付出來。",
    "intro": "BeyondPath beta 先收「範圍清楚、交付可驗收、用 AI 能明顯加速」的交付專案。你不用先懂工具，只要知道你希望交出什麼結果。",
    "label_budget": "BUDGET",
    "label_timeline": "TIMELINE",
    "cases": [
      {
        "who": "DTC 品牌 / 電商品牌",
        "job": "AI 內容產線與商品頁素材",
        "deliver": "短影音腳本、社群素材、EDM、商品頁文案",
        "budget": "NT$50K-100K",
        "time": "2-6 週"
      },
      {
        "who": "設計工作室 / 品牌團隊",
        "job": "品牌 DNA × AI 視覺系統",
        "deliver": "視覺模板、Prompt spec、素材規格、交付檢核表",
        "budget": "NT$60K-120K",
        "time": "3-8 週"
      },
      {
        "who": "中小企業 / 小型營運團隊",
        "job": "官網改版與內部流程自動化",
        "deliver": "Landing page、客服 FAQ、自動化表單與 SOP",
        "budget": "NT$50K-150K",
        "time": "3-8 週"
      },
      {
        "who": "B2B SaaS / 顧問型服務",
        "job": "GTM 內容與銷售素材",
        "deliver": "Sales deck、demo script、案例頁、名單整理流程",
        "budget": "NT$50K-120K",
        "time": "2-6 週"
      }
    ]
  },
  "story": {
    "label": "◆ 為什麼是 BeyondPath",
    "headline_part1": "AI 讓每個人都像專家。",
    "headline_part2": "也讓你更難知道誰真的能交付。",
    "client_eyebrow": "▸ 如果你是品牌主",
    "client_pain": "你的痛 · 你不是沒有預算，也不是不想導 AI。你只是怕錢花下去，最後還是自己在教、在改、在收拾。",
    "client_get_label": "你來 BeyondPath 拿到 →",
    "client_pt1_bold": "① 先用首案驗證合作",
    "client_pt1_body": " · 先從 ",
    "client_pt1_em": "NT$ 50-100K",
    "client_pt1_tail": " 交付專案開始，不需要一次簽長約。",
    "client_pt2_bold": "② 少管理不確定性",
    "client_pt2_body": " · 留下需求、",
    "client_pt2_em": "24 小時",
    "client_pt2_tail": "先知道候選方向與下一步，不用自己發 30 封訊息。",
    "client_pt3_bold": "③ AI 先幫你判斷",
    "client_pt3_tail": " · POC 階段先由 AI 拆範圍、看候選方向，再由人工覆核交付條件。",
    "client_pt4_bold": "④ 交付可驗收",
    "client_pt4_tail": " · 每案先定 milestone 與交付標準，避免「做了很多但不知道算不算完成」。",
    "client_replace": "▸ 取代「朋友介紹 + 月費代理 + Fiverr」",
    "worker_eyebrow": "▸ 如果你是接案者",
    "worker_pain": "你的痛 · 你已經能用 AI 做出成果，但市場還是把你拿去跟普通接案者比價。客戶看不到你的 workflow、判斷力與交付品質。",
    "worker_get_label": "你來 BeyondPath 拿到 →",
    "worker_pt1_bold": "① 進入首案池",
    "worker_pt1_tail": " · 通過認證後進入 beta 候選名單，第一批案件優先從名單媒合。",
    "worker_pt2_bold": "② 不靠低價比稿",
    "worker_pt2_tail": " · beta 前期逐案確認報價與分潤，先讓好交付被看見，而不是比誰便宜。",
    "worker_pt3_bold": "③ 讓客戶看懂你貴在哪",
    "worker_pt3_tail": " · 案例、工具流、交付品質會被整理成 Tier 證據。",
    "worker_pt4_bold": "④ 累積下一案的信任",
    "worker_pt4_tail": " · 每次結案評價都會累積成下一次推薦理由，而不是每次從零開始。",
    "worker_replace": "▸ 取代「跑案 + 比稿 + 接不到案」",
    "bottom_para_bold": "這不是在加入另一個接案平台。",
    "bottom_para_after": " 這是在加入一套 AI 時代的工作交付規則：AI 初審、公平化評分、認證化供給、可驗收交付。",
    "bottom_cta_client": "我想進入 AI 發案流程 →",
    "bottom_cta_worker": "我想加入 AI 接案網路 →",
    "bottom_cta_demo": "先看 Worker Console →"
  },
  "problem": {
    "eyebrow": "◆ THE ANXIETY · AI 時代真正放大的不是工具，是不確定性",
    "headline_part1": "AI 讓機會變多，",
    "headline_part2_before": "也讓",
    "headline_part2_em": "判斷成本",
    "headline_part2_after": "爆炸。",
    "intro": "發案方怕找錯人、押錯案、看不懂成果；接案方怕好能力被拿去跟低價模板比較。BeyondPath 要處理的不是工具缺口，而是 AI 工作網路裡的焦慮、不安與不確定性。",
    "fix_label": "→ BeyondPath 怎麼把它變成秩序",
    "items": [
      {
        "lbl": "ANXIETY 1 · 發案方",
        "title": "不知道誰真的能交付",
        "pain": "每個人都說自己會 AI，但你不知道他是會 demo、會做圖，還是真的能把成果交出來。",
        "fix": "BeyondPath: 用 AI 初審、作品證據與候選理由，先把能力翻譯成可判斷的交付風險。"
      },
      {
        "lbl": "ANXIETY 2 · 接案方",
        "title": "不知道自己如何被看見",
        "pain": "你已經有 AI workflow，但市場還是把你放回低價比稿與人脈介紹裡。",
        "fix": "BeyondPath: 把作品、工具流、交付品質整理成認證化證據，讓好能力有更公平的入口。"
      },
      {
        "lbl": "ANXIETY 3 · 雙邊",
        "title": "不知道什麼算完成",
        "pain": "AI 專案最可怕的不是開始，而是做了很多、改了很久，最後沒有人說得清楚算不算交付。",
        "fix": "BeyondPath: 開案前先拆 milestone、交付物與驗收標準，讓合作從第一天就有共同規則。"
      }
    ]
  },
  "engines": {
    "eyebrow": "◆ HOW IT WORKS · 從模糊需求到可驗收交付",
    "headline_part1": "你只需要說結果。",
    "headline_part2": "我們把它變成可開案、可配對、可驗收。",
    "protocol_label": "◆ 12 步協定 · 4 階段",
    "items": [
      {
        "n": "01",
        "en": "AI BRIEF PARSER",
        "zh": "Brief 拆解引擎",
        "d": "把一段中文需求拆成目標、交付物、時程、預算與驗收點。POC 階段會先由團隊覆核。",
        "you": "你因此 → 不用先會寫專業 brief，也能把案子說清楚"
      },
      {
        "n": "02",
        "en": "TIER MATCH ENGINE",
        "zh": "Tier 配對引擎",
        "d": "根據領域、作品、工具流與交付經驗推薦 Top 3，並附上為什麼適合。",
        "you": "你因此 → 不發 30 封信，24 小時內先知道該找哪類人",
        "static_label": "MATCH · TIER A+ / A / B"
      },
      {
        "n": "03",
        "en": "SCOPE + MILESTONE",
        "zh": "範圍 × 驗收點",
        "d": "POC 階段先確認交付物、時間、風險與驗收標準；付款與合約先由雙方自行處理。",
        "you": "你因此 → 開案前先知道什麼算完成，不會把合作押在口頭共識上"
      },
      {
        "n": "04",
        "en": "PROJECT DASHBOARD",
        "zh": "案件儀表板",
        "d": "把進度、版本、交付物與待確認事項集中，避免案子散在 email、LINE 與雲端檔案裡。",
        "you": "你因此 → 知道現在卡在哪，不用一直追問",
        "static_label": "MILESTONE · AUDIT-READY"
      },
      {
        "n": "05",
        "en": "NPS FLYWHEEL",
        "zh": "NPS 雙邊飛輪",
        "d": "每次結案都留下客戶回饋、交付品質與合作紀錄，逐步形成推薦權重。",
        "you": "你因此 → 好的工作者會被看見，不只靠人脈與聲量",
        "static_label": "ANTI-MATTHEW · 5-DIM NPS"
      },
      {
        "n": "06",
        "en": "RETAINER ENGINE",
        "zh": "Retainer 引擎",
        "d": "如果第一案合作順利，再把一次性需求整理成可續作的月度合作提案。",
        "you": "你因此 → 合作好的人可以接著做，不用每次重新找人",
        "static_label": "AUTO-PROPOSAL · MONTHLY"
      }
    ],
    "stages": [
      {
        "i": "I",
        "zh": "進案",
        "en": "INTAKE",
        "steps": "01 選領域 · 02 上傳 brief · 03 確認期待"
      },
      {
        "i": "II",
        "zh": "配對",
        "en": "MATCH",
        "steps": "04 AI 配對 · 05 接案"
      },
      {
        "i": "III",
        "zh": "執行",
        "en": "EXECUTE",
        "steps": "06 範圍確認 · 07 milestone · 08 案件儀表 · 09 交付驗收"
      },
      {
        "i": "IV",
        "zh": "複利",
        "en": "COMPOUND",
        "steps": "10 雙邊 NPS · 11 Tier 飛輪 · 12 retainer 提案"
      }
    ]
  },
  "trust3": {
    "eyebrow": "◆ TRUST · AI-first，但不把人丟進黑箱",
    "headline_part1": "先用 AI 降低不確定性，",
    "headline_part2_before": "再用覆核與驗收建立",
    "headline_part2_em": "信任層",
    "headline_part2_after": "。",
    "items": [
      {
        "v": "AI",
        "en": "AI REVIEW",
        "zh": "AI 初審 + 人工覆核",
        "facts": [
          "先由 AI 拆 brief 與交付範圍",
          "再由人工覆核候選人與風險",
          "不讓你直接丟進平台黑箱"
        ]
      },
      {
        "v": "24h",
        "en": "MATCH DIRECTION",
        "zh": "先給候選方向",
        "facts": [
          "初判領域與預算是否合理",
          "中文 brief 原生理解",
          "先看適配，再談短名單"
        ]
      },
      {
        "v": "M1",
        "en": "MILESTONE",
        "zh": "每案先定驗收點",
        "facts": [
          "交付物、時間、風險先講清楚",
          "付款與合約先由雙方自行處理",
          "避免做完才爭論算不算完成"
        ]
      }
    ]
  },
  "moat": {
    "eyebrow": "◆ WHY BEYONDPATH · 當 LLM 也會媒合，我們還剩什麼",
    "headline_part1": "LLM 可以推薦人。",
    "headline_part2_before": "但信任來自",
    "headline_part2_em": "交付證據",
    "headline_part2_after": "。",
    "intro": "BeyondPath 不把不可取代性押在「比 AI 更會配對」。我們真正要建立的是 AI 工作的信任資料層：誰能把哪一類需求交付出來、用了什麼 workflow、結果如何被驗收、下次為什麼值得被推薦。",
    "items": [
      {
        "axis": "LLM 可以做",
        "ttl": "推薦看起來適合的人",
        "body": "未來任何 LLM 都能讀 brief、生成候選名單、比較作品集。這會變成基本能力，不是護城河。",
        "peer": "▸ 名單會越來越便宜"
      },
      {
        "axis": "BeyondPath 累積",
        "ttl": "誰真的交付過，以及怎麼交付",
        "body": "我們把 AI workflow、交付物、驗收紀錄、雙邊 NPS 與適配情境留下來，讓下一次推薦不是猜測，而是基於交付證據。",
        "peer": "▸ 信任會越用越厚"
      },
      {
        "axis": "不可取代性",
        "ttl": "不是媒合演算法，而是 AI 工作信任資料",
        "body": "真正稀缺的是台灣語境下的 brief、產業需求、worker workflow proof、交付品質與合作紀錄。這些資料會形成 BeyondPath 的推薦權重與認證規則。",
        "peer": "▸ 從找人，變成工作信任層"
      }
    ]
  },
  "cases": {
    "eyebrow": "◆ CASE STUDIES · 真實案件實錄",
    "headline_part1": "看 BeyondPath 怎麼",
    "headline_em": "真的在跑",
    "headline_part2": "。",
    "intro_before": "3 個 case 為 BeyondPath 早期合作案例樣本（DTC 領域）——展示 brief → 配對 → 交付 → 驗收紀錄的真實樣態。",
    "intro_paren_before": "（其他 14 領域案例累積中 · 想看你領域範例請",
    "intro_paren_link": "填 brief",
    "intro_paren_after": "、實際配對方案 24h 內 email）",
    "label_brief": "① BRIEF · 需求",
    "label_match": "② MATCH · 配對",
    "label_deliver": "③ DELIVER · 交付",
    "label_accept": "④ ACCEPT · 驗收",
    "label_result": "⑤ RESULT · ",
    "footer_before": "▸ 想看更多？",
    "footer_link": "寫信給 BeyondPath 拿工作樣品包",
    "items": [
      {
        "brand": "LUMINE",
        "sector": "DTC 保養品",
        "brief": "9 月底上新「夜修護」3 SKU、需要 2 版主視覺 KV + 6 支 IG Reels 腳本 + 3 篇官網 + EDM 文案、排程到 Meta + LINE。",
        "matched": "Tier A+ 領域專家 · Visual KV + Brand DNA × AI · 配對分數 92 / 100",
        "delivered": "2 KV × 4 alts each · 4 週交付 · NPS 4.94 / 5",
        "proof": "交付證據：brief、版本紀錄、驗收清單、NPS 4.94 / 5",
        "state": "進入 retainer · 持續 Q1 2027 上新檔",
        "badge": "已結案 · NPS 4.94"
      },
      {
        "brand": "HANA 香氛",
        "sector": "spring restage",
        "brief": "新香 line 2 個 SKU 春季視覺重新整理、4 週內交 2 版 KV + 8 個 social asset。",
        "matched": "同一位 Tier A+ 領域專家（已跑 LUMINE retainer）· capacity 75% · 平台優先推薦",
        "delivered": "2 KV × 4 alts · wk 2 / 4 · 進度 50%",
        "proof": "交付證據：wk 2 版本上傳、mid review 已完成 2/4",
        "state": "● 進行中 · ON TRACK",
        "badge": "進行中 · WK 2 / 4"
      },
      {
        "brand": "Plant by Plant",
        "sector": "包裝設計",
        "brief": "植物保養 line 包裝重設、6 週內交 brand DNA spec + 6 個 SKU packaging dieline。",
        "matched": "Tier A+ Brand DNA × AI 領域 · 配對分數 88 / 100",
        "delivered": "6 SKU dieline · brand spec 32 頁 · final review 階段",
        "proof": "交付證據：6 SKU dieline、brand spec 32 頁、final review",
        "state": "● final review · WK 6 / 6",
        "badge": "WK 6 / 6 · FINAL REVIEW"
      }
    ]
  },
  "tier": {
    "eyebrow": "◆ TIER · 5 階認證 · 升降基於 NPS",
    "headline_part1": "Tier 不是裝飾 · ",
    "headline_em": "是推薦排序權重",
    "headline_part2": "。",
    "intro": "Tier 升降基於結案 NPS、領域認證、客戶推薦 + 反馬太 +10（3 個月內無接案保留 slot）。worker 看得到「升級還差什麼」、client 看得到「這個 worker 為什麼貴」。",
    "typical_label": "typical",
    "day1_label_part1": "▸ DAY 1",
    "day1_label_part2": "路徑",
    "day1_body_main": "通過認證 → 進入 beta 首案候選池 → 第一批案件優先從認證名單裡媒合。",
    "day1_body_sub": "我們先把案例、工具流與交付品質整理成客戶看得懂的證據，再逐步累積 NPS 與推薦權重。",
    "items": [
      {
        "id": "S",
        "zh": "典範",
        "sub": "PARAGON · 跨領域 5+ · NPS ≥ 4.7",
        "stat": "10+ cases · NT$ 400K+"
      },
      {
        "id": "A+",
        "zh": "領域專家",
        "sub": "MASTER · 30+ 案 · 領域 NPS ≥ 4.5",
        "stat": "30+ cases · NT$ 220K"
      },
      {
        "id": "A",
        "zh": "資深",
        "sub": "PRO · 30+ 案 · 客戶推薦 ≥ 3",
        "stat": "30+ cases · NT$ 145K"
      },
      {
        "id": "B",
        "zh": "認證入門",
        "sub": "ENTRY · 通過 4 階段認證",
        "stat": "5-30 cases · NT$ 78K"
      },
      {
        "id": "C",
        "zh": "受訓",
        "sub": "TRAINEE · 申請中 / 補件",
        "stat": "0-5 cases · —"
      }
    ]
  },
  "network": {
    "eyebrow": "◆ NETWORK · 15 領域、24 小時初步判斷",
    "headline_part1": "15 個 ",
    "headline_em": "領域",
    "headline_part2": "，先判斷該找哪一種人。",
    "footer": "▸ HOT VERTICALS · +47% MoM growth · DTC + AI Agent",
    "hot_tag": "HOT",
    "verticals": [
      "DTC 內容自動化",
      "設計品牌 × AI",
      "短影音 · 剪輯",
      "網頁設計 + 切版",
      "客製軟體開發",
      "客製系統建置",
      "AI Agent · Bot",
      "數據 · BI",
      "B2B SaaS GTM",
      "品牌市場調研",
      "行銷服務操盤",
      "SEO · 內容營運",
      "客服自動化",
      "翻譯 · 在地化",
      "其他"
    ]
  },
  "services": {
    "eyebrow": "◆ SERVICES · 目前可接案 + 價格 reference",
    "headline_part1": "4 個主要交付類型、",
    "headline_em": "每案有適配 Tier 與預算 reference",
    "headline_part2": "。",
    "intro": "以下價格區間是 reference、不是固定報價。實際依需求複雜度、交付物範圍、時程而定。送出 brief 後、24h 內你會收到含建議預算的配對方案。",
    "label_range": "RANGE",
    "data_label": "◆ DATA HANDLING · 你的資料怎麼處理",
    "data_body_before": "送出的 brief / email / portfolio 進 BeyondPath 後台、僅平台團隊 + AI 初審工具看得到、不公開、不轉售。資料保留期視業務需要而定（用於未來案件配對與 retainer 邀請）、可隨時寄信到 ",
    "data_body_link": "hello@beyondpath.tw",
    "data_body_after": " 要求刪除你的資料。",
    "data_cta": "查看完整隱私政策 →",
    "items": [
      {
        "n": "01",
        "en": "AI WORKFLOW",
        "zh": "AI workflow 顧問 + 落地",
        "desc": "從需求拆解到工具流 setup、含 handoff 文件。常見：客服自動化、內容 pipeline、內部 agent。",
        "tiers": "Tier B+ / A+",
        "range": "NT$ 15-80 萬"
      },
      {
        "n": "02",
        "en": "BRAND CONTENT",
        "zh": "DTC 品牌內容",
        "desc": "視覺 KV、brand DNA、社群內容操盤。常見：保養品 / 食品 / 設計品牌 launch + 持續經營。",
        "tiers": "Tier B / B+ / A+",
        "range": "NT$ 5-60 萬"
      },
      {
        "n": "03",
        "en": "REELS · VIDEO",
        "zh": "短影音 + reels",
        "desc": "腳本 + 拍攝 + 剪輯 一條龍。常見：品牌敘事、UGC 風格、產品 demo、教學影片。",
        "tiers": "Tier B / B+",
        "range": "NT$ 3-25 萬"
      },
      {
        "n": "04",
        "en": "CUSTOM DEV",
        "zh": "客製軟體 / AI agent / 工具流",
        "desc": "從 prototype 到 production：API 整合、bot、內部工具。常見：Slack agent、CRM 自動化、Make/n8n flow。",
        "tiers": "Tier B+ / A+",
        "range": "NT$ 10-120 萬"
      }
    ]
  },
  "faq": {
    "eyebrow": "◆ FAQ · 你可能會問的",
    "headline_part1": "七個 ",
    "headline_em": "真問題",
    "headline_part2": "。",
    "intro_before": "前 4 條給準備發案的你、後 3 條給準備接案的你。沒答到的、寫信給 BeyondPath → ",
    "intro_email": "edwardt0303@gmail.com",
    "items": [
      {
        "n": "01",
        "tag": "發案者",
        "q": "我已經有合作的接案者 / 設計師了，為什麼要換 BeyondPath？",
        "a": "你不用換、你可以平行用。BeyondPath 解的是「現有人脈池外、突然要新類型 AI 交付」這個場景——例如你平常合作的設計師不會剪短影音、你又不想為了一支 reels 重新發 30 封 brief。留下需求後，24 小時內先得到適配領域、預算與候選方向；進入短名單後再看 Top 3 配對與理由。首案合不合適你自己判斷、平台不綁約、不收訂閱。"
      },
      {
        "n": "02",
        "tag": "發案者",
        "q": "做不出來 / 品質不對怎麼辦？",
        "a": "POC 階段先不把你丟進全自動黑箱。我們會先用 AI 拆需求、判斷領域與風險，再由人工覆核 milestone、交付標準與候選人。早期不做平台代收代付；付款與合約由雙方自行處理。BeyondPath 先把需求、候選人與驗收紀錄跑穩。"
      },
      {
        "n": "03",
        "tag": "發案者",
        "q": "如果 LLM 以後也能媒合人選，BeyondPath 還必要嗎？",
        "a": "如果只是推薦名單，確實會被 LLM 商品化。BeyondPath 要累積的是 LLM 很難直接擁有的交付信任資料：worker 的 AI workflow、真實交付物、驗收紀錄、雙邊 NPS、適合的產業情境與失敗風險。名單只是起點，真正有價值的是「這個人為什麼值得被信任」的證據。"
      },
      {
        "n": "04",
        "tag": "發案者",
        "q": "這個比 Fiverr 貴 / 比工作室便宜嗎？怎麼定價？",
        "a": "我們在 Fiverr 跟月費代理之間。早期會先測試需求診斷、候選短名單、認證服務或媒合服務費等模式，不在平台上代收專案款。你付費買的不是名單，而是需求拆解、候選理由、驗收框架與降低找錯人的判斷成本。"
      },
      {
        "n": "05",
        "tag": "接案者",
        "q": "我想接案、要怎麼申請？真的通過率 < 10%？",
        "a": "兩段式：Stage 1（Tier B 入會、AI 初評 + 簡易驗證）目前約 28% 通過、Stage 2（Tier A 正式認證）才是 < 10%。完整 4 階段認證：（1）技能測驗——你的領域基本功、（2）同儕 review——已認證 worker 評分、（3）客戶模擬案件——平台給一個假需求、你交一份成果、（4）主審委員會——通過前三關才進。整個流程約 2-3 週。沒過可以 6 個月後重申、平台會給回饋說明哪裡需要補強。"
      },
      {
        "n": "06",
        "tag": "接案者",
        "q": "平台怎麼收費？我需要先付費嗎？",
        "a": "beta 前期先不在平台上代收專案款，也不做抽佣承諾。BeyondPath 會先測試需求診斷、候選短名單、認證服務或媒合服務費等模式；目前你申請認證不用付費，也不需要先承諾排他。"
      },
      {
        "n": "07",
        "tag": "接案者",
        "q": "如果一段時間沒接到案、平台會幫忙嗎？",
        "a": "會。我們有「反馬太 +10」機制——3 個月內無接案的 worker、配對排序自動 +10 加權；新認證 < 30 天 +5；首案池保留 20% slot 給新人。前提是你已通過 < 10% 認證——這不是降門檻、是讓已被驗證的人有持續接案機會。同時 AI 教練會主動提示「升 Tier 還差什麼」「哪些領域最近需求高」。"
      }
    ]
  },
  "finalcta": {
    "roadmap_label": "◆ ROADMAP · 在你按下排隊前 · 我們的進度",
    "eyebrow": "◆ JOIN · PRIVATE BETA",
    "headline": "加入第一批 AI 工作網路。",
    "blurb": "第一批 beta 先用 AI 初審與人工覆核並行。發案方可以留下需求，把不確定的 AI 專案拆成可驗收流程；接案者可以提交作品與 AI workflow，讓能力被認證、被理解、被推薦。",
    "cta_client_main": "我想進入 AI 發案流程 →",
    "cta_client_sub": "發案方",
    "cta_worker_main": "我想加入 AI 接案網路 →",
    "cta_worker_sub": "接案者",
    "cta_demo": "先看 Worker Console demo →",
    "cta_waitlist_main": "加入 Beta waitlist →",
    "cta_waitlist_sub": "手動覆核",
    "meta_left": "EARLY BETA",
    "meta_right": "送出進人工審核 · 不代表正式合約或付款"
  },
  "footer": {
    "brand_tag": "台灣 beta 先從 AI 內容、網站、自動化與 GTM 交付開始。用 brief、候選人、milestone，把找人與交付風險降下來。",
    "col_product": "PRODUCT",
    "col_network": "NETWORK",
    "col_company": "COMPANY",
    "col_legal": "LEGAL",
    "link_protocol": "流程協定 · 12 步",
    "link_engines": "核心引擎 · 6",
    "link_tier": "Tier 飛輪",
    "link_trust": "信任機制",
    "link_why": "WHY BEYONDPATH",
    "link_client_apply": "客戶申請",
    "link_expert_apply": "Expert 申請",
    "link_15verticals": "15 領域總覽",
    "link_master_wall": "A+ 大師牆 · 即將上線",
    "link_retainer": "Retainer Plans · 即將上線",
    "link_about": "關於 BeyondPath",
    "link_feedback": "合作回饋 · 即將上線",
    "link_join_us": "加入我們",
    "link_contact_email": "edwardt0303@gmail.com",
    "link_terms": "Terms · 即將上線",
    "link_privacy": "Privacy · 即將上線",
    "link_acceptance": "驗收規則",
    "link_dispute": "爭議紀錄流程",
    "link_security": "資安白皮書 · v0.4 · 即將上線",
    "copyright": "© 2026 BEYONDPATH NETWORK",
    "cities": "TAIPEI × SINGAPORE × TOKYO · Y1->Y3",
    "version_status": "v0.5β · LIVE · BETA COHORT OPEN"
  },
  "banner": {
    "label": "◆ WORKER DECISION",
    "ok_title": "已接受配對邀請",
    "ok_body": "BeyondPath 24-72 小時內準備合約草稿與案件初始 milestone、寄到你的 email。客戶端也會收到「worker 已確認接案」通知。若 72 小時無收信、請聯絡 hello@beyondpath.tw。",
    "decline_title": "已記錄你婉拒這次配對",
    "decline_body": "謝謝告知。下次有適配案件、BeyondPath 仍會優先推薦。",
    "error_title": "配對連結已過期或無效",
    "error_body": "邀請信連結有 7 天效期。請聯絡 BeyondPath：hello@beyondpath.tw",
    "default_title": "感謝你的回應",
    "default_body": "若有疑問請聯絡 BeyondPath：hello@beyondpath.tw",
    "close_aria": "關閉"
  },
  "misc": {
    "back_to_top": "回到頂部",
    "engines_ahead": "/* engines ahead · 6 個摩擦點、一個一個拆 */"
  },
  "waitlist": {
    "meta_title": "加入 Waitlist · BeyondPath",
    "meta_description": "加入 BeyondPath waitlist。Prototype 階段不會自動收集個資，請寄信給 Edward 或複製 email 手動聯繫。",
    "top_back": "BACK TO LANDING",
    "eyebrow": "◆ JOIN WAITLIST · PROTOTYPE STAGE",
    "h1": "想收到 BeyondPath beta 進度，先寄信給 Edward。",
    "sub": "目前 prototype 還沒有正式表單後端，不會自動收集或儲存你的個資。你可以用 email 告訴我你是發案方、接案者，或只是想追蹤產品進度。",
    "note_label": "建議信件內容：",
    "note_body": "你的名字、角色、想看的方向、是否願意參與第一批 beta 試做。",
    "manual_label": "manual recipient",
    "btn_copy": "複製 EMAIL",
    "btn_copy_done": "已複製",
    "role_client_title": "發案方",
    "role_client_sub": "CLIENT · WANT PILOT",
    "role_worker_title": "接案者",
    "role_worker_sub": "WORKER · WANT CERT",
    "role_follow_title": "追蹤進度",
    "role_follow_sub": "FOLLOW · PRODUCT UPDATES",
    "btn_email_draft": "開啟 waitlist email 草稿 →",
    "btn_back": "回產品頁",
    "footer": "BeyondPath · Prototype v0.2 · waitlist uses manual email until a privacy-reviewed form backend is ready."
  },
  "admin": {
    "label_skill_matrix_title": "◆ Skill Matrix · 6 維 (1-10)",
    "label_skill_workflow": "Workflow",
    "label_skill_tools": "Tools",
    "label_skill_judgment": "Judgment",
    "label_skill_domain": "Domain",
    "label_skill_comm": "Comm",
    "label_skill_delivery": "Delivery",
    "label_audit_flags_title": "◆ Audit Flags · 訪談證據偵測",
    "label_ai_proof_raw": "◆ ai_proof (raw)",
    "label_unified_card": "◆ unified_card",
    "label_unified_card_empty": "(尚未產生 unified_card · 訪談未完成或 mapping fail)",
    "card_label_applied": "申請",
    "card_label_submitted": "送出",
    "card_label_sent_time": "寄出時間",
    "card_label_decided_time": "決定時間",
    "placeholder_admin_notes": "admin_notes (optional · 內部備註、不對外)",
    "placeholder_worker_msg": "給 worker 的訊息 (optional · 會放進 email 內容)",
    "btn_processing": "處理中…",
    "btn_approve": "✓ Approve (進 worker pool)",
    "btn_reject": "✗ Reject",
    "btn_archive": "Archive",
    "btn_collapse": "收起",
    "btn_expand_raw": "展開原始資料",
    "btn_expand": "展開",
    "btn_run_match": "◆ 跑 AI 配對（match-workers）",
    "btn_sending": "寄信中…",
    "btn_send_invites": "✉ 寄邀請信給選中的 worker",
    "btn_rerun_match": "重新跑配對",
    "btn_save_weights": "儲存權重",
    "btn_reset_default": "回 default",
    "err_select_one_worker": "至少選 1 位 worker 邀請",
    "msg_matching": "跑配對演算法中…",
    "msg_match_failed_prefix": "配對失敗：",
    "msg_match_failed_suffix": "（可能 match-workers Edge Function 還沒部署、或 worker pool 該 vertical 沒人）",
    "msg_send_failed_prefix": "寄信失敗：",
    "msg_send_ok_prefix": "✓ 已寄出 ",
    "msg_send_ok_suffix": " 封邀請信",
    "label_top_match_prefix": "◆ TOP ",
    "label_top_match_suffix": " MATCH 候選",
    "label_invite": "邀請",
    "label_load_decisions": "載入決定紀錄中…",
    "msg_load_decisions_failed_prefix": "載入失敗：",
    "msg_load_decisions_failed_suffix": "（可能 worker_decisions table 還沒建）",
    "msg_no_decisions": "尚無配對決定紀錄",
    "err_save_failed": "儲存失敗",
    "err_reset_failed": "重置失敗",
    "weight_tier_label": "Tier 對位",
    "weight_tier_hint": "client required_tier 跟 worker 當前 Tier 的吻合度",
    "weight_capacity_label": "容量",
    "weight_capacity_hint": "worker 當前接案餘力 · timeline rush 加權",
    "weight_domain_label": "領域吻合",
    "weight_domain_hint": "client.vertical 跟 worker.verticals 主／鄰近 + 任務 → skill_matrix 對應",
    "weight_lscore_label": "L-score",
    "weight_lscore_hint": "worker 自評 AI 使用 leverage 程度 0-10",
    "weight_mercy_label": "反馬太效應",
    "weight_mercy_hint": "> 90 天沒接案的 worker 補一個 boost · 防新人凍結",
    "settings_title": "5 維配對權重",
    "settings_sub": "改完按「儲存」、下次 runMatch 自動帶 · 儲存在你瀏覽器 localStorage",
    "settings_sum_label": "Sum",
    "settings_sum_hint": "sum 100 = 平衡配置（每維權重 / 100 = 影響力百分比）· 大於 100 等於相對放大、小於 100 等於相對縮小。",
    "settings_default_hint": "目前 default：tier 25 / capacity 20 / domain 30 / L_score 15 / mercy 10 = 100",
    "settings_saved_msg": "✓ 已儲存 · 下次配對自動帶這組權重",
    "tab_pending_workers": "Pending Workers",
    "tab_client_intakes": "Client Intakes",
    "tab_decisions_history": "Decisions History",
    "tab_settings": "⚙ Settings",
    "err_action_prefix": "操作失敗：",
    "msg_loading_workers": "載入 worker 名單中…",
    "msg_load_workers_failed_prefix": "載入失敗：",
    "msg_no_pending_workers": "目前沒有 pending / tier_b / tier_b_plus 的 worker",
    "msg_loading_intakes": "載入 client intake 中…",
    "msg_load_intakes_failed_prefix": "載入失敗：",
    "msg_no_intakes": "目前沒有 new / reviewing 的 client intake",
    "title_admin": "Admin Console",
    "meta_internal": "POC · INTERNAL ONLY · v0.1"
  }

};
})(window);
