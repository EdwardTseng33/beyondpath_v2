// Shared mock data for the BeyondPath client intake flow
//
// 2026-05-18 v2 · vertical-aware demo data (Edward 5/18「未來所有案件類型都檢查」拍板)
// - 15 個 vertical 都有對應 demo data
// - 6 個主要 vertical (DTC / design / video / software / agent / mkt) = unique 完整
// - 9 個 secondary vertical (web / system / data / b2b / research / seo / cs / localize / other) = generic template
// - WORKERS name 'Edward' 全清 (5/16 漏網的 source)
// - app2.jsx 透過 state.vertical 抓對應 demo

// 2026-06-11 調研批 · 15 卡收斂 9 + 付費需求探索入口
// 依據: research/ai-case-deliverability-insight-2026-06.md + howl-strategy-memo-2026-06-10.md
// featured: 'discovery' = 置頂入口 strip、不進 grid · lead: true = 主打 4 垂直
// 舊 id (video/seo/mkt/cs/localize) 自卡片移除、VERTICAL_DEMO_MAP 保留 entry 供舊 state 回放
const VERTICALS = [
  {
    id: 'research', cat: 'strategy', featured: 'discovery',
    en: 'Paid Discovery',
    zh: '付費需求探索',
    blurb: '1-2 週交付：需求計畫書 + 可點原型 + 固定報價單 · 進正式案全額折抵',
    icon: '⊕', sample: 5,
  },
  {
    id: 'agent', cat: 'build', lead: true,
    en: 'AI Agent / Chatbot',
    zh: 'AI Agent · 客服自動化',
    blurb: 'LINE OA / 官網客服 / RAG 知識庫 + 人工接手後台',
    icon: '✶', sample: 9,
  },
  {
    id: 'web', cat: 'build', lead: true,
    en: 'Web Design × Build',
    zh: '網頁設計 + 切版',
    blurb: 'LP / 官網 / Webflow / Framer · AI 加速設計',
    icon: '▤', sample: 13,
  },
  {
    id: 'software', cat: 'build', lead: true,
    en: 'Custom Software Dev',
    zh: '客製軟體 · 內部工具',
    blurb: '內部工具 / SaaS MVP / API 整合 · 取代 Excel 手工流程',
    icon: '◇', sample: 8,
  },
  {
    id: 'dtc', cat: 'content', lead: true,
    en: 'DTC Growth Content',
    zh: 'DTC 成長內容引擎',
    blurb: '短影音 + 素材產線 + SEO 內容 · 月費制穩定出件',
    icon: '◐', sample: 12,
  },
  {
    id: 'design', cat: 'content',
    en: 'Design × Brand DNA',
    zh: '設計品牌 × AI',
    blurb: '視覺系統 + AI 工具流融合',
    icon: '◒', sample: 9,
  },
  {
    id: 'data', cat: 'build',
    en: 'Data × BI Dashboard',
    zh: '數據分析 · BI 儀表板',
    blurb: 'ETL / Looker / Metabase · AI 自動歸因',
    icon: '▦', sample: 7,
  },
  {
    id: 'b2b', cat: 'strategy',
    en: 'B2B SaaS · GTM',
    zh: 'B2B SaaS 上市策略',
    blurb: '產品定位、序列、Outbound playbook',
    icon: '◑', sample: 7,
  },
  {
    id: 'system', cat: 'build',
    en: 'Custom System Build',
    zh: '客製系統 · ERP/CRM 模組',
    blurb: 'Odoo / CRM 整合 · 建議先走付費需求探索',
    icon: '◆', sample: 6,
  },
  {
    id: 'other', cat: 'other',
    en: 'Other',
    zh: '其他',
    blurb: '翻譯在地化 / 行銷操盤 / 其他需求 · 人工分類 24h 介入',
    icon: '○', sample: 0,
  },
];

const VERTICAL_CATS = [
  { id: 'all',      en: 'All',         zh: '全部' },
  { id: 'content',  en: 'Content',     zh: '內容' },
  { id: 'build',    en: 'Build',       zh: '開發' },
  { id: 'strategy', en: 'Strategy',    zh: '策略' },
  { id: 'other',    en: 'Other',       zh: '其他' },
];

// ────────────────────────────────────────────────────────
// VERTICAL_DEMO_MAP · 每個 vertical 對應的 brief + AI parse + workers
// ────────────────────────────────────────────────────────

const VERTICAL_DEMO_MAP = {
  // ═══════════ 主要 6 個 vertical · unique 完整 demo ═══════════

  dtc: {
    brief: `# LUMINE · 2026 Q4 上新素材排程

我們是台灣 D2C 保養品牌，主打發酵成分 + 簡約包裝。
9 月底上新「夜修護」系列 3 SKU，需要：

- 主視覺 KV × 2 版（IG / 官網）
- 短影音腳本 × 6 支（IG Reels 15s）
- 產品文案 × 3 篇（官網 + EDM + LP）
- 排程到 Meta + LINE 官方帳號
- 月底要看 ROAS 與素材表現分析

預算：彈性，市場行情可接受 +15% 內。
時間：8 週內完成 3 SKU 全套素材。
要求：能接住我們已經訓練過的 GPTs（品牌語氣 v2.3）。`,
    parse: {
      industry: { en: 'D2C Skincare', zh: 'D2C 保養品牌', confidence: 0.94 },
      scope: 'content-automation',
      tasks: [
        { id: 't1', en: 'Visual KV × 2', zh: '主視覺 KV', hours: 18, role: 'Visual', tier: 'A+' },
        { id: 't2', en: 'Reels Script × 6', zh: '短影音腳本', hours: 22, role: 'Copy', tier: 'A+' },
        { id: 't3', en: 'Product Copy × 3', zh: '產品長文案', hours: 14, role: 'Copy', tier: 'A' },
        { id: 't4', en: 'Channel Scheduling', zh: '排程上架', hours: 8, role: 'Ops', tier: 'A' },
        { id: 't5', en: 'ROAS Read-out', zh: '成效分析報告', hours: 6, role: 'Ops', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'DTC Content Automation',
      totalHours: 68,
      budget: { lo: 180_000, hi: 240_000, currency: 'NT$' },
      contractType: { en: 'Trial Project', zh: '試做案', alt: '可轉月費 retainer' },
      flags: [
        { kind: 'ok', text: '需求清晰，3 SKU 邊界明確' },
        { kind: 'ok', text: '已有品牌 GPTs v2.3 → worker 起手成本 ↓' },
        { kind: 'warn', text: '8 週內完成 3 SKU，建議 2-expert 共案' },
        { kind: 'info', text: 'ROAS 分析 = 月費 retainer 入口' },
      ],
    },
    workers: [
      {
        id: 'w-arc', handle: '@dtc.expert.01', name: 'Tier A+ 視覺專家', avatar: 'assets/edward.jpg',
        role: 'Visual + Brand DNA', tier: 'A+', badges: ['DTC', 'Brand DNA × AI'],
        nps: 4.86, cases: 7, capacity: 4, last: '11d', voice: 18_400, voiceCh: 'IG',
        domainMatch: 0.92, boost: { loyalty: 0, mercy: 0 }, score: 92,
        breakdown: { load: 19, calendar: 18, tier: 14, nps: 14, domain: 14, voice: 5, boost: 8 },
        blurb: '7 個 DTC 保養專案、品牌 DNA × AI 旗艦徽章。',
        works: ['HANA 香氛', 'Ondine 保養', 'Plant by Plant'],
      },
      {
        id: 'w-mei', handle: '@dtc.expert.02', name: 'Tier A+ 文案專家', avatar: 'assets/edward.jpg',
        role: 'Copy + Reels Script', tier: 'A+', badges: ['DTC', 'Reels'],
        nps: 4.71, cases: 23, capacity: 3, last: '4d', voice: 32_100, voiceCh: 'Threads',
        domainMatch: 0.88, boost: { loyalty: 0, mercy: 0 }, score: 88,
        breakdown: { load: 22, calendar: 17, tier: 14, nps: 13, domain: 13, voice: 5, boost: 4 },
        blurb: '保養品牌文案專科，23 篇 Reels 腳本 NPS ≥ 4.7。',
        works: ['Wahmi', 'OAK 草本', '隨身茶事'],
      },
      {
        id: 'w-jay', handle: '@dtc.ops.01', name: 'Tier A 操盤手', avatar: 'assets/edward.jpg',
        role: 'Ops + ROAS Analyst', tier: 'A', badges: ['Meta Ads', 'GA4'],
        nps: 4.62, cases: 12, capacity: 5, last: '32d', voice: 2_300, voiceCh: 'Substack',
        domainMatch: 0.74, boost: { loyalty: 0, mercy: 10 }, score: 84,
        breakdown: { load: 25, calendar: 19, tier: 10, nps: 13, domain: 11, voice: 2, boost: 14 },
        blurb: '排程 + 成效操盤手。3 月內無接案 → 反馬太 +10 加成。',
        works: ['Bloomist', 'Fluent', 'Rinsen'],
      },
    ],
    suggestedPair: ['w-arc', 'w-mei', 'w-jay'],
  },

  software: {
    brief: `# B2B SaaS 內部工具 · 銷售管理儀表板

我們是 30 人 B2B SaaS 公司、銷售部門用 Notion + Google Sheet 手動追 pipeline、想自建內部工具。

需求：
- 串接 HubSpot CRM API 抓 deal data
- 自建 React + TypeScript dashboard
- 銷售 KPI 視覺化（funnel / win-rate / ACV / CAC payback）
- 主管端可以下鑽看單一 deal stage 卡點
- 跟 Slack 整合（高金額 deal stage 變動自動通知）

預算：彈性、中等以上。
時間：6 週內可上線使用。
要求：能用 modern stack（TypeScript / Next.js / tRPC 或同等）。`,
    parse: {
      industry: { en: 'B2B SaaS · Internal Tools', zh: 'B2B SaaS 內部工具', confidence: 0.91 },
      scope: 'custom-software',
      tasks: [
        { id: 't1', en: 'HubSpot API Integration', zh: 'HubSpot API 整合', hours: 16, role: 'Backend', tier: 'A+' },
        { id: 't2', en: 'React + TS Dashboard', zh: 'React Dashboard 前端', hours: 32, role: 'Frontend', tier: 'A+' },
        { id: 't3', en: 'KPI Visualization', zh: 'KPI 視覺化元件', hours: 20, role: 'Frontend', tier: 'A' },
        { id: 't4', en: 'Slack Webhook', zh: 'Slack 整合', hours: 8, role: 'Backend', tier: 'A' },
        { id: 't5', en: 'Deploy + CI/CD', zh: '部署 + 自動化', hours: 6, role: 'DevOps', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Custom Software Development',
      totalHours: 82,
      budget: { lo: 280_000, hi: 380_000, currency: 'NT$' },
      contractType: { en: 'Trial Project', zh: '試做案', alt: '可轉月度維護 retainer' },
      flags: [
        { kind: 'ok', text: '需求清晰、技術 stack 明確' },
        { kind: 'ok', text: 'HubSpot API 文件齊全、整合風險低' },
        { kind: 'warn', text: '6 週時程含 deploy、建議 2-expert（前端 + 後端）' },
        { kind: 'info', text: '月度維護 retainer = 第二階段機會' },
      ],
    },
    workers: [
      {
        id: 'w-soft-1', handle: '@dev.fullstack.01', name: 'Tier A+ 全端工程師', avatar: 'assets/edward.jpg',
        role: 'Full-stack · React + Node', tier: 'A+', badges: ['TypeScript', 'B2B SaaS'],
        nps: 4.82, cases: 14, capacity: 3, last: '8d', voice: 8_400, voiceCh: 'GitHub',
        domainMatch: 0.94, boost: { loyalty: 0, mercy: 0 }, score: 92,
        breakdown: { load: 18, calendar: 19, tier: 14, nps: 14, domain: 14, voice: 4, boost: 9 },
        blurb: 'B2B SaaS 全端 8 年、HubSpot / Salesforce API 整合 14 案。',
        works: ['Fluent CRM', 'Pipedrive Custom', 'Ortis ERP'],
      },
      {
        id: 'w-soft-2', handle: '@dev.frontend.01', name: 'Tier A+ 前端架構師', avatar: 'assets/edward.jpg',
        role: 'Frontend Architect', tier: 'A+', badges: ['React', 'TypeScript', 'Dashboard'],
        nps: 4.74, cases: 19, capacity: 2, last: '5d', voice: 12_000, voiceCh: 'Twitter',
        domainMatch: 0.88, boost: { loyalty: 0, mercy: 0 }, score: 88,
        breakdown: { load: 22, calendar: 17, tier: 14, nps: 13, domain: 13, voice: 5, boost: 4 },
        blurb: '前端架構 6 年、Next.js + D3 視覺化專科、19 個 dashboard 上線。',
        works: ['Stripe Atlas', 'Beehiiv Internal', 'Lattice'],
      },
      {
        id: 'w-soft-3', handle: '@dev.devops.01', name: 'Tier A DevOps 工程師', avatar: 'assets/edward.jpg',
        role: 'DevOps + Backend', tier: 'A', badges: ['Vercel', 'GCP', 'CI/CD'],
        nps: 4.65, cases: 22, capacity: 4, last: '12d', voice: 3_400, voiceCh: 'Dev.to',
        domainMatch: 0.78, boost: { loyalty: 0, mercy: 0 }, score: 81,
        breakdown: { load: 20, calendar: 18, tier: 10, nps: 13, domain: 11, voice: 3, boost: 6 },
        blurb: 'DevOps 5 年、22 案 CI/CD 部署、AWS / GCP / Vercel 三平台熟。',
        works: ['Linear', 'Notion Workflow', 'Resend Setup'],
      },
    ],
    suggestedPair: ['w-soft-1', 'w-soft-2', 'w-soft-3'],
  },

  design: {
    brief: `# 設計品牌 × AI · 全新品牌系統建立

我們是新創、要從零打造一個 D2C 品牌（食品類）。需要完整 brand DNA + 視覺系統 + AI 工具鏈整合。

需求：
- Brand DNA 工作坊（半天線上 / 線下擇一）
- Logo + 識別系統（含使用規範 PDF）
- 包裝設計 × 4 SKU
- 官網 LP wireframe + 主視覺
- 訓練品牌專屬 GPTs（語氣 v1 baseline）

預算：彈性、中高端。
時間：10 週內交付完整 brand book + 上線素材。
要求：能跟我們既有的 AI workflow（Midjourney + Claude）對接。`,
    parse: {
      industry: { en: 'Brand × Design', zh: '品牌設計', confidence: 0.93 },
      scope: 'brand-system',
      tasks: [
        { id: 't1', en: 'Brand DNA Workshop', zh: 'Brand DNA 工作坊', hours: 6, role: 'Strategy', tier: 'A+' },
        { id: 't2', en: 'Logo + Identity System', zh: 'Logo + 識別系統', hours: 28, role: 'Visual', tier: 'A+' },
        { id: 't3', en: 'Packaging × 4 SKU', zh: '包裝設計 × 4', hours: 32, role: 'Visual', tier: 'A+' },
        { id: 't4', en: 'LP Wireframe + KV', zh: 'LP wireframe + 主視覺', hours: 18, role: 'Visual', tier: 'A' },
        { id: 't5', en: 'Brand GPTs Training', zh: '品牌 GPTs 訓練', hours: 10, role: 'AI', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Design × Brand DNA',
      totalHours: 94,
      budget: { lo: 320_000, hi: 480_000, currency: 'NT$' },
      contractType: { en: 'Trial Project', zh: '試做案', alt: '可轉長期 retainer' },
      flags: [
        { kind: 'ok', text: '完整 brand DNA 邊界清楚' },
        { kind: 'ok', text: '已用 Midjourney + Claude → worker 對接成本 ↓' },
        { kind: 'warn', text: '10 週含 4 SKU 包裝、建議 2-3 expert 共案' },
        { kind: 'info', text: 'Brand 完成後可進長期視覺維護 retainer' },
      ],
    },
    workers: [
      {
        id: 'w-design-1', handle: '@design.brand.01', name: 'Tier A+ 品牌設計師', avatar: 'assets/edward.jpg',
        role: 'Brand DNA + Identity', tier: 'A+', badges: ['Brand DNA', 'Identity System'],
        nps: 4.88, cases: 11, capacity: 3, last: '9d', voice: 22_000, voiceCh: 'Behance',
        domainMatch: 0.94, boost: { loyalty: 0, mercy: 0 }, score: 93,
        breakdown: { load: 19, calendar: 18, tier: 14, nps: 14, domain: 14, voice: 5, boost: 9 },
        blurb: '品牌設計 10 年、11 個從零品牌、含食品 / 保養 / 居家三類。',
        works: ['Mossy', 'Lumi 食品', 'Soia Home'],
      },
      {
        id: 'w-design-2', handle: '@design.pkg.01', name: 'Tier A+ 包裝設計師', avatar: 'assets/edward.jpg',
        role: 'Packaging Specialist', tier: 'A+', badges: ['Packaging', 'Print Production'],
        nps: 4.76, cases: 28, capacity: 2, last: '6d', voice: 8_900, voiceCh: 'IG',
        domainMatch: 0.91, boost: { loyalty: 0, mercy: 0 }, score: 89,
        breakdown: { load: 21, calendar: 18, tier: 14, nps: 13, domain: 14, voice: 4, boost: 5 },
        blurb: '包裝設計 7 年、28 個 SKU、含食品 / 飲品 / 保養三類量產經驗。',
        works: ['OAK 草本', 'Bloomist', 'Habit-Lab'],
      },
      {
        id: 'w-design-3', handle: '@design.ai.01', name: 'Tier A AI 視覺工程師', avatar: 'assets/edward.jpg',
        role: 'AI Visual + GPTs', tier: 'A', badges: ['Midjourney', 'Claude', 'GPTs'],
        nps: 4.58, cases: 18, capacity: 4, last: '15d', voice: 14_000, voiceCh: 'Threads',
        domainMatch: 0.82, boost: { loyalty: 0, mercy: 0 }, score: 82,
        breakdown: { load: 20, calendar: 17, tier: 10, nps: 13, domain: 12, voice: 4, boost: 6 },
        blurb: 'AI 視覺工程 3 年、18 案訓練品牌專屬 GPTs。',
        works: ['Wahmi GPTs', 'Plant by Plant AI', 'Maru Visual'],
      },
    ],
    suggestedPair: ['w-design-1', 'w-design-2', 'w-design-3'],
  },

  video: {
    brief: `# 短影音 · 個人品牌 KOL 內容工廠

我是 5 萬粉的個人品牌 KOL（教育類）、想建立穩定的短影音產線、每週交 3-5 支 Reels。

需求：
- 腳本撰寫（每週 5 主題、跟我們 GPTs 對接）
- 拍攝 + 後製剪輯（每支 60s 內）
- AI 配音 / 字幕（中英雙語）
- 排程到 IG Reels + TikTok + YT Shorts
- 月度 ROAS / 漲粉 / 互動分析

預算：月費 retainer 30-60k。
時間：第一個月內穩定產線。
要求：能保留我的個人語氣、不能太「網紅濾鏡」。`,
    parse: {
      industry: { en: 'Creator Economy · Short Video', zh: '個人品牌短影音', confidence: 0.92 },
      scope: 'video-content',
      tasks: [
        { id: 't1', en: 'Weekly Script × 5', zh: '週腳本 × 5', hours: 16, role: 'Copy', tier: 'A+' },
        { id: 't2', en: 'Video Edit × 5', zh: '剪輯 × 5', hours: 20, role: 'Video', tier: 'A+' },
        { id: 't3', en: 'AI VO + 雙語字幕', zh: 'AI 配音 + 雙語字幕', hours: 8, role: 'AI', tier: 'A' },
        { id: 't4', en: '3-Platform Scheduling', zh: '三平台排程', hours: 6, role: 'Ops', tier: 'A' },
        { id: 't5', en: 'Monthly Analytics', zh: '月度分析', hours: 4, role: 'Ops', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Short-form Video',
      totalHours: 54,
      budget: { lo: 36_000, hi: 54_000, currency: 'NT$', model: 'monthly' },
      contractType: { en: 'Monthly Retainer', zh: '月費 retainer', alt: '首月為試做案、第二月起 retainer' },
      flags: [
        { kind: 'ok', text: '個人語氣 = GPTs 可承載、worker 易上手' },
        { kind: 'ok', text: '月費 retainer 模型清晰' },
        { kind: 'warn', text: '雙語 + 三平台、建議 2-expert（剪輯 + 字幕）' },
        { kind: 'info', text: '產線穩定後可擴 podcast 二創' },
      ],
    },
    workers: [
      {
        id: 'w-vid-1', handle: '@vid.editor.01', name: 'Tier A+ 短影音剪輯師', avatar: 'assets/edward.jpg',
        role: 'Video Editor · Reels', tier: 'A+', badges: ['Reels', 'TikTok', 'CapCut Pro'],
        nps: 4.83, cases: 156, capacity: 3, last: '3d', voice: 28_000, voiceCh: 'TikTok',
        domainMatch: 0.93, boost: { loyalty: 0, mercy: 0 }, score: 92,
        breakdown: { load: 19, calendar: 19, tier: 14, nps: 14, domain: 14, voice: 5, boost: 7 },
        blurb: '短影音剪輯 4 年、156 支 Reels、KOL / 品牌 / 教育類三領域熟。',
        works: ['@studynote.tw', '@biz.coffee', '@health.daily'],
      },
      {
        id: 'w-vid-2', handle: '@vid.script.01', name: 'Tier A+ 腳本專家', avatar: 'assets/edward.jpg',
        role: 'Script Writer · KOL', tier: 'A+', badges: ['Reels Script', 'GPTs', 'Hook'],
        nps: 4.72, cases: 89, capacity: 4, last: '7d', voice: 19_500, voiceCh: 'Threads',
        domainMatch: 0.89, boost: { loyalty: 0, mercy: 0 }, score: 88,
        breakdown: { load: 22, calendar: 17, tier: 14, nps: 13, domain: 13, voice: 5, boost: 4 },
        blurb: '短影音腳本 89 篇、開頭 3 秒 hook 設計專家、含 GPTs 對接經驗。',
        works: ['@learn.with.amy', '@yt.shorts.boss', '@reading.now'],
      },
      {
        id: 'w-vid-3', handle: '@vid.ai.01', name: 'Tier A AI 配音工程師', avatar: 'assets/edward.jpg',
        role: 'AI Voice + Subtitle', tier: 'A', badges: ['ElevenLabs', '雙語字幕', 'Whisper'],
        nps: 4.61, cases: 34, capacity: 5, last: '21d', voice: 4_200, voiceCh: 'YouTube',
        domainMatch: 0.81, boost: { loyalty: 0, mercy: 0 }, score: 80,
        breakdown: { load: 24, calendar: 19, tier: 10, nps: 13, domain: 12, voice: 2, boost: 0 },
        blurb: 'AI 配音 2 年、34 案中英雙語字幕、ElevenLabs / Whisper 兩工具熟。',
        works: ['@biz.podcast.cn', '@global.learn', '@startup.daily'],
      },
    ],
    suggestedPair: ['w-vid-1', 'w-vid-2', 'w-vid-3'],
  },

  agent: {
    brief: `# AI Agent · 中小企業客戶服務自動化

我們是台灣中型電商（年營收 1 億）、客服每天 200-300 訊息、想自建 AI agent。

需求：
- 訓練專屬 RAG agent（用我們既有 FAQ + 訂單 system）
- LINE OA + 官網 chat 接入
- Multi-agent（接單 / 退換貨 / 商品推薦 三 agent 分流）
- 後台 human-in-loop 介面（爭議單可人工接手）
- 月度 conversation 分析 + LLM 提示優化

預算：月費 retainer 60-100k + 初期 build 80-150k。
時間：8 週內第一版上線。
要求：能跟 OpenAI / Anthropic 雙模型切換（成本優化）。`,
    parse: {
      industry: { en: 'E-commerce · AI Agent', zh: '電商 AI Agent', confidence: 0.91 },
      scope: 'ai-agent-build',
      tasks: [
        { id: 't1', en: 'RAG Build + FAQ Ingest', zh: 'RAG 建置 + FAQ 灌入', hours: 24, role: 'AI', tier: 'A+' },
        { id: 't2', en: 'Multi-agent Routing', zh: 'Multi-agent 路由', hours: 18, role: 'AI', tier: 'A+' },
        { id: 't3', en: 'LINE OA + Web Chat', zh: 'LINE + Web 接入', hours: 14, role: 'Backend', tier: 'A' },
        { id: 't4', en: 'Human-in-loop UI', zh: '人工接手介面', hours: 16, role: 'Frontend', tier: 'A' },
        { id: 't5', en: 'Monthly Analytics', zh: '月度分析 + prompt 優化', hours: 10, role: 'AI', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'AI Agent / Chatbot',
      totalHours: 82,
      budget: { lo: 80_000, hi: 150_000, currency: 'NT$', model: 'project + monthly' },
      contractType: { en: 'Trial Project + Retainer', zh: '試做案 + 月費', alt: '8 週試做 → 月費 60-100k 維護' },
      flags: [
        { kind: 'ok', text: '需求邊界清楚、FAQ + 訂單 system 已有' },
        { kind: 'warn', text: 'Multi-agent + 雙模型切換、技術風險中、建議 senior expert' },
        { kind: 'warn', text: '8 週含上線、建議 2-expert 共案（RAG + 前端）' },
        { kind: 'info', text: '月度 conversation 量大 = retainer 持續優化空間' },
      ],
    },
    workers: [
      {
        id: 'w-agent-1', handle: '@agent.rag.01', name: 'Tier A+ AI Agent 架構師', avatar: 'assets/edward.jpg',
        role: 'RAG + Multi-agent', tier: 'A+', badges: ['LangChain', 'RAG', 'Multi-agent'],
        nps: 4.84, cases: 18, capacity: 2, last: '6d', voice: 16_000, voiceCh: 'Twitter',
        domainMatch: 0.94, boost: { loyalty: 0, mercy: 0 }, score: 93,
        breakdown: { load: 18, calendar: 19, tier: 14, nps: 14, domain: 14, voice: 4, boost: 10 },
        blurb: 'AI agent 架構 3 年、18 案 RAG + multi-agent 部署、OpenAI / Anthropic 雙模型熟。',
        works: ['電商 X · LINE Bot', 'SaaS Y · Internal Agent', '金融 Z · KYC Agent'],
      },
      {
        id: 'w-agent-2', handle: '@agent.fe.01', name: 'Tier A+ 前端 + Chat UI', avatar: 'assets/edward.jpg',
        role: 'Chat UI + Admin', tier: 'A+', badges: ['React', 'Chat UI', 'Human-in-loop'],
        nps: 4.71, cases: 12, capacity: 3, last: '11d', voice: 6_400, voiceCh: 'GitHub',
        domainMatch: 0.86, boost: { loyalty: 0, mercy: 0 }, score: 87,
        breakdown: { load: 21, calendar: 17, tier: 14, nps: 13, domain: 13, voice: 4, boost: 5 },
        blurb: '前端 + Chat UI 5 年、12 案 human-in-loop 介面、含 LINE OA 整合經驗。',
        works: ['電商 A · Web Chat', '醫療 B · Patient Bot', '教育 C · Tutor UI'],
      },
      {
        id: 'w-agent-3', handle: '@agent.ops.01', name: 'Tier A LLM Ops 工程師', avatar: 'assets/edward.jpg',
        role: 'LLM Ops + Prompt', tier: 'A', badges: ['Prompt Eng', 'LangSmith', 'Cost Opt'],
        nps: 4.58, cases: 28, capacity: 4, last: '18d', voice: 3_800, voiceCh: 'Substack',
        domainMatch: 0.79, boost: { loyalty: 0, mercy: 0 }, score: 79,
        breakdown: { load: 22, calendar: 18, tier: 10, nps: 13, domain: 11, voice: 2, boost: 3 },
        blurb: 'LLM ops 2 年、28 案 prompt 優化、雙模型成本最佳化專家。',
        works: ['SaaS D · Cost Audit', '電商 E · Prompt Tuning', '金融 F · LLM Eval'],
      },
    ],
    suggestedPair: ['w-agent-1', 'w-agent-2', 'w-agent-3'],
  },

  mkt: {
    brief: `# 行銷服務 · 新創 B2B SaaS 從 0 到 1 操盤

我們是 pre-PMF 的 B2B SaaS、現有 30 個 paying customer、想找全套行銷操盤手做季度增長。

需求：
- ICP 訪談 + GTM playbook 寫定
- 廣告投放（LinkedIn + Google + Meta、月 budget 30 萬）
- Content marketing（每週 2 篇 case study + 1 篇 thought leadership）
- 數據儀表板（CAC / LTV / Pipeline velocity）
- 月度 stand-up + 季度策略 review

預算：月費 retainer 80-150k + 廣告預算 separate。
時間：3 個月一季、依結果續約。
要求：要懂 B2B SaaS、不要 D2C 經驗包過來。`,
    parse: {
      industry: { en: 'B2B SaaS Marketing', zh: 'B2B SaaS 行銷', confidence: 0.92 },
      scope: 'marketing-ops',
      tasks: [
        { id: 't1', en: 'ICP Interview + GTM', zh: 'ICP 訪談 + GTM playbook', hours: 18, role: 'Strategy', tier: 'A+' },
        { id: 't2', en: 'Ad Ops × 3 Channels', zh: '三平台廣告操盤', hours: 32, role: 'Ads', tier: 'A+' },
        { id: 't3', en: 'Content × 12/月', zh: 'Content 月產 12 篇', hours: 28, role: 'Copy', tier: 'A' },
        { id: 't4', en: 'Dashboard Setup', zh: '數據儀表板', hours: 12, role: 'Data', tier: 'A' },
        { id: 't5', en: 'Monthly Standup', zh: '月度 standup', hours: 8, role: 'Strategy', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Marketing Service',
      totalHours: 98,
      budget: { lo: 80_000, hi: 150_000, currency: 'NT$', model: 'monthly' },
      contractType: { en: 'Quarterly Retainer', zh: '季度 retainer', alt: '一季試做 → 半年續約' },
      flags: [
        { kind: 'ok', text: 'B2B SaaS 邊界明確、不混 D2C 經驗' },
        { kind: 'warn', text: '三平台 + 月 12 篇 content、建議 2-3 expert 共案' },
        { kind: 'warn', text: 'pre-PMF 階段、廣告 ROI 不穩、要有 GTM iteration 容忍度' },
        { kind: 'info', text: 'PMF 後可擴 demand gen retainer + sales playbook' },
      ],
    },
    workers: [
      {
        id: 'w-mkt-1', handle: '@mkt.gtm.01', name: 'Tier A+ B2B SaaS 操盤手', avatar: 'assets/edward.jpg',
        role: 'GTM Strategy + Ads', tier: 'A+', badges: ['B2B SaaS', 'GTM', 'LinkedIn Ads'],
        nps: 4.81, cases: 9, capacity: 2, last: '12d', voice: 24_000, voiceCh: 'LinkedIn',
        domainMatch: 0.93, boost: { loyalty: 0, mercy: 0 }, score: 91,
        breakdown: { load: 18, calendar: 18, tier: 14, nps: 14, domain: 14, voice: 5, boost: 8 },
        blurb: 'B2B SaaS GTM 6 年、9 個 pre-PMF 到 Series A 操盤經驗。',
        works: ['Fluent', 'Linear-like SaaS', 'Ramp-style Fintech'],
      },
      {
        id: 'w-mkt-2', handle: '@mkt.content.01', name: 'Tier A+ B2B Content Lead', avatar: 'assets/edward.jpg',
        role: 'Content + Thought Leadership', tier: 'A+', badges: ['B2B', 'Case Study', 'TL Content'],
        nps: 4.74, cases: 145, capacity: 3, last: '8d', voice: 32_000, voiceCh: 'Substack',
        domainMatch: 0.88, boost: { loyalty: 0, mercy: 0 }, score: 87,
        breakdown: { load: 20, calendar: 17, tier: 14, nps: 13, domain: 13, voice: 5, boost: 5 },
        blurb: 'B2B content lead 5 年、145 篇 case study + thought leadership 上線。',
        works: ['SaaSiq Blog', 'Stripe Atlas Content', 'Beehiiv'],
      },
      {
        id: 'w-mkt-3', handle: '@mkt.data.01', name: 'Tier A Marketing Analyst', avatar: 'assets/edward.jpg',
        role: 'Marketing Data + Dashboard', tier: 'A', badges: ['GA4', 'Looker', 'CAC/LTV'],
        nps: 4.65, cases: 22, capacity: 4, last: '15d', voice: 5_200, voiceCh: 'Substack',
        domainMatch: 0.82, boost: { loyalty: 0, mercy: 0 }, score: 82,
        breakdown: { load: 22, calendar: 18, tier: 10, nps: 13, domain: 12, voice: 3, boost: 4 },
        blurb: 'Marketing analyst 4 年、22 案 dashboard 建置、CAC payback 計算專家。',
        works: ['Pendo Setup', 'Mixpanel Custom', 'Looker for SaaS'],
      },
    ],
    suggestedPair: ['w-mkt-1', 'w-mkt-2', 'w-mkt-3'],
  },

  // ═══════════ 9 個 secondary vertical · generic template ═══════════
  // 結構同上、但 brief 簡短 + workers 用 generic 'Tier A+ {vertical} 領域專家'
  // 用 helper function `genericVertical(vertical_zh, vertical_en, vertical_id)` 統一生成

  // 為了避免重複、9 個 secondary 用 generic 結構 + vertical-specific 細節
  // 寫進 vertical.js helper、或直接展開（為了 readable + transparent、選展開）

  web: {
    brief: `# 網頁設計 + 切版 · 品牌官網 + LP

我們是 5 人新創、需要全新品牌官網 + 3 個 LP（不同 campaign）。

需求：
- 設計（Figma）→ 切版（Webflow or Next.js）
- 官網 5 頁（Home / About / Product / Pricing / Blog）
- 3 個 campaign LP（不同 ICP）
- 響應式（手機 / 平板 / 桌機）
- SEO meta + sitemap

預算：彈性、中端。
時間：4-6 週。
要求：Webflow 或 Next.js 擇一、CMS 後台可自編。`,
    parse: {
      industry: { en: 'Web Design + Build', zh: '網頁設計 + 切版', confidence: 0.91 },
      scope: 'web-build',
      tasks: [
        { id: 't1', en: 'Site Map + Wireframe', zh: '架構 + wireframe', hours: 12, role: 'UX', tier: 'A+' },
        { id: 't2', en: 'Figma Design', zh: 'Figma 設計', hours: 28, role: 'Visual', tier: 'A+' },
        { id: 't3', en: 'Webflow Build', zh: 'Webflow 切版', hours: 32, role: 'Frontend', tier: 'A' },
        { id: 't4', en: '3x Campaign LP', zh: '3 LP', hours: 18, role: 'Frontend', tier: 'A' },
        { id: 't5', en: 'SEO Setup', zh: 'SEO 基礎', hours: 6, role: 'SEO', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Web Design × Build',
      totalHours: 96,
      budget: { lo: 240_000, hi: 360_000, currency: 'NT$' },
      contractType: { en: 'Trial Project', zh: '試做案', alt: '可轉維護 retainer' },
      flags: [
        { kind: 'ok', text: '需求邊界清楚、5 頁 + 3 LP' },
        { kind: 'warn', text: '建議設計 + 切版分工 2-expert' },
        { kind: 'info', text: '可擴月度維護 retainer' },
      ],
    },
    workers: [
      genericWorker('w-web-1', 'Tier A+ 網頁設計師', 'Web Designer · Figma', 'A+', ['Figma', 'Webflow'], 92, 0.92),
      genericWorker('w-web-2', 'Tier A+ 前端工程師', 'Frontend · Webflow', 'A+', ['Webflow', 'Next.js'], 88, 0.88),
      genericWorker('w-web-3', 'Tier A SEO 工程師', 'SEO Setup', 'A', ['SEO', 'Schema', 'Sitemap'], 80, 0.81),
    ],
    suggestedPair: ['w-web-1', 'w-web-2', 'w-web-3'],
  },

  system: {
    brief: `# 客製化系統開發 · 中小企業 ERP / CRM 客製

我們是傳產製造業（年營收 5 億）、現有 ERP（Odoo）需要客製模組、加 CRM 整合。

需求：
- Odoo 客製模組（生產排程 / 庫存）
- HubSpot CRM 雙向同步
- 業務員 mobile app（iOS / Android）
- 內部報表自動化（每週 KPI email）

預算：彈性、中高端。
時間：12 週。
要求：能跟既有 Odoo 16 版本對接、不重做 ERP。`,
    parse: {
      industry: { en: 'Custom System Build', zh: '客製化系統', confidence: 0.90 },
      scope: 'custom-system',
      tasks: [
        { id: 't1', en: 'Odoo Module Dev', zh: 'Odoo 模組開發', hours: 40, role: 'Backend', tier: 'A+' },
        { id: 't2', en: 'CRM Sync', zh: 'CRM 雙向同步', hours: 18, role: 'Backend', tier: 'A+' },
        { id: 't3', en: 'Mobile App', zh: 'Mobile app', hours: 32, role: 'Mobile', tier: 'A' },
        { id: 't4', en: 'Report Automation', zh: '報表自動化', hours: 10, role: 'DevOps', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Custom System Build',
      totalHours: 100,
      budget: { lo: 380_000, hi: 580_000, currency: 'NT$' },
      contractType: { en: 'Trial Project', zh: '試做案', alt: '可轉月度維護 retainer' },
      flags: [
        { kind: 'warn', text: '12 週 + ERP 客製、建議 2-3 expert 共案' },
        { kind: 'info', text: '系統建好後可擴月度維護 retainer' },
      ],
    },
    workers: [
      genericWorker('w-sys-1', 'Tier A+ Odoo 工程師', 'Backend · Odoo', 'A+', ['Odoo', 'Python', 'ERP'], 91, 0.91),
      genericWorker('w-sys-2', 'Tier A+ 整合工程師', 'API + Sync', 'A+', ['HubSpot', 'API Integration'], 87, 0.86),
      genericWorker('w-sys-3', 'Tier A Mobile 工程師', 'iOS / Android', 'A', ['React Native', 'Mobile'], 81, 0.82),
    ],
    suggestedPair: ['w-sys-1', 'w-sys-2', 'w-sys-3'],
  },

  data: {
    brief: `# 數據分析 · BI Dashboard 自建

我們是 D2C 電商（年營收 8000 萬）、想自建 BI dashboard 看完整數據。

需求：
- 整合 Shopify + Meta Ads + Google Ads + GA4 數據
- ETL pipeline（每日同步）
- Looker / Metabase dashboard
- AI 自動歸因（ROAS attribution model）
- 月度經營者報告（PDF 自動生成）

預算：彈性、中端。
時間：6 週。
要求：能用 BigQuery、不要自建 SQL warehouse。`,
    parse: {
      industry: { en: 'E-commerce BI', zh: '電商 BI', confidence: 0.92 },
      scope: 'data-bi',
      tasks: [
        { id: 't1', en: 'ETL Setup', zh: 'ETL 建置', hours: 20, role: 'Data', tier: 'A+' },
        { id: 't2', en: 'BigQuery Schema', zh: 'BigQuery 架構', hours: 12, role: 'Data', tier: 'A+' },
        { id: 't3', en: 'Dashboard Build', zh: 'Dashboard 視覺化', hours: 24, role: 'Data', tier: 'A' },
        { id: 't4', en: 'AI Attribution', zh: 'AI 歸因', hours: 16, role: 'AI', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Data × BI Dashboard',
      totalHours: 72,
      budget: { lo: 220_000, hi: 320_000, currency: 'NT$' },
      contractType: { en: 'Trial Project', zh: '試做案', alt: '可轉月度數據維護 retainer' },
      flags: [
        { kind: 'ok', text: 'BigQuery + Looker stack 明確' },
        { kind: 'warn', text: 'AI 歸因模型客製、需 senior data engineer' },
        { kind: 'info', text: '月度報告 = retainer 入口' },
      ],
    },
    workers: [
      genericWorker('w-data-1', 'Tier A+ Data Engineer', 'ETL + BigQuery', 'A+', ['BigQuery', 'dbt', 'Airflow'], 91, 0.91),
      genericWorker('w-data-2', 'Tier A+ BI Analyst', 'Dashboard + Looker', 'A+', ['Looker', 'Metabase', 'GA4'], 87, 0.87),
      genericWorker('w-data-3', 'Tier A 歸因專家', 'AI Attribution', 'A', ['ROAS', 'Attribution', 'Python'], 81, 0.82),
    ],
    suggestedPair: ['w-data-1', 'w-data-2', 'w-data-3'],
  },

  b2b: {
    brief: `# B2B SaaS · GTM 策略 + 銷售 playbook

我們是 Seed 階段 B2B SaaS、需要從 0 建 GTM 策略 + sales playbook + 第一波 outbound。

需求：
- ICP 定義 + 5 個 segment 訪談
- Sales playbook（cold email / demo flow / objection handling）
- Outbound 序列建置（Apollo + LinkedIn 1500 prospect）
- Demo 培訓（founder + 第一位 AE）

預算：彈性、中端。
時間：3 個月。
要求：要懂 SaaS sales、不要 enterprise IT 經驗包過來。`,
    parse: {
      industry: { en: 'B2B SaaS · GTM', zh: 'B2B SaaS GTM', confidence: 0.91 },
      scope: 'gtm-strategy',
      tasks: [
        { id: 't1', en: 'ICP + Segment Interview', zh: 'ICP + 訪談', hours: 24, role: 'Strategy', tier: 'A+' },
        { id: 't2', en: 'Sales Playbook', zh: 'Sales playbook', hours: 18, role: 'Strategy', tier: 'A+' },
        { id: 't3', en: 'Outbound Sequence', zh: 'Outbound 序列', hours: 16, role: 'Ops', tier: 'A' },
        { id: 't4', en: 'Demo Training', zh: 'Demo 培訓', hours: 12, role: 'Sales', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'B2B SaaS · GTM',
      totalHours: 70,
      budget: { lo: 200_000, hi: 300_000, currency: 'NT$' },
      contractType: { en: 'Trial Project', zh: '試做案', alt: '可轉 fractional CRO retainer' },
      flags: [
        { kind: 'ok', text: 'Seed 階段、GTM 邊界清楚' },
        { kind: 'warn', text: 'ICP 不準會大幅影響 outbound、建議 senior expert' },
        { kind: 'info', text: 'PMF 後可擴 fractional CRO retainer' },
      ],
    },
    workers: [
      genericWorker('w-b2b-1', 'Tier A+ B2B SaaS Strategist', 'GTM + Sales Strategy', 'A+', ['B2B SaaS', 'GTM'], 92, 0.92),
      genericWorker('w-b2b-2', 'Tier A+ Sales Ops', 'Outbound + Apollo', 'A+', ['Apollo', 'LinkedIn', 'Outbound'], 88, 0.87),
      genericWorker('w-b2b-3', 'Tier A Demo Coach', 'Sales Training', 'A', ['Demo', 'Discovery', 'Closing'], 82, 0.83),
    ],
    suggestedPair: ['w-b2b-1', 'w-b2b-2', 'w-b2b-3'],
  },

  // 2026-06-11 調研批 · research 轉生為全站「付費需求探索」入口產品 (id 不變、保 localStorage / 後端相容)
  research: {
    brief: `# 付費需求探索 · Paid Discovery

我們是 25 人食品電商，老闆說要「導入 AI」，但我們說不清楚要什麼：
客服每天爆量、出貨對帳用 Excel 手工、行銷素材外包很貴。
想先花小錢把需求弄清楚，再決定投多少。

期待 1-2 週內拿到：
- 現況流程盤點（客服 / 對帳 / 素材三條線）
- 哪裡先做、哪裡不值得做的優先序建議
- 需求計畫書（可直接拿去發案或比價）
- 可點的畫面原型（老闆看得懂的那種）
- 固定報價單（之後進正式案可全額折抵）

預算：NT$30-50K。
要求：交付物要能帶走，就算不續約也值回票價。`,
    parse: {
      industry: { en: 'Paid Discovery', zh: '付費需求探索', confidence: 0.95 },
      scope: 'paid-discovery',
      tasks: [
        { id: 't1', en: 'Stakeholder Interview', zh: '現況訪談 + 流程盤點', hours: 6, role: 'Research', tier: 'A' },
        { id: 't2', en: 'Opportunity Map', zh: '機會地圖 + 優先序', hours: 6, role: 'Strategy', tier: 'A+' },
        { id: 't3', en: 'Requirement Spec', zh: '需求計畫書', hours: 8, role: 'Strategy', tier: 'A' },
        { id: 't4', en: 'Clickable Prototype', zh: '可點原型', hours: 10, role: 'Build', tier: 'A' },
        { id: 't5', en: 'Fixed Quote', zh: '固定報價單', hours: 2, role: 'Ops', tier: 'A' },
      ],
      recommendedTier: 'A',
      vertical: 'Paid Discovery',
      totalHours: 32,
      budget: { lo: 30_000, hi: 50_000, currency: 'NT$' },
      contractType: { en: 'Paid Discovery', zh: '付費探索', alt: '進正式案探索費全額折抵' },
      flags: [
        { kind: 'ok', text: '交付物可帶走：計畫書 + 原型 + 報價單、不續約也值回票價' },
        { kind: 'ok', text: '1-2 週短週期、單一窗口' },
        { kind: 'info', text: '正式案啟動時、探索費全額折抵' },
        { kind: 'info', text: '重合約條款只在正式案出現、探索階段不簽長約' },
      ],
    },
    workers: [
      genericWorker('w-disc-1', 'Tier A+ Discovery 顧問', 'Discovery Lead · 需求拆解', 'A+', ['需求拆解', '流程盤點'], 92, 0.93),
      genericWorker('w-disc-2', 'Tier A 原型設計師', 'Prototype · 可點畫面', 'A', ['Figma', 'v0 / Lovable'], 86, 0.88),
      genericWorker('w-disc-3', 'Tier A 估算分析師', 'Scope + Quote', 'A', ['估算', 'SOW'], 81, 0.82),
    ],
    suggestedPair: ['w-disc-1', 'w-disc-2', 'w-disc-3'],
  },

  seo: {
    brief: `# SEO · 內容營運 · 中文 SaaS 長尾佈局

我們是 B2B SaaS（生產力工具類）、要做中文 SEO 內容、目標 6 個月 organic traffic 從 0 到 3 萬月 UV。

需求：
- Topical authority 結構規劃（pillar + cluster）
- AI 量產長尾文（每月 20 篇、2000 字以上）
- 編輯 + 校稿（人工 final check）
- 內鏈 / schema markup / canonical 處理
- 月度 SERP 報告 + 優化建議

預算：月費 retainer 40-80k。
時間：6 個月 sprint。
要求：要懂 AI content（不純人寫）、但能保證原創性 + 可讀性。`,
    parse: {
      industry: { en: 'SEO Content Ops', zh: 'SEO 內容營運', confidence: 0.91 },
      scope: 'seo-content',
      tasks: [
        { id: 't1', en: 'Topical Authority Plan', zh: 'Topical 規劃', hours: 16, role: 'SEO', tier: 'A+' },
        { id: 't2', en: 'Monthly Content × 20', zh: '月文 × 20', hours: 60, role: 'Copy', tier: 'A' },
        { id: 't3', en: 'Edit + QA', zh: '編輯 + QA', hours: 16, role: 'Copy', tier: 'A' },
        { id: 't4', en: 'Schema + Internal Link', zh: 'Schema + 內鏈', hours: 8, role: 'SEO', tier: 'A' },
        { id: 't5', en: 'Monthly SERP Report', zh: '月度 SERP 報告', hours: 6, role: 'SEO', tier: 'A' },
      ],
      recommendedTier: 'A',
      vertical: 'SEO / Content Ops',
      totalHours: 106,
      budget: { lo: 40_000, hi: 80_000, currency: 'NT$', model: 'monthly' },
      contractType: { en: 'Monthly Retainer', zh: '月費 retainer', alt: '6 個月 sprint' },
      flags: [
        { kind: 'ok', text: '月費模型 + 6 個月 sprint 邊界清楚' },
        { kind: 'warn', text: '月 20 篇 + AI + 編輯、建議 2-3 expert 共案' },
        { kind: 'info', text: 'PMF 後可擴 thought leadership / podcast 二創' },
      ],
    },
    workers: [
      genericWorker('w-seo-1', 'Tier A+ SEO Strategist', 'Topical Authority', 'A+', ['SEO', 'Topical', 'SERP'], 91, 0.92),
      genericWorker('w-seo-2', 'Tier A AI Content Writer', 'AI Content + Edit', 'A', ['AI Content', '長尾', 'Edit'], 84, 0.85),
      genericWorker('w-seo-3', 'Tier A Technical SEO', 'Schema + Internal Link', 'A', ['Schema', 'Internal Link', 'Crawl'], 80, 0.81),
    ],
    suggestedPair: ['w-seo-1', 'w-seo-2', 'w-seo-3'],
  },

  cs: {
    brief: `# 客服自動化 · 中小型 SaaS 24/7 客服

我們是 D2C SaaS（教育類）、客服每天 100-200 訊息、想自建 24/7 multi-agent 客服。

需求：
- 串接 Intercom + LINE OA + 官網 chat
- Multi-agent 分流（FAQ / 退費 / 技術問題）
- 訓練專屬 knowledge base
- 人工接手介面（複雜問題上交）
- 月度滿意度 NPS + 自動優化 prompt

預算：月費 retainer 30-60k + build 50-80k。
時間：6 週上線。
要求：能跟 Intercom 既有 ticket 流程整合、不重建。`,
    parse: {
      industry: { en: 'CS Automation', zh: '客服自動化', confidence: 0.90 },
      scope: 'cs-bot',
      tasks: [
        { id: 't1', en: 'KB + RAG Setup', zh: 'KB + RAG 建置', hours: 18, role: 'AI', tier: 'A+' },
        { id: 't2', en: 'Intercom + LINE Integration', zh: 'Intercom + LINE 整合', hours: 14, role: 'Backend', tier: 'A' },
        { id: 't3', en: 'Multi-agent Routing', zh: 'Multi-agent 路由', hours: 12, role: 'AI', tier: 'A+' },
        { id: 't4', en: 'Human-in-loop UI', zh: '人工接手介面', hours: 14, role: 'Frontend', tier: 'A' },
        { id: 't5', en: 'NPS + Prompt Tuning', zh: 'NPS + 優化', hours: 8, role: 'AI', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'CS Automation',
      totalHours: 66,
      budget: { lo: 50_000, hi: 80_000, currency: 'NT$', model: 'project + monthly' },
      contractType: { en: 'Trial Project + Retainer', zh: '試做案 + 月費', alt: '6 週 build → 月費 30-60k' },
      flags: [
        { kind: 'ok', text: 'Intercom 既有、整合風險低' },
        { kind: 'warn', text: 'Multi-agent + 人工接手、建議 2 expert 共案' },
        { kind: 'info', text: '月度 conversation 量大 = retainer 持續優化空間' },
      ],
    },
    workers: [
      genericWorker('w-cs-1', 'Tier A+ AI 客服架構師', 'RAG + Multi-agent', 'A+', ['LangChain', 'Intercom', 'RAG'], 92, 0.92),
      genericWorker('w-cs-2', 'Tier A 前端工程師', 'Human-in-loop UI', 'A', ['React', 'Intercom UI'], 84, 0.85),
      genericWorker('w-cs-3', 'Tier A LLM Ops', 'Prompt + NPS', 'A', ['Prompt Eng', 'NPS'], 80, 0.81),
    ],
    suggestedPair: ['w-cs-1', 'w-cs-2', 'w-cs-3'],
  },

  localize: {
    brief: `# 翻譯 · 在地化 · SaaS 產品多語上架

我們是 SaaS、英文版上線後想做繁中 / 簡中 / 日文 / 韓文 4 語上架。

需求：
- UI 翻譯（約 3000 字 / 語言、4 語）
- 行銷網站翻譯（10 頁 / 語言）
- AI 機翻 + 人工潤稿（保證在地語感）
- 多語 SEO（每語 schema + hreflang）
- 月度新功能翻譯維護

預算：彈性、中端 + 月費維護 15-30k。
時間：8 週初版上線。
要求：人工潤稿要 native speaker、AI 機翻不接純機器版。`,
    parse: {
      industry: { en: 'Translation × Localization', zh: '翻譯在地化', confidence: 0.91 },
      scope: 'localization',
      tasks: [
        { id: 't1', en: 'UI Translation × 4 lang', zh: 'UI × 4 語', hours: 32, role: 'Translation', tier: 'A+' },
        { id: 't2', en: 'Web × 10 pages × 4 lang', zh: '網站 × 40 頁', hours: 40, role: 'Translation', tier: 'A' },
        { id: 't3', en: 'Native QA × 4 lang', zh: 'Native 潤稿', hours: 24, role: 'Translation', tier: 'A+' },
        { id: 't4', en: 'Multi-lang SEO', zh: '多語 SEO', hours: 10, role: 'SEO', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Translation / Localization',
      totalHours: 106,
      budget: { lo: 280_000, hi: 380_000, currency: 'NT$', model: 'project + monthly' },
      contractType: { en: 'Trial Project + Maintenance', zh: '試做案 + 月費維護', alt: '8 週 build → 月費 15-30k' },
      flags: [
        { kind: 'ok', text: '4 語 + 邊界明確' },
        { kind: 'warn', text: '4 語 native QA、建議 4 個 native speaker 共案' },
        { kind: 'info', text: '月度新功能翻譯維護 = retainer' },
      ],
    },
    workers: [
      genericWorker('w-loc-1', 'Tier A+ 在地化專家', 'Localization Lead', 'A+', ['UI Translation', 'CAT Tool'], 91, 0.92),
      genericWorker('w-loc-2', 'Tier A+ 多語 QA', 'Native Speaker QA', 'A+', ['ZH', 'JA', 'KO', 'Native QA'], 87, 0.88),
      genericWorker('w-loc-3', 'Tier A 多語 SEO', 'Multi-lang SEO', 'A', ['hreflang', 'i18n'], 80, 0.81),
    ],
    suggestedPair: ['w-loc-1', 'w-loc-2', 'w-loc-3'],
  },

  other: {
    brief: `# 其他類型案件

不在當前 14 個 vertical 內的案件、平台客服 24h 內人工分類、配對對應領域的 worker。

請在下方輸入你的需求、團隊會評估：
- 領域歸類（是否落在現有 vertical、或開新 vertical）
- 配對方向（適合的 worker tier + 領域組合）
- 報價區間 + 時程估算
- 試做案 SOW 設計建議`,
    parse: {
      industry: { en: 'Other / Custom', zh: '其他 / 客製', confidence: 0.50 },
      scope: 'manual-review',
      tasks: [
        { id: 't1', en: 'Manual Review', zh: '人工分類 + 評估', hours: 4, role: 'Strategy', tier: 'A+' },
        { id: 't2', en: 'Worker Sourcing', zh: 'Worker 配對', hours: 8, role: 'Ops', tier: 'A' },
        { id: 't3', en: 'SOW Drafting', zh: 'SOW 草擬', hours: 6, role: 'Strategy', tier: 'A' },
      ],
      recommendedTier: 'A+',
      vertical: 'Other',
      totalHours: 18,
      budget: { lo: 0, hi: 0, currency: 'NT$', model: 'TBD' },
      contractType: { en: 'Custom Quote', zh: '客製報價', alt: '24h 內 BeyondPath 團隊評估' },
      flags: [
        { kind: 'info', text: '其他類別 · 平台客服 24h 內接觸你' },
        { kind: 'info', text: '配對方案 + 報價區間 + 時程會在 email 給' },
      ],
    },
    workers: [
      genericWorker('w-other-1', 'BeyondPath 平台客服', 'Custom Routing', 'A+', ['Manual', 'Custom'], 90, 0.50),
    ],
    suggestedPair: ['w-other-1'],
  },
};

// Generic worker template factory · 用於 secondary vertical
function genericWorker(id, name, role, tier, badges, score, domainMatch) {
  return {
    id, handle: `@${id}`, name, avatar: 'assets/edward.jpg', role, tier, badges,
    nps: tier === 'A+' ? 4.78 : 4.62, cases: tier === 'A+' ? 18 : 12, capacity: 3, last: '12d',
    voice: tier === 'A+' ? 14_000 : 4_500, voiceCh: 'Substack',
    domainMatch, boost: { loyalty: 0, mercy: 0 }, score,
    breakdown: { load: 20, calendar: 18, tier: tier === 'A+' ? 14 : 10, nps: 13, domain: Math.round(domainMatch * 15), voice: 4, boost: 5 },
    blurb: `${role.split(' · ')[0]} 領域 · BeyondPath Tier ${tier} 認證 worker。`,
    works: ['BeyondPath 過往案例 1', 'BeyondPath 過往案例 2', 'BeyondPath 過往案例 3'],
  };
}

// ────────────────────────────────────────────────────────
// Helper: 抓 vertical-specific demo data
// ────────────────────────────────────────────────────────

function getDemoForVertical(verticalId) {
  return VERTICAL_DEMO_MAP[verticalId] || VERTICAL_DEMO_MAP.dtc; // fallback to DTC if invalid
}

// ────────────────────────────────────────────────────────
// Legacy exports (backwards compat · 預設用 DTC、新 code 應該透過 getDemoForVertical)
// ────────────────────────────────────────────────────────

const SAMPLE_BRIEF = VERTICAL_DEMO_MAP.dtc.brief;
const AI_PARSE_RESULT = VERTICAL_DEMO_MAP.dtc.parse;
const WORKERS = VERTICAL_DEMO_MAP.dtc.workers;
const SUGGESTED_PAIR = VERTICAL_DEMO_MAP.dtc.suggestedPair;

window.BP_DATA = {
  VERTICALS,
  VERTICAL_CATS,
  VERTICAL_DEMO_MAP,
  getDemoForVertical,
  // Legacy fields (backwards compat)
  SAMPLE_BRIEF,
  AI_PARSE_RESULT,
  WORKERS,
  SUGGESTED_PAIR,
};
