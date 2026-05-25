/*
 * BeyondPath i18n - English dictionary - v0.1 PLACEHOLDER
 * 對應 dict.zh.js · 結構 1:1 對應
 *
 * Phase 1 Step 1 (2026-05-25) - i18n 框架 demo · 全部英文文案待蘇菲 (Sophie) 接手
 * 規則:
 *   - 含中文 (CJK) 的字串自動加上 "[EN] " prefix · 蘇菲填英文時把整個 value 換掉
 *   - 純英文/code/brand label (例: PRODUCT, NETWORK, v0.5β) 保持原樣不動
 *   - 結構不可改 (key 名跟 dict.zh.js 完全一致 · t() helper 才不會找不到)
 *
 * 載入順序: index.js -> dict.zh.js -> dict.en.js (本檔) -> LangSwitcher.jsx
 */
(function (g) {
  if (!g.BPi18n) g.BPi18n = { dicts: {} };
  if (!g.BPi18n.dicts) g.BPi18n.dicts = {};
  g.BPi18n.dicts.en = {
  "meta": {
    "title": "[EN] BeyondPath · AI 時代的工作交付網路",
    "description": "[EN] BeyondPath 是 AI 時代的發案與接案產品，幫台灣品牌與中小企業把模糊需求變成可驗收交付，用 AI 初審、認證化供給與 milestone 交付降低不確定性。",
    "og_title": "[EN] BeyondPath · AI 時代的工作交付網路",
    "og_description": "[EN] 幫台灣品牌與中小企業把模糊需求變成可驗收交付。AI 初審、認證化供給、Milestone 交付，降低不確定性。",
    "og_image_alt": "[EN] BeyondPath · AI 時代的工作交付網路"
  },
  "disc": {
    "top_label": "[EN] EARLY BETA · 邀請制",
    "top_body_before": "[EN] 首批案件 BeyondPath 認證 worker 配對、24h 內系統回覆 · ",
    "top_link": "[EN] 加入 waitlist →",
    "top_close_aria": "[EN] 關閉提醒",
    "foot_text": "[EN] BeyondPath · Early Beta v0.8 · 2026-05-15 · 邀請制 · 平台品質審核中 · 律師合約完整版審視中 · ",
    "foot_privacy": "[EN] 隱私權與服務條款",
    "foot_waitlist": "[EN] 加入 waitlist →"
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
    "label_zh": "ZH",
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
    "mode_value": "[EN] AI 把關"
  },
  "poc": {
    "header_title": "[EN] ◆ Q3 2026 啟動內測",
    "header_target": "PRIVATE BETA · ROADMAP",
    "row1_label": "[EN] 合格供給端認證",
    "row1_sub": "[EN] Tier B / B+ · 樣本邀請名單收集中",
    "row1_stat": "[EN] 啟動內測",
    "row2_label": "[EN] 媒合付費交付專案",
    "row2_sub": "[EN] NPS ≥ 50 · 首批客戶名單建構中",
    "row2_stat": "[EN] 啟動內測",
    "row3_label": "[EN] 雙邊 NPS 評鑑",
    "row3_sub": "[EN] client + worker · 內測收集後啟用",
    "row3_stat": "Q3 2026"
  },
  "hero": {
    "eyebrow": "[EN] // AI ERA WORK NETWORK · 台灣 beta · 發案與接案雙邊認證",
    "headline_part1_before": "[EN] 加入 ",
    "headline_part1_ai": "AI",
    "headline_part1_after": "[EN]  工作的下一個時代。",
    "headline_sub": "[EN] 把不確定，變成可驗收的交付。",
    "pill_1": "[EN] 把焦慮的需求，拆成範圍、交付物與驗收標準",
    "pill_2": "[EN] AI 初審適配領域、預算與候選方向",
    "pill_3": "[EN] 用認證化供給與 milestone 降低交付不確定性",
    "blurb_before": "[EN] AI 讓每個人都像能交付，也讓發案與接案更焦慮：需求怎麼拆、能力怎麼判斷、成果怎麼驗收。BeyondPath 用 ",
    "blurb_bold": "[EN] AI 初審、認證化供給與 milestone 交付",
    "blurb_after": "[EN] ，把模糊需求變成一套可被信任的 AI 工作流程。",
    "trust_label": "next work network · AI review · verified supply",
    "cta_primary_main": "[EN] 我想進入 AI 發案流程 →",
    "cta_primary_sub": "[EN] 留下需求 · 24 小時內初步回覆",
    "cta_secondary_main": "[EN] 我想加入 AI 接案網路 →",
    "cta_secondary_sub": "[EN] 提交作品與 AI workflow",
    "cta_demo": "[EN] 先看通過後的 Worker Console →",
    "stream_label": "◆ AGENT // STREAM",
    "stream_meta": "tok/s · 38",
    "legend_before": "▸ ",
    "legend_spec": "SPEC",
    "legend_spec_after": "[EN]  = 平台設計標準 · ship 後驗收門檻   ·   ",
    "legend_live": "LIVE",
    "legend_live_after": "[EN]  = 即時數據",
    "tel_focus_label": "BETA FOCUS",
    "tel_focus_value": "SMB",
    "tel_review_label": "REVIEW TIME",
    "tel_review_value": "24h",
    "tel_project_label": "FIRST PROJECT",
    "tel_project_value": "50K+"
  },
  "usecases": {
    "eyebrow": "[EN] ◆ BETA USE CASES · 第一批最適合發的案子",
    "headline_part1": "[EN] 不要先買更多工具。",
    "headline_part2_before": "[EN] 先把下一個",
    "headline_part2_em": "[EN] AI 專案",
    "headline_part2_after": "[EN] 交付出來。",
    "intro": "[EN] BeyondPath beta 先收「範圍清楚、交付可驗收、用 AI 能明顯加速」的交付專案。你不用先懂工具，只要知道你希望交出什麼結果。",
    "label_budget": "BUDGET",
    "label_timeline": "TIMELINE",
    "cases": [
      {
        "who": "[EN] DTC 品牌 / 電商品牌",
        "job": "[EN] AI 內容產線與商品頁素材",
        "deliver": "[EN] 短影音腳本、社群素材、EDM、商品頁文案",
        "budget": "NT$50K-100K",
        "time": "[EN] 2-6 週"
      },
      {
        "who": "[EN] 設計工作室 / 品牌團隊",
        "job": "[EN] 品牌 DNA × AI 視覺系統",
        "deliver": "[EN] 視覺模板、Prompt spec、素材規格、交付檢核表",
        "budget": "NT$60K-120K",
        "time": "[EN] 3-8 週"
      },
      {
        "who": "[EN] 中小企業 / 小型營運團隊",
        "job": "[EN] 官網改版與內部流程自動化",
        "deliver": "[EN] Landing page、客服 FAQ、自動化表單與 SOP",
        "budget": "NT$50K-150K",
        "time": "[EN] 3-8 週"
      },
      {
        "who": "[EN] B2B SaaS / 顧問型服務",
        "job": "[EN] GTM 內容與銷售素材",
        "deliver": "[EN] Sales deck、demo script、案例頁、名單整理流程",
        "budget": "NT$50K-120K",
        "time": "[EN] 2-6 週"
      }
    ]
  },
  "story": {
    "label": "[EN] ◆ 為什麼是 BeyondPath",
    "headline_part1": "[EN] AI 讓每個人都像專家。",
    "headline_part2": "[EN] 也讓你更難知道誰真的能交付。",
    "client_eyebrow": "[EN] ▸ 如果你是品牌主",
    "client_pain": "[EN] 你的痛 · 你不是沒有預算，也不是不想導 AI。你只是怕錢花下去，最後還是自己在教、在改、在收拾。",
    "client_get_label": "[EN] 你來 BeyondPath 拿到 →",
    "client_pt1_bold": "[EN] ① 先用首案驗證合作",
    "client_pt1_body": "[EN]  · 先從 ",
    "client_pt1_em": "NT$ 50-100K",
    "client_pt1_tail": "[EN]  交付專案開始，不需要一次簽長約。",
    "client_pt2_bold": "[EN] ② 少管理不確定性",
    "client_pt2_body": "[EN]  · 留下需求、",
    "client_pt2_em": "[EN] 24 小時",
    "client_pt2_tail": "[EN] 先知道候選方向與下一步，不用自己發 30 封訊息。",
    "client_pt3_bold": "[EN] ③ AI 先幫你判斷",
    "client_pt3_tail": "[EN]  · POC 階段先由 AI 拆範圍、看候選方向，再由人工覆核交付條件。",
    "client_pt4_bold": "[EN] ④ 交付可驗收",
    "client_pt4_tail": "[EN]  · 每案先定 milestone 與交付標準，避免「做了很多但不知道算不算完成」。",
    "client_replace": "[EN] ▸ 取代「朋友介紹 + 月費代理 + Fiverr」",
    "worker_eyebrow": "[EN] ▸ 如果你是接案者",
    "worker_pain": "[EN] 你的痛 · 你已經能用 AI 做出成果，但市場還是把你拿去跟普通接案者比價。客戶看不到你的 workflow、判斷力與交付品質。",
    "worker_get_label": "[EN] 你來 BeyondPath 拿到 →",
    "worker_pt1_bold": "[EN] ① 進入首案池",
    "worker_pt1_tail": "[EN]  · 通過認證後進入 beta 候選名單，第一批案件優先從名單媒合。",
    "worker_pt2_bold": "[EN] ② 不靠低價比稿",
    "worker_pt2_tail": "[EN]  · beta 前期逐案確認報價與分潤，先讓好交付被看見，而不是比誰便宜。",
    "worker_pt3_bold": "[EN] ③ 讓客戶看懂你貴在哪",
    "worker_pt3_tail": "[EN]  · 案例、工具流、交付品質會被整理成 Tier 證據。",
    "worker_pt4_bold": "[EN] ④ 累積下一案的信任",
    "worker_pt4_tail": "[EN]  · 每次結案評價都會累積成下一次推薦理由，而不是每次從零開始。",
    "worker_replace": "[EN] ▸ 取代「跑案 + 比稿 + 接不到案」",
    "bottom_para_bold": "[EN] 這不是在加入另一個接案平台。",
    "bottom_para_after": "[EN]  這是在加入一套 AI 時代的工作交付規則：AI 初審、公平化評分、認證化供給、可驗收交付。",
    "bottom_cta_client": "[EN] 我想進入 AI 發案流程 →",
    "bottom_cta_worker": "[EN] 我想加入 AI 接案網路 →",
    "bottom_cta_demo": "[EN] 先看 Worker Console →"
  },
  "problem": {
    "eyebrow": "[EN] ◆ THE ANXIETY · AI 時代真正放大的不是工具，是不確定性",
    "headline_part1": "[EN] AI 讓機會變多，",
    "headline_part2_before": "[EN] 也讓",
    "headline_part2_em": "[EN] 判斷成本",
    "headline_part2_after": "[EN] 爆炸。",
    "intro": "[EN] 發案方怕找錯人、押錯案、看不懂成果；接案方怕好能力被拿去跟低價模板比較。BeyondPath 要處理的不是工具缺口，而是 AI 工作網路裡的焦慮、不安與不確定性。",
    "fix_label": "[EN] → BeyondPath 怎麼把它變成秩序",
    "items": [
      {
        "lbl": "[EN] ANXIETY 1 · 發案方",
        "title": "[EN] 不知道誰真的能交付",
        "pain": "[EN] 每個人都說自己會 AI，但你不知道他是會 demo、會做圖，還是真的能把成果交出來。",
        "fix": "[EN] BeyondPath: 用 AI 初審、作品證據與候選理由，先把能力翻譯成可判斷的交付風險。"
      },
      {
        "lbl": "[EN] ANXIETY 2 · 接案方",
        "title": "[EN] 不知道自己如何被看見",
        "pain": "[EN] 你已經有 AI workflow，但市場還是把你放回低價比稿與人脈介紹裡。",
        "fix": "[EN] BeyondPath: 把作品、工具流、交付品質整理成認證化證據，讓好能力有更公平的入口。"
      },
      {
        "lbl": "[EN] ANXIETY 3 · 雙邊",
        "title": "[EN] 不知道什麼算完成",
        "pain": "[EN] AI 專案最可怕的不是開始，而是做了很多、改了很久，最後沒有人說得清楚算不算交付。",
        "fix": "[EN] BeyondPath: 開案前先拆 milestone、交付物與驗收標準，讓合作從第一天就有共同規則。"
      }
    ]
  },
  "engines": {
    "eyebrow": "[EN] ◆ HOW IT WORKS · 從模糊需求到可驗收交付",
    "headline_part1": "[EN] 你只需要說結果。",
    "headline_part2": "[EN] 我們把它變成可開案、可配對、可驗收。",
    "protocol_label": "[EN] ◆ 12 步協定 · 4 階段",
    "items": [
      {
        "n": "01",
        "en": "AI BRIEF PARSER",
        "zh": "[EN] Brief 拆解引擎",
        "d": "[EN] 把一段中文需求拆成目標、交付物、時程、預算與驗收點。POC 階段會先由團隊覆核。",
        "you": "[EN] 你因此 → 不用先會寫專業 brief，也能把案子說清楚"
      },
      {
        "n": "02",
        "en": "TIER MATCH ENGINE",
        "zh": "[EN] Tier 配對引擎",
        "d": "[EN] 根據領域、作品、工具流與交付經驗推薦 Top 3，並附上為什麼適合。",
        "you": "[EN] 你因此 → 不發 30 封信，24 小時內先知道該找哪類人",
        "static_label": "MATCH · TIER A+ / A / B"
      },
      {
        "n": "03",
        "en": "SCOPE + MILESTONE",
        "zh": "[EN] 範圍 × 驗收點",
        "d": "[EN] POC 階段先確認交付物、時間、風險與驗收標準；付款與合約先由雙方自行處理。",
        "you": "[EN] 你因此 → 開案前先知道什麼算完成，不會把合作押在口頭共識上"
      },
      {
        "n": "04",
        "en": "PROJECT DASHBOARD",
        "zh": "[EN] 案件儀表板",
        "d": "[EN] 把進度、版本、交付物與待確認事項集中，避免案子散在 email、LINE 與雲端檔案裡。",
        "you": "[EN] 你因此 → 知道現在卡在哪，不用一直追問",
        "static_label": "MILESTONE · AUDIT-READY"
      },
      {
        "n": "05",
        "en": "NPS FLYWHEEL",
        "zh": "[EN] NPS 雙邊飛輪",
        "d": "[EN] 每次結案都留下客戶回饋、交付品質與合作紀錄，逐步形成推薦權重。",
        "you": "[EN] 你因此 → 好的工作者會被看見，不只靠人脈與聲量",
        "static_label": "ANTI-MATTHEW · 5-DIM NPS"
      },
      {
        "n": "06",
        "en": "RETAINER ENGINE",
        "zh": "[EN] Retainer 引擎",
        "d": "[EN] 如果第一案合作順利，再把一次性需求整理成可續作的月度合作提案。",
        "you": "[EN] 你因此 → 合作好的人可以接著做，不用每次重新找人",
        "static_label": "AUTO-PROPOSAL · MONTHLY"
      }
    ],
    "stages": [
      {
        "i": "I",
        "zh": "[EN] 進案",
        "en": "INTAKE",
        "steps": "[EN] 01 選領域 · 02 上傳 brief · 03 確認期待"
      },
      {
        "i": "II",
        "zh": "[EN] 配對",
        "en": "MATCH",
        "steps": "[EN] 04 AI 配對 · 05 接案"
      },
      {
        "i": "III",
        "zh": "[EN] 執行",
        "en": "EXECUTE",
        "steps": "[EN] 06 範圍確認 · 07 milestone · 08 案件儀表 · 09 交付驗收"
      },
      {
        "i": "IV",
        "zh": "[EN] 複利",
        "en": "COMPOUND",
        "steps": "[EN] 10 雙邊 NPS · 11 Tier 飛輪 · 12 retainer 提案"
      }
    ]
  },
  "trust3": {
    "eyebrow": "[EN] ◆ TRUST · AI-first，但不把人丟進黑箱",
    "headline_part1": "[EN] 先用 AI 降低不確定性，",
    "headline_part2_before": "[EN] 再用覆核與驗收建立",
    "headline_part2_em": "[EN] 信任層",
    "headline_part2_after": "[EN] 。",
    "items": [
      {
        "v": "AI",
        "en": "AI REVIEW",
        "zh": "[EN] AI 初審 + 人工覆核",
        "facts": [
          "[EN] 先由 AI 拆 brief 與交付範圍",
          "[EN] 再由人工覆核候選人與風險",
          "[EN] 不讓你直接丟進平台黑箱"
        ]
      },
      {
        "v": "24h",
        "en": "MATCH DIRECTION",
        "zh": "[EN] 先給候選方向",
        "facts": [
          "[EN] 初判領域與預算是否合理",
          "[EN] 中文 brief 原生理解",
          "[EN] 先看適配，再談短名單"
        ]
      },
      {
        "v": "M1",
        "en": "MILESTONE",
        "zh": "[EN] 每案先定驗收點",
        "facts": [
          "[EN] 交付物、時間、風險先講清楚",
          "[EN] 付款與合約先由雙方自行處理",
          "[EN] 避免做完才爭論算不算完成"
        ]
      }
    ]
  },
  "moat": {
    "eyebrow": "[EN] ◆ WHY BEYONDPATH · 當 LLM 也會媒合，我們還剩什麼",
    "headline_part1": "[EN] LLM 可以推薦人。",
    "headline_part2_before": "[EN] 但信任來自",
    "headline_part2_em": "[EN] 交付證據",
    "headline_part2_after": "[EN] 。",
    "intro": "[EN] BeyondPath 不把不可取代性押在「比 AI 更會配對」。我們真正要建立的是 AI 工作的信任資料層：誰能把哪一類需求交付出來、用了什麼 workflow、結果如何被驗收、下次為什麼值得被推薦。",
    "items": [
      {
        "axis": "[EN] LLM 可以做",
        "ttl": "[EN] 推薦看起來適合的人",
        "body": "[EN] 未來任何 LLM 都能讀 brief、生成候選名單、比較作品集。這會變成基本能力，不是護城河。",
        "peer": "[EN] ▸ 名單會越來越便宜"
      },
      {
        "axis": "[EN] BeyondPath 累積",
        "ttl": "[EN] 誰真的交付過，以及怎麼交付",
        "body": "[EN] 我們把 AI workflow、交付物、驗收紀錄、雙邊 NPS 與適配情境留下來，讓下一次推薦不是猜測，而是基於交付證據。",
        "peer": "[EN] ▸ 信任會越用越厚"
      },
      {
        "axis": "[EN] 不可取代性",
        "ttl": "[EN] 不是媒合演算法，而是 AI 工作信任資料",
        "body": "[EN] 真正稀缺的是台灣語境下的 brief、產業需求、worker workflow proof、交付品質與合作紀錄。這些資料會形成 BeyondPath 的推薦權重與認證規則。",
        "peer": "[EN] ▸ 從找人，變成工作信任層"
      }
    ]
  },
  "cases": {
    "eyebrow": "[EN] ◆ CASE STUDIES · 真實案件實錄",
    "headline_part1": "[EN] 看 BeyondPath 怎麼",
    "headline_em": "[EN] 真的在跑",
    "headline_part2": "[EN] 。",
    "intro_before": "[EN] 3 個 case 為 BeyondPath 早期合作案例樣本（DTC 領域）——展示 brief → 配對 → 交付 → 驗收紀錄的真實樣態。",
    "intro_paren_before": "[EN] （其他 14 領域案例累積中 · 想看你領域範例請",
    "intro_paren_link": "[EN] 填 brief",
    "intro_paren_after": "[EN] 、實際配對方案 24h 內 email）",
    "label_brief": "[EN] ① BRIEF · 需求",
    "label_match": "[EN] ② MATCH · 配對",
    "label_deliver": "[EN] ③ DELIVER · 交付",
    "label_accept": "[EN] ④ ACCEPT · 驗收",
    "label_result": "⑤ RESULT · ",
    "footer_before": "[EN] ▸ 想看更多？",
    "footer_link": "[EN] 寫信給 BeyondPath 拿工作樣品包",
    "items": [
      {
        "brand": "LUMINE",
        "sector": "[EN] DTC 保養品",
        "brief": "[EN] 9 月底上新「夜修護」3 SKU、需要 2 版主視覺 KV + 6 支 IG Reels 腳本 + 3 篇官網 + EDM 文案、排程到 Meta + LINE。",
        "matched": "[EN] Tier A+ 領域專家 · Visual KV + Brand DNA × AI · 配對分數 92 / 100",
        "delivered": "[EN] 2 KV × 4 alts each · 4 週交付 · NPS 4.94 / 5",
        "proof": "[EN] 交付證據：brief、版本紀錄、驗收清單、NPS 4.94 / 5",
        "state": "[EN] 進入 retainer · 持續 Q1 2027 上新檔",
        "badge": "[EN] 已結案 · NPS 4.94"
      },
      {
        "brand": "[EN] HANA 香氛",
        "sector": "spring restage",
        "brief": "[EN] 新香 line 2 個 SKU 春季視覺重新整理、4 週內交 2 版 KV + 8 個 social asset。",
        "matched": "[EN] 同一位 Tier A+ 領域專家（已跑 LUMINE retainer）· capacity 75% · 平台優先推薦",
        "delivered": "[EN] 2 KV × 4 alts · wk 2 / 4 · 進度 50%",
        "proof": "[EN] 交付證據：wk 2 版本上傳、mid review 已完成 2/4",
        "state": "[EN] ● 進行中 · ON TRACK",
        "badge": "[EN] 進行中 · WK 2 / 4"
      },
      {
        "brand": "Plant by Plant",
        "sector": "[EN] 包裝設計",
        "brief": "[EN] 植物保養 line 包裝重設、6 週內交 brand DNA spec + 6 個 SKU packaging dieline。",
        "matched": "[EN] Tier A+ Brand DNA × AI 領域 · 配對分數 88 / 100",
        "delivered": "[EN] 6 SKU dieline · brand spec 32 頁 · final review 階段",
        "proof": "[EN] 交付證據：6 SKU dieline、brand spec 32 頁、final review",
        "state": "● final review · WK 6 / 6",
        "badge": "WK 6 / 6 · FINAL REVIEW"
      }
    ]
  },
  "tier": {
    "eyebrow": "[EN] ◆ TIER · 5 階認證 · 升降基於 NPS",
    "headline_part1": "[EN] Tier 不是裝飾 · ",
    "headline_em": "[EN] 是推薦排序權重",
    "headline_part2": "[EN] 。",
    "intro": "[EN] Tier 升降基於結案 NPS、領域認證、客戶推薦 + 反馬太 +10（3 個月內無接案保留 slot）。worker 看得到「升級還差什麼」、client 看得到「這個 worker 為什麼貴」。",
    "typical_label": "typical",
    "day1_label_part1": "▸ DAY 1",
    "day1_label_part2": "[EN] 路徑",
    "day1_body_main": "[EN] 通過認證 → 進入 beta 首案候選池 → 第一批案件優先從認證名單裡媒合。",
    "day1_body_sub": "[EN] 我們先把案例、工具流與交付品質整理成客戶看得懂的證據，再逐步累積 NPS 與推薦權重。",
    "items": [
      {
        "id": "S",
        "zh": "[EN] 典範",
        "sub": "[EN] PARAGON · 跨領域 5+ · NPS ≥ 4.7",
        "stat": "10+ cases · NT$ 400K+"
      },
      {
        "id": "A+",
        "zh": "[EN] 領域專家",
        "sub": "[EN] MASTER · 30+ 案 · 領域 NPS ≥ 4.5",
        "stat": "30+ cases · NT$ 220K"
      },
      {
        "id": "A",
        "zh": "[EN] 資深",
        "sub": "[EN] PRO · 30+ 案 · 客戶推薦 ≥ 3",
        "stat": "30+ cases · NT$ 145K"
      },
      {
        "id": "B",
        "zh": "[EN] 認證入門",
        "sub": "[EN] ENTRY · 通過 4 階段認證",
        "stat": "5-30 cases · NT$ 78K"
      },
      {
        "id": "C",
        "zh": "[EN] 受訓",
        "sub": "[EN] TRAINEE · 申請中 / 補件",
        "stat": "0-5 cases · —"
      }
    ]
  },
  "network": {
    "eyebrow": "[EN] ◆ NETWORK · 15 領域、24 小時初步判斷",
    "headline_part1": "[EN] 15 個 ",
    "headline_em": "[EN] 領域",
    "headline_part2": "[EN] ，先判斷該找哪一種人。",
    "footer": "▸ HOT VERTICALS · +47% MoM growth · DTC + AI Agent",
    "hot_tag": "HOT",
    "verticals": [
      "[EN] DTC 內容自動化",
      "[EN] 設計品牌 × AI",
      "[EN] 短影音 · 剪輯",
      "[EN] 網頁設計 + 切版",
      "[EN] 客製軟體開發",
      "[EN] 客製系統建置",
      "AI Agent · Bot",
      "[EN] 數據 · BI",
      "B2B SaaS GTM",
      "[EN] 品牌市場調研",
      "[EN] 行銷服務操盤",
      "[EN] SEO · 內容營運",
      "[EN] 客服自動化",
      "[EN] 翻譯 · 在地化",
      "[EN] 其他"
    ]
  },
  "services": {
    "eyebrow": "[EN] ◆ SERVICES · 目前可接案 + 價格 reference",
    "headline_part1": "[EN] 4 個主要交付類型、",
    "headline_em": "[EN] 每案有適配 Tier 與預算 reference",
    "headline_part2": "[EN] 。",
    "intro": "[EN] 以下價格區間是 reference、不是固定報價。實際依需求複雜度、交付物範圍、時程而定。送出 brief 後、24h 內你會收到含建議預算的配對方案。",
    "label_range": "RANGE",
    "data_label": "[EN] ◆ DATA HANDLING · 你的資料怎麼處理",
    "data_body_before": "[EN] 送出的 brief / email / portfolio 進 BeyondPath 後台、僅平台團隊 + AI 初審工具看得到、不公開、不轉售。資料保留期視業務需要而定（用於未來案件配對與 retainer 邀請）、可隨時寄信到 ",
    "data_body_link": "hello@beyondpath.tw",
    "data_body_after": "[EN]  要求刪除你的資料。",
    "data_cta": "[EN] 查看完整隱私政策 →",
    "items": [
      {
        "n": "01",
        "en": "AI WORKFLOW",
        "zh": "[EN] AI workflow 顧問 + 落地",
        "desc": "[EN] 從需求拆解到工具流 setup、含 handoff 文件。常見：客服自動化、內容 pipeline、內部 agent。",
        "tiers": "Tier B+ / A+",
        "range": "[EN] NT$ 15-80 萬"
      },
      {
        "n": "02",
        "en": "BRAND CONTENT",
        "zh": "[EN] DTC 品牌內容",
        "desc": "[EN] 視覺 KV、brand DNA、社群內容操盤。常見：保養品 / 食品 / 設計品牌 launch + 持續經營。",
        "tiers": "Tier B / B+ / A+",
        "range": "[EN] NT$ 5-60 萬"
      },
      {
        "n": "03",
        "en": "REELS · VIDEO",
        "zh": "[EN] 短影音 + reels",
        "desc": "[EN] 腳本 + 拍攝 + 剪輯 一條龍。常見：品牌敘事、UGC 風格、產品 demo、教學影片。",
        "tiers": "Tier B / B+",
        "range": "[EN] NT$ 3-25 萬"
      },
      {
        "n": "04",
        "en": "CUSTOM DEV",
        "zh": "[EN] 客製軟體 / AI agent / 工具流",
        "desc": "[EN] 從 prototype 到 production：API 整合、bot、內部工具。常見：Slack agent、CRM 自動化、Make/n8n flow。",
        "tiers": "Tier B+ / A+",
        "range": "[EN] NT$ 10-120 萬"
      }
    ]
  },
  "faq": {
    "eyebrow": "[EN] ◆ FAQ · 你可能會問的",
    "headline_part1": "[EN] 七個 ",
    "headline_em": "[EN] 真問題",
    "headline_part2": "[EN] 。",
    "intro_before": "[EN] 前 4 條給準備發案的你、後 3 條給準備接案的你。沒答到的、寫信給 BeyondPath → ",
    "intro_email": "edwardt0303@gmail.com",
    "items": [
      {
        "n": "01",
        "tag": "[EN] 發案者",
        "q": "[EN] 我已經有合作的接案者 / 設計師了，為什麼要換 BeyondPath？",
        "a": "[EN] 你不用換、你可以平行用。BeyondPath 解的是「現有人脈池外、突然要新類型 AI 交付」這個場景——例如你平常合作的設計師不會剪短影音、你又不想為了一支 reels 重新發 30 封 brief。留下需求後，24 小時內先得到適配領域、預算與候選方向；進入短名單後再看 Top 3 配對與理由。首案合不合適你自己判斷、平台不綁約、不收訂閱。"
      },
      {
        "n": "02",
        "tag": "[EN] 發案者",
        "q": "[EN] 做不出來 / 品質不對怎麼辦？",
        "a": "[EN] POC 階段先不把你丟進全自動黑箱。我們會先用 AI 拆需求、判斷領域與風險，再由人工覆核 milestone、交付標準與候選人。早期不做平台代收代付；付款與合約由雙方自行處理。BeyondPath 先把需求、候選人與驗收紀錄跑穩。"
      },
      {
        "n": "03",
        "tag": "[EN] 發案者",
        "q": "[EN] 如果 LLM 以後也能媒合人選，BeyondPath 還必要嗎？",
        "a": "[EN] 如果只是推薦名單，確實會被 LLM 商品化。BeyondPath 要累積的是 LLM 很難直接擁有的交付信任資料：worker 的 AI workflow、真實交付物、驗收紀錄、雙邊 NPS、適合的產業情境與失敗風險。名單只是起點，真正有價值的是「這個人為什麼值得被信任」的證據。"
      },
      {
        "n": "04",
        "tag": "[EN] 發案者",
        "q": "[EN] 這個比 Fiverr 貴 / 比工作室便宜嗎？怎麼定價？",
        "a": "[EN] 我們在 Fiverr 跟月費代理之間。早期會先測試需求診斷、候選短名單、認證服務或媒合服務費等模式，不在平台上代收專案款。你付費買的不是名單，而是需求拆解、候選理由、驗收框架與降低找錯人的判斷成本。"
      },
      {
        "n": "05",
        "tag": "[EN] 接案者",
        "q": "[EN] 我想接案、要怎麼申請？真的通過率 < 10%？",
        "a": "[EN] 兩段式：Stage 1（Tier B 入會、AI 初評 + 簡易驗證）目前約 28% 通過、Stage 2（Tier A 正式認證）才是 < 10%。完整 4 階段認證：（1）技能測驗——你的領域基本功、（2）同儕 review——已認證 worker 評分、（3）客戶模擬案件——平台給一個假需求、你交一份成果、（4）主審委員會——通過前三關才進。整個流程約 2-3 週。沒過可以 6 個月後重申、平台會給回饋說明哪裡需要補強。"
      },
      {
        "n": "06",
        "tag": "[EN] 接案者",
        "q": "[EN] 平台怎麼收費？我需要先付費嗎？",
        "a": "[EN] beta 前期先不在平台上代收專案款，也不做抽佣承諾。BeyondPath 會先測試需求診斷、候選短名單、認證服務或媒合服務費等模式；目前你申請認證不用付費，也不需要先承諾排他。"
      },
      {
        "n": "07",
        "tag": "[EN] 接案者",
        "q": "[EN] 如果一段時間沒接到案、平台會幫忙嗎？",
        "a": "[EN] 會。我們有「反馬太 +10」機制——3 個月內無接案的 worker、配對排序自動 +10 加權；新認證 < 30 天 +5；首案池保留 20% slot 給新人。前提是你已通過 < 10% 認證——這不是降門檻、是讓已被驗證的人有持續接案機會。同時 AI 教練會主動提示「升 Tier 還差什麼」「哪些領域最近需求高」。"
      }
    ]
  },
  "finalcta": {
    "roadmap_label": "[EN] ◆ ROADMAP · 在你按下排隊前 · 我們的進度",
    "eyebrow": "◆ JOIN · PRIVATE BETA",
    "headline": "[EN] 加入第一批 AI 工作網路。",
    "blurb": "[EN] 第一批 beta 先用 AI 初審與人工覆核並行。發案方可以留下需求，把不確定的 AI 專案拆成可驗收流程；接案者可以提交作品與 AI workflow，讓能力被認證、被理解、被推薦。",
    "cta_client_main": "[EN] 我想進入 AI 發案流程 →",
    "cta_client_sub": "[EN] 發案方",
    "cta_worker_main": "[EN] 我想加入 AI 接案網路 →",
    "cta_worker_sub": "[EN] 接案者",
    "cta_demo": "[EN] 先看 Worker Console demo →",
    "cta_waitlist_main": "[EN] 加入 Beta waitlist →",
    "cta_waitlist_sub": "[EN] 手動覆核",
    "meta_left": "EARLY BETA",
    "meta_right": "[EN] 送出進人工審核 · 不代表正式合約或付款"
  },
  "footer": {
    "brand_tag": "[EN] 台灣 beta 先從 AI 內容、網站、自動化與 GTM 交付開始。用 brief、候選人、milestone，把找人與交付風險降下來。",
    "col_product": "PRODUCT",
    "col_network": "NETWORK",
    "col_company": "COMPANY",
    "col_legal": "LEGAL",
    "link_protocol": "[EN] 流程協定 · 12 步",
    "link_engines": "[EN] 核心引擎 · 6",
    "link_tier": "[EN] Tier 飛輪",
    "link_trust": "[EN] 信任機制",
    "link_why": "WHY BEYONDPATH",
    "link_client_apply": "[EN] 客戶申請",
    "link_expert_apply": "[EN] Expert 申請",
    "link_15verticals": "[EN] 15 領域總覽",
    "link_master_wall": "[EN] A+ 大師牆 · 即將上線",
    "link_retainer": "[EN] Retainer Plans · 即將上線",
    "link_about": "[EN] 關於 BeyondPath",
    "link_feedback": "[EN] 合作回饋 · 即將上線",
    "link_join_us": "[EN] 加入我們",
    "link_contact_email": "edwardt0303@gmail.com",
    "link_terms": "[EN] Terms · 即將上線",
    "link_privacy": "[EN] Privacy · 即將上線",
    "link_acceptance": "[EN] 驗收規則",
    "link_dispute": "[EN] 爭議紀錄流程",
    "link_security": "[EN] 資安白皮書 · v0.4 · 即將上線",
    "copyright": "© 2026 BEYONDPATH NETWORK",
    "cities": "TAIPEI × SINGAPORE × TOKYO · Y1->Y3",
    "version_status": "v0.5β · LIVE · BETA COHORT OPEN"
  },
  "banner": {
    "label": "◆ WORKER DECISION",
    "ok_title": "[EN] 已接受配對邀請",
    "ok_body": "[EN] BeyondPath 24-72 小時內準備合約草稿與案件初始 milestone、寄到你的 email。客戶端也會收到「worker 已確認接案」通知。若 72 小時無收信、請聯絡 hello@beyondpath.tw。",
    "decline_title": "[EN] 已記錄你婉拒這次配對",
    "decline_body": "[EN] 謝謝告知。下次有適配案件、BeyondPath 仍會優先推薦。",
    "error_title": "[EN] 配對連結已過期或無效",
    "error_body": "[EN] 邀請信連結有 7 天效期。請聯絡 BeyondPath：hello@beyondpath.tw",
    "default_title": "[EN] 感謝你的回應",
    "default_body": "[EN] 若有疑問請聯絡 BeyondPath：hello@beyondpath.tw",
    "close_aria": "[EN] 關閉"
  },
  "misc": {
    "back_to_top": "[EN] 回到頂部",
    "engines_ahead": "[EN] /* engines ahead · 6 個摩擦點、一個一個拆 */"
  }
};
})(window);
