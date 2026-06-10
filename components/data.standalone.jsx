// Shared mock data for the BeyondPath client intake flow

const VERTICALS = [
  {
    id: 'dtc', cat: 'content',
    en: 'DTC Content Automation',
    zh: 'DTC 內容自動化',
    blurb: '保養 / 健康食品 / 設計品牌的素材產線',
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
    id: 'video', cat: 'content',
    en: 'Short-form Video',
    zh: '短影音 · 剪輯',
    blurb: 'Reels / TikTok / YT shorts 量產 · AI 配音字幕',
    icon: '▶', sample: 11,
  },
  {
    id: 'web', cat: 'build',
    en: 'Web Design × Build',
    zh: '網頁設計 + 切版',
    blurb: 'LP / 官網 / Webflow / Framer · AI 加速設計',
    icon: '▤', sample: 13,
  },
  {
    id: 'software', cat: 'build',
    en: 'Custom Software Dev',
    zh: '客製化軟體開發',
    blurb: 'SaaS / 內部工具 / API 整合 · TypeScript stack',
    icon: '◇', sample: 8,
  },
  {
    id: 'system', cat: 'build',
    en: 'Custom System Build',
    zh: '客製化系統開發',
    blurb: 'ERP / CRM / 工作流 · low-code + AI agent',
    icon: '◆', sample: 6,
  },
  {
    id: 'agent', cat: 'build',
    en: 'AI Agent / Chatbot',
    zh: 'AI Agent · Chatbot 開發',
    blurb: 'RAG / multi-agent / LLM workflow 部署',
    icon: '✶', sample: 9,
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
    id: 'research', cat: 'strategy',
    en: 'Brand × Market Research',
    zh: '品牌市場調研計畫',
    blurb: 'AI 驅動消費者訪談 / 競品分析 / persona',
    icon: '⊕', sample: 5,
  },
  {
    id: 'mkt', cat: 'growth',
    en: 'Marketing Service',
    zh: '行銷服務',
    blurb: '操盤手、廣告投放、數據儀表',
    icon: '◓', sample: 14,
  },
  {
    id: 'seo', cat: 'growth',
    en: 'SEO / Content Ops',
    zh: 'SEO · 內容營運',
    blurb: 'AI 量產長尾文 + topical authority 結構',
    icon: '◭', sample: 8,
  },
  {
    id: 'cs', cat: 'service',
    en: 'CS Automation',
    zh: '客服自動化',
    blurb: 'Multi-agent 客服 + 知識庫',
    icon: '⊙', sample: 5,
  },
  {
    id: 'localize', cat: 'service',
    en: 'Translation / Localization',
    zh: '翻譯 · 在地化',
    blurb: 'AI 機翻 + 人工潤稿 · 多語上架',
    icon: '✦', sample: 6,
  },
  {
    id: 'other', cat: 'other',
    en: 'Other',
    zh: '其他',
    blurb: '人工分類，平台客服 24h 介入',
    icon: '○', sample: 0,
  },
];

const VERTICAL_CATS = [
  { id: 'all',      en: 'All',         zh: '全部' },
  { id: 'content',  en: 'Content',     zh: '內容' },
  { id: 'build',    en: 'Build',       zh: '開發' },
  { id: 'strategy', en: 'Strategy',    zh: '策略' },
  { id: 'growth',   en: 'Growth',      zh: '行銷' },
  { id: 'service',  en: 'Service',     zh: '服務' },
  { id: 'other',    en: 'Other',       zh: '其他' },
];

// Simulated brief — “LUMINE 保養品牌秋冬上新素材排程”
const SAMPLE_BRIEF = `# LUMINE · 2026 Q4 上新素材排程

我們是台灣 D2C 保養品牌，主打發酵成分 + 簡約包裝。
9 月底上新「夜修護」系列 3 SKU，需要：

- 主視覺 KV × 2 版（IG / 官網）
- 短影音腳本 × 6 支（IG Reels 15s）
- 產品文案 × 3 篇（官網 + EDM + LP）
- 排程到 Meta + LINE 官方帳號
- 月底要看 ROAS 與素材表現分析

預算：彈性，市場行情可接受 +15% 內。
時間：8 週內完成 3 SKU 全套素材。
要求：能接住我們已經訓練過的 GPTs（品牌語氣 v2.3）。`;

// What the AI returns after “parsing”
const AI_PARSE_RESULT = {
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
};

// Worker pool that powers Step 4
const WORKERS = [
  {
    id: 'w-arc',
    handle: '@arc.lin',
    name: 'Tier A+ 視覺 + Brand 專家',
    avatar: window.__resources.avEdward,
    role: 'Visual + Brand DNA',
    tier: 'A+',
    badges: ['DTC', 'Brand DNA × AI'],
    nps: 4.86,
    cases: 2,
    capacity: 4,
    last: '11d',
    voice: 18_400,
    voiceCh: 'IG',
    domainMatch: 0.92,
    boost: { loyalty: 0, mercy: 0 },
    score: 92,
    breakdown: { load: 19, calendar: 18, tier: 14, nps: 14, domain: 14, voice: 5, boost: 8 },
    blurb: '前 Plain-me 設計總監，7 個 DTC 保養專案、品牌 DNA × AI 旗艦徽章。',
    works: ['HANA 香氛', 'Ondine 保養', 'Plant by Plant'],
    portfolio: [
      { client: 'LUMINE Q4', desc: 'DTC · 夜修護 KV', roas: '+38%', nps: 4.94 },
      { client: 'HANA 香氛', desc: 'spring restage', roas: '+22%', nps: 4.81 },
      { client: 'Plant by Plant', desc: 'monthly retainer', roas: '+45%', nps: 4.92 },
    ],
  },
  {
    id: 'w-mei',
    handle: '@mei.ko',
    name: 'Tier A+ 文案 + Reels 專家',
    avatar: window.__resources.avEdward,
    role: 'Copy + Reels Script',
    tier: 'A+',
    badges: ['DTC', 'Reels'],
    nps: 4.71,
    cases: 1,
    capacity: 3,
    last: '4d',
    voice: 32_100,
    voiceCh: 'Threads',
    domainMatch: 0.88,
    boost: { loyalty: 0, mercy: 0 },
    score: 88,
    breakdown: { load: 22, calendar: 17, tier: 14, nps: 13, domain: 13, voice: 5, boost: 4 },
    blurb: '保養品牌文案專科，23 篇 Reels 腳本 NPS ≥ 4.7，自帶 32k Threads 聲量。',
    works: ['Wahmi', 'OAK 草本', '隨身茶事'],
    portfolio: [
      { client: 'Wahmi', desc: 'Q1 GTM Reels × 8', roas: '+31%', nps: 4.78 },
      { client: 'OAK 草本', desc: 'brand voice 重塑', roas: '+18%', nps: 4.66 },
      { client: '隨身茶事', desc: 'Threads 操盤', roas: '—', nps: 4.85 },
    ],
  },
  {
    id: 'w-jay',
    handle: '@jay.ops',
    name: 'Tier A 操盤 + ROAS Analyst',
    avatar: window.__resources.avEdward,
    role: 'Ops + ROAS Analyst',
    tier: 'A',
    badges: ['Meta Ads', 'GA4'],
    nps: 4.62,
    cases: 0,
    capacity: 5,
    last: '32d',
    voice: 2_300,
    voiceCh: 'Substack',
    domainMatch: 0.74,
    boost: { loyalty: 0, mercy: 10 },
    score: 84,
    breakdown: { load: 25, calendar: 19, tier: 10, nps: 13, domain: 11, voice: 2, boost: 14 },
    blurb: '排程 + 成效操盤手。3 月內無接案 → 反馬太 +10 加成。',
    works: ['Bloomist', 'Fluent', 'Rinsen'],
    portfolio: [
      { client: 'Bloomist', desc: 'Meta + GA4 重建', roas: '+27%', nps: 4.62 },
      { client: 'Fluent', desc: 'monthly ROAS read', roas: '+14%', nps: 4.55 },
      { client: 'Rinsen', desc: 'performance ops', roas: '+19%', nps: 4.7 },
    ],
  },
  {
    id: 'w-noa',
    handle: '@noa.studio',
    name: 'Tier A 視覺工作室',
    avatar: window.__resources.avEdward,
    role: 'Visual',
    tier: 'A',
    badges: ['DTC', 'Editorial'],
    nps: 4.40,
    cases: 3,
    capacity: 4,
    last: '2d',
    voice: 9_800,
    voiceCh: 'IG',
    domainMatch: 0.79,
    boost: { loyalty: 0, mercy: 0 },
    score: 76,
    breakdown: { load: 6, calendar: 16, tier: 10, nps: 12, domain: 12, voice: 4, boost: 0 },
    blurb: '兩人視覺工作室、目前已 3 案在跑，capacity 偏緊。',
    works: ['Maru', 'Habit-Lab'],
    portfolio: [
      { client: 'Maru', desc: 'packaging KV', roas: '+12%', nps: 4.4 },
      { client: 'Habit-Lab', desc: 'editorial 系列', roas: '—', nps: 4.55 },
      { client: 'AURA Skincare', desc: 'Q3 試做案', roas: '+9%', nps: 4.21 },
    ],
  },
  {
    id: 'w-ren',
    handle: '@ren.copy',
    name: 'Tier A B2B 文案',
    avatar: window.__resources.avEdward,
    role: 'Copy',
    tier: 'A',
    badges: ['B2B', 'GTM'],
    nps: 4.55,
    cases: 1,
    capacity: 3,
    last: '8d',
    voice: 1_100,
    voiceCh: '—',
    domainMatch: 0.41,
    boost: { loyalty: 0, mercy: 0 },
    score: 64,
    breakdown: { load: 17, calendar: 14, tier: 10, nps: 13, domain: 6, voice: 1, boost: 0 },
    blurb: '主力 B2B SaaS、DTC 經驗較少，列為候補。',
    works: ['Shipfox', 'Dataply'],
    portfolio: [
      { client: 'Shipfox', desc: 'B2B GTM 文案', roas: '+8%', nps: 4.55 },
      { client: 'Dataply', desc: 'lifecycle email', roas: '—', nps: 4.48 },
      { client: 'Ondine 保養', desc: 'DTC 試做', roas: '—', nps: 4.3 },
    ],
  },
];

// Suggested 2-expert pairing
const SUGGESTED_PAIR = ['w-arc', 'w-mei', 'w-jay'];

// ────────────────────────────────────────────────────────
// 2026-05-18 v2 · VERTICAL_DEMO_MAP · 每個 vertical 對應 demo data
// Edward 5/18「未來所有案件類型都檢查」拍板
// DTC 用既有 5 workers (含 portfolio)、其他 14 vertical 用 generic template
// ────────────────────────────────────────────────────────

function genericWorker(id, name, role, tier, badges, score, domainMatch, vertical) {
  return {
    id, handle: '@' + id, name, avatar: window.__resources.avEdward, role, tier, badges,
    nps: tier === 'A+' ? 4.78 : 4.62, cases: tier === 'A+' ? 18 : 12, capacity: 3, last: '12d',
    voice: tier === 'A+' ? 14_000 : 4_500, voiceCh: 'Substack',
    domainMatch, boost: { loyalty: 0, mercy: 0 }, score,
    breakdown: { load: 20, calendar: 18, tier: tier === 'A+' ? 14 : 10, nps: 13, domain: Math.round(domainMatch * 15), voice: 4, boost: 5 },
    blurb: role.split(' · ')[0] + ' 領域 · BeyondPath Tier ' + tier + ' 認證 worker。',
    works: [vertical + ' 過往案例 1', vertical + ' 過往案例 2', vertical + ' 過往案例 3'],
    portfolio: [
      { client: vertical + ' Client A', desc: vertical + ' 案例展示', roas: '+15%', nps: tier === 'A+' ? 4.78 : 4.62 },
      { client: vertical + ' Client B', desc: vertical + ' 試做案', roas: '+8%', nps: tier === 'A+' ? 4.65 : 4.4 },
    ],
  };
}

function genericParse(vertical_en, vertical_zh, industry_zh, scope, tasks, totalHours, budgetLo, budgetHi) {
  return {
    industry: { en: industry_zh, zh: industry_zh, confidence: 0.91 },
    scope,
    tasks,
    recommendedTier: 'A+',
    vertical: vertical_en,
    totalHours,
    budget: { lo: budgetLo, hi: budgetHi, currency: 'NT$' },
    contractType: { en: 'Trial Project', zh: '試做案', alt: '可轉月度維護 retainer' },
    flags: [
      { kind: 'ok', text: '需求邊界清楚、' + vertical_zh + ' 領域' },
      { kind: 'warn', text: '建議 2-3 expert 共案' },
      { kind: 'info', text: '完成後可擴月度維護 retainer' },
    ],
  };
}

const VERTICAL_DEMO_MAP = {
  // ═══════════ DTC (既有 5 workers · 含 portfolio) ═══════════
  dtc: {
    brief: SAMPLE_BRIEF,
    parse: AI_PARSE_RESULT,
    workers: WORKERS,
    suggestedPair: SUGGESTED_PAIR,
  },

  // ═══════════ 主要 5 vertical · unique brief + workers ═══════════

  software: {
    brief: `# B2B SaaS 內部工具 · 銷售管理儀表板

我們是 30 人 B2B SaaS 公司、銷售部門用 Notion + Google Sheet 手動追 pipeline、想自建內部工具。

需求：
- 串接 HubSpot CRM API 抓 deal data
- 自建 React + TypeScript dashboard
- 銷售 KPI 視覺化（funnel / win-rate / ACV / CAC payback）
- 跟 Slack 整合（高金額 deal stage 變動自動通知）

預算：彈性、中等以上。
時間：6 週內可上線使用。
要求：能用 modern stack（TypeScript / Next.js）。`,
    parse: genericParse('Custom Software Development', '客製化軟體開發', 'B2B SaaS · 內部工具', 'custom-software',
      [
        { id: 't1', en: 'HubSpot API', zh: 'HubSpot API 整合', hours: 16, role: 'Backend', tier: 'A+' },
        { id: 't2', en: 'React Dashboard', zh: 'React Dashboard 前端', hours: 32, role: 'Frontend', tier: 'A+' },
        { id: 't3', en: 'KPI Viz', zh: 'KPI 視覺化', hours: 20, role: 'Frontend', tier: 'A' },
        { id: 't4', en: 'Slack Webhook', zh: 'Slack 整合', hours: 8, role: 'Backend', tier: 'A' },
      ], 76, 280_000, 380_000),
    workers: [
      genericWorker('w-soft-1', 'Tier A+ 全端工程師', 'Full-stack · React + Node', 'A+', ['TypeScript', 'B2B SaaS'], 92, 0.94, '軟體開發'),
      genericWorker('w-soft-2', 'Tier A+ 前端架構師', 'Frontend Architect', 'A+', ['React', 'Dashboard'], 88, 0.88, '軟體開發'),
      genericWorker('w-soft-3', 'Tier A DevOps 工程師', 'DevOps + Backend', 'A', ['Vercel', 'GCP'], 81, 0.78, '軟體開發'),
    ],
    suggestedPair: ['w-soft-1', 'w-soft-2', 'w-soft-3'],
  },

  design: {
    brief: `# 設計品牌 × AI · 全新品牌系統建立

新創、要從零打造一個 D2C 品牌（食品類）。

需求：
- Brand DNA 工作坊
- Logo + 識別系統（含使用規範 PDF）
- 包裝設計 × 4 SKU
- 訓練品牌專屬 GPTs

預算：彈性、中高端。
時間：10 週內交付。`,
    parse: genericParse('Design × Brand DNA', '設計品牌 × AI', '品牌設計', 'brand-system',
      [
        { id: 't1', en: 'Brand DNA', zh: 'Brand DNA 工作坊', hours: 6, role: 'Strategy', tier: 'A+' },
        { id: 't2', en: 'Identity System', zh: 'Logo + 識別系統', hours: 28, role: 'Visual', tier: 'A+' },
        { id: 't3', en: 'Packaging × 4', zh: '包裝設計 × 4', hours: 32, role: 'Visual', tier: 'A+' },
        { id: 't4', en: 'Brand GPTs', zh: '品牌 GPTs 訓練', hours: 10, role: 'AI', tier: 'A' },
      ], 76, 320_000, 480_000),
    workers: [
      genericWorker('w-design-1', 'Tier A+ 品牌設計師', 'Brand DNA + Identity', 'A+', ['Brand DNA', 'Identity'], 93, 0.94, '設計'),
      genericWorker('w-design-2', 'Tier A+ 包裝設計師', 'Packaging Specialist', 'A+', ['Packaging', 'Print'], 89, 0.91, '設計'),
      genericWorker('w-design-3', 'Tier A AI 視覺工程師', 'AI Visual + GPTs', 'A', ['Midjourney', 'Claude'], 82, 0.82, '設計'),
    ],
    suggestedPair: ['w-design-1', 'w-design-2', 'w-design-3'],
  },

  video: {
    brief: `# 短影音 · 個人品牌 KOL 內容工廠

5 萬粉個人品牌 KOL（教育類）、想建立穩定短影音產線、每週 3-5 支 Reels。

需求：
- 腳本撰寫（每週 5 主題、跟我們 GPTs 對接）
- 拍攝 + 後製剪輯（每支 60s 內）
- AI 配音 / 字幕（中英雙語）
- 排程到 IG Reels + TikTok + YT Shorts

預算：月費 retainer 30-60k。
時間：第一個月內穩定產線。`,
    parse: genericParse('Short-form Video', '短影音 · 剪輯', '個人品牌短影音', 'video-content',
      [
        { id: 't1', en: 'Weekly Script', zh: '週腳本 × 5', hours: 16, role: 'Copy', tier: 'A+' },
        { id: 't2', en: 'Video Edit', zh: '剪輯 × 5', hours: 20, role: 'Video', tier: 'A+' },
        { id: 't3', en: 'AI VO + 字幕', zh: 'AI 配音 + 雙語字幕', hours: 8, role: 'AI', tier: 'A' },
        { id: 't4', en: '3-Platform Sched', zh: '三平台排程', hours: 6, role: 'Ops', tier: 'A' },
      ], 50, 36_000, 54_000),
    workers: [
      genericWorker('w-vid-1', 'Tier A+ 短影音剪輯師', 'Video Editor · Reels', 'A+', ['Reels', 'TikTok'], 92, 0.93, '短影音'),
      genericWorker('w-vid-2', 'Tier A+ 腳本專家', 'Script Writer · KOL', 'A+', ['Reels Script', 'GPTs'], 88, 0.89, '短影音'),
      genericWorker('w-vid-3', 'Tier A AI 配音工程師', 'AI Voice + Subtitle', 'A', ['ElevenLabs', '雙語'], 80, 0.81, '短影音'),
    ],
    suggestedPair: ['w-vid-1', 'w-vid-2', 'w-vid-3'],
  },

  agent: {
    brief: `# AI Agent · 中小企業客戶服務自動化

台灣中型電商（年營收 1 億）、客服每天 200-300 訊息、想自建 AI agent。

需求：
- 訓練專屬 RAG agent（用我們既有 FAQ + 訂單 system）
- LINE OA + 官網 chat 接入
- Multi-agent（接單 / 退換貨 / 商品推薦 三 agent 分流）
- 後台 human-in-loop 介面

預算：月費 retainer 60-100k + 初期 build 80-150k。
時間：8 週內第一版上線。`,
    parse: genericParse('AI Agent / Chatbot', 'AI Agent · Chatbot', '電商 AI Agent', 'ai-agent-build',
      [
        { id: 't1', en: 'RAG Build', zh: 'RAG 建置 + FAQ 灌入', hours: 24, role: 'AI', tier: 'A+' },
        { id: 't2', en: 'Multi-agent', zh: 'Multi-agent 路由', hours: 18, role: 'AI', tier: 'A+' },
        { id: 't3', en: 'LINE + Web', zh: 'LINE OA + Web Chat 接入', hours: 14, role: 'Backend', tier: 'A' },
        { id: 't4', en: 'Human-in-loop', zh: '人工接手介面', hours: 16, role: 'Frontend', tier: 'A' },
      ], 72, 80_000, 150_000),
    workers: [
      genericWorker('w-agent-1', 'Tier A+ AI Agent 架構師', 'RAG + Multi-agent', 'A+', ['LangChain', 'RAG'], 93, 0.94, 'AI Agent'),
      genericWorker('w-agent-2', 'Tier A+ 前端 + Chat UI', 'Chat UI + Admin', 'A+', ['React', 'Chat UI'], 87, 0.86, 'AI Agent'),
      genericWorker('w-agent-3', 'Tier A LLM Ops 工程師', 'LLM Ops + Prompt', 'A', ['Prompt Eng', 'LangSmith'], 79, 0.79, 'AI Agent'),
    ],
    suggestedPair: ['w-agent-1', 'w-agent-2', 'w-agent-3'],
  },

  mkt: {
    brief: `# 行銷服務 · 新創 B2B SaaS 從 0 到 1 操盤

pre-PMF B2B SaaS、現有 30 個 paying customer、想找全套行銷操盤手做季度增長。

需求：
- ICP 訪談 + GTM playbook 寫定
- 廣告投放（LinkedIn + Google + Meta、月 budget 30 萬）
- Content marketing（每週 2 篇 case study + 1 篇 thought leadership）
- 數據儀表板（CAC / LTV / Pipeline velocity）

預算：月費 retainer 80-150k + 廣告預算 separate。
時間：3 個月一季、依結果續約。`,
    parse: genericParse('Marketing Service', '行銷服務', 'B2B SaaS 行銷', 'marketing-ops',
      [
        { id: 't1', en: 'ICP + GTM', zh: 'ICP 訪談 + GTM playbook', hours: 18, role: 'Strategy', tier: 'A+' },
        { id: 't2', en: 'Ad Ops × 3', zh: '三平台廣告操盤', hours: 32, role: 'Ads', tier: 'A+' },
        { id: 't3', en: 'Content × 12', zh: 'Content 月產 12 篇', hours: 28, role: 'Copy', tier: 'A' },
        { id: 't4', en: 'Dashboard', zh: '數據儀表板', hours: 12, role: 'Data', tier: 'A' },
      ], 90, 80_000, 150_000),
    workers: [
      genericWorker('w-mkt-1', 'Tier A+ B2B SaaS 操盤手', 'GTM Strategy + Ads', 'A+', ['B2B SaaS', 'GTM'], 91, 0.93, '行銷'),
      genericWorker('w-mkt-2', 'Tier A+ B2B Content Lead', 'Content + TL', 'A+', ['B2B', 'Case Study'], 87, 0.88, '行銷'),
      genericWorker('w-mkt-3', 'Tier A Marketing Analyst', 'Marketing Data', 'A', ['GA4', 'Looker'], 82, 0.82, '行銷'),
    ],
    suggestedPair: ['w-mkt-1', 'w-mkt-2', 'w-mkt-3'],
  },

  // ═══════════ 9 個 secondary vertical · generic template (簡短 brief + 3 generic workers) ═══════════

  web: {
    brief: `# 網頁設計 + 切版 · 品牌官網 + 3 LP\n\n5 人新創、需要全新品牌官網 + 3 個 LP。`,
    parse: genericParse('Web Design × Build', '網頁設計 + 切版', '網頁設計', 'web-build',
      [{ id: 't1', en: 'Figma Design', zh: 'Figma 設計', hours: 28, role: 'Visual', tier: 'A+' },
       { id: 't2', en: 'Webflow Build', zh: '切版', hours: 32, role: 'Frontend', tier: 'A' }],
      60, 240_000, 360_000),
    workers: [
      genericWorker('w-web-1', 'Tier A+ 網頁設計師', 'Web Designer · Figma', 'A+', ['Figma', 'Webflow'], 92, 0.92, '網頁設計'),
      genericWorker('w-web-2', 'Tier A+ 前端工程師', 'Frontend · Webflow', 'A+', ['Webflow', 'Next.js'], 88, 0.88, '網頁設計'),
      genericWorker('w-web-3', 'Tier A SEO 工程師', 'SEO Setup', 'A', ['SEO', 'Schema'], 80, 0.81, '網頁設計'),
    ],
    suggestedPair: ['w-web-1', 'w-web-2', 'w-web-3'],
  },

  system: {
    brief: `# 客製化系統開發 · 中小企業 ERP / CRM 客製\n\n傳產製造業（年營收 5 億）、現有 ERP（Odoo）需要客製模組 + CRM 整合。`,
    parse: genericParse('Custom System Build', '客製化系統', '客製化系統', 'custom-system',
      [{ id: 't1', en: 'Odoo Module', zh: 'Odoo 模組開發', hours: 40, role: 'Backend', tier: 'A+' },
       { id: 't2', en: 'CRM Sync', zh: 'CRM 雙向同步', hours: 18, role: 'Backend', tier: 'A+' }],
      58, 380_000, 580_000),
    workers: [
      genericWorker('w-sys-1', 'Tier A+ Odoo 工程師', 'Backend · Odoo', 'A+', ['Odoo', 'ERP'], 91, 0.91, '系統開發'),
      genericWorker('w-sys-2', 'Tier A+ 整合工程師', 'API + Sync', 'A+', ['HubSpot', 'API'], 87, 0.86, '系統開發'),
      genericWorker('w-sys-3', 'Tier A Mobile 工程師', 'iOS / Android', 'A', ['React Native', 'Mobile'], 81, 0.82, '系統開發'),
    ],
    suggestedPair: ['w-sys-1', 'w-sys-2', 'w-sys-3'],
  },

  data: {
    brief: `# 數據分析 · BI Dashboard 自建\n\nD2C 電商（年營收 8000 萬）、想自建 BI dashboard 看完整數據。`,
    parse: genericParse('Data × BI Dashboard', '數據分析 BI', '電商 BI', 'data-bi',
      [{ id: 't1', en: 'ETL Setup', zh: 'ETL 建置', hours: 20, role: 'Data', tier: 'A+' },
       { id: 't2', en: 'BI Dashboard', zh: 'Dashboard 視覺化', hours: 24, role: 'Data', tier: 'A' }],
      44, 220_000, 320_000),
    workers: [
      genericWorker('w-data-1', 'Tier A+ Data Engineer', 'ETL + BigQuery', 'A+', ['BigQuery', 'dbt'], 91, 0.91, '數據'),
      genericWorker('w-data-2', 'Tier A+ BI Analyst', 'Dashboard + Looker', 'A+', ['Looker', 'GA4'], 87, 0.87, '數據'),
      genericWorker('w-data-3', 'Tier A 歸因專家', 'AI Attribution', 'A', ['ROAS', 'Attribution'], 81, 0.82, '數據'),
    ],
    suggestedPair: ['w-data-1', 'w-data-2', 'w-data-3'],
  },

  b2b: {
    brief: `# B2B SaaS · GTM 策略 + 銷售 playbook\n\nSeed 階段 B2B SaaS、需要從 0 建 GTM 策略 + sales playbook + 第一波 outbound。`,
    parse: genericParse('B2B SaaS · GTM', 'B2B SaaS GTM', 'B2B SaaS GTM', 'gtm-strategy',
      [{ id: 't1', en: 'ICP Interview', zh: 'ICP 訪談', hours: 24, role: 'Strategy', tier: 'A+' },
       { id: 't2', en: 'Sales Playbook', zh: 'Sales playbook', hours: 18, role: 'Strategy', tier: 'A+' }],
      42, 200_000, 300_000),
    workers: [
      genericWorker('w-b2b-1', 'Tier A+ B2B SaaS Strategist', 'GTM + Sales Strategy', 'A+', ['B2B SaaS', 'GTM'], 92, 0.92, 'B2B SaaS'),
      genericWorker('w-b2b-2', 'Tier A+ Sales Ops', 'Outbound + Apollo', 'A+', ['Apollo', 'Outbound'], 88, 0.87, 'B2B SaaS'),
      genericWorker('w-b2b-3', 'Tier A Demo Coach', 'Sales Training', 'A', ['Demo', 'Discovery'], 82, 0.83, 'B2B SaaS'),
    ],
    suggestedPair: ['w-b2b-1', 'w-b2b-2', 'w-b2b-3'],
  },

  research: {
    brief: `# 品牌市場調研 · 新品上市前消費者訪談\n\n即將上市的新品牌、需要消費者調研 + 競品分析 + persona 建立。`,
    parse: genericParse('Brand × Market Research', '品牌市場調研', '品牌調研', 'consumer-research',
      [{ id: 't1', en: 'Interview', zh: '訪談 × 30', hours: 36, role: 'Research', tier: 'A+' },
       { id: 't2', en: 'Competitor', zh: '競品分析', hours: 18, role: 'Strategy', tier: 'A' }],
      54, 280_000, 420_000),
    workers: [
      genericWorker('w-res-1', 'Tier A+ 消費者研究員', 'Consumer Interview', 'A+', ['Interview', 'Thematic'], 92, 0.93, '品牌調研'),
      genericWorker('w-res-2', 'Tier A+ AI 研究分析師', 'AI Research + Coding', 'A+', ['AI Coding', 'NVivo'], 88, 0.88, '品牌調研'),
      genericWorker('w-res-3', 'Tier A 市場分析師', 'Competitor + Pricing', 'A', ['Competitor', 'Survey'], 82, 0.82, '品牌調研'),
    ],
    suggestedPair: ['w-res-1', 'w-res-2', 'w-res-3'],
  },

  seo: {
    brief: `# SEO · 內容營運 · 中文 SaaS 長尾佈局\n\nB2B SaaS 生產力工具類、6 個月 organic 從 0 到 3 萬月 UV 目標。`,
    parse: genericParse('SEO / Content Ops', 'SEO 內容', 'SEO 內容營運', 'seo-content',
      [{ id: 't1', en: 'Topical Plan', zh: 'Topical 規劃', hours: 16, role: 'SEO', tier: 'A+' },
       { id: 't2', en: 'Content × 20', zh: '月文 × 20', hours: 60, role: 'Copy', tier: 'A' }],
      76, 40_000, 80_000),
    workers: [
      genericWorker('w-seo-1', 'Tier A+ SEO Strategist', 'Topical Authority', 'A+', ['SEO', 'SERP'], 91, 0.92, 'SEO'),
      genericWorker('w-seo-2', 'Tier A AI Content Writer', 'AI Content + Edit', 'A', ['AI Content', 'Edit'], 84, 0.85, 'SEO'),
      genericWorker('w-seo-3', 'Tier A Technical SEO', 'Schema + Internal Link', 'A', ['Schema', 'Crawl'], 80, 0.81, 'SEO'),
    ],
    suggestedPair: ['w-seo-1', 'w-seo-2', 'w-seo-3'],
  },

  cs: {
    brief: `# 客服自動化 · 中小型 SaaS 24/7 客服\n\nD2C SaaS（教育類）、每天 100-200 訊息、想自建 multi-agent 客服。`,
    parse: genericParse('CS Automation', '客服自動化', '客服自動化', 'cs-bot',
      [{ id: 't1', en: 'KB + RAG', zh: 'KB + RAG 建置', hours: 18, role: 'AI', tier: 'A+' },
       { id: 't2', en: 'Multi-agent', zh: 'Multi-agent 路由', hours: 12, role: 'AI', tier: 'A+' }],
      30, 50_000, 80_000),
    workers: [
      genericWorker('w-cs-1', 'Tier A+ AI 客服架構師', 'RAG + Multi-agent', 'A+', ['LangChain', 'Intercom'], 92, 0.92, '客服'),
      genericWorker('w-cs-2', 'Tier A 前端工程師', 'Human-in-loop UI', 'A', ['React', 'Intercom UI'], 84, 0.85, '客服'),
      genericWorker('w-cs-3', 'Tier A LLM Ops', 'Prompt + NPS', 'A', ['Prompt Eng', 'NPS'], 80, 0.81, '客服'),
    ],
    suggestedPair: ['w-cs-1', 'w-cs-2', 'w-cs-3'],
  },

  localize: {
    brief: `# 翻譯 · 在地化 · SaaS 多語上架\n\nSaaS 英文版上線後想做繁中 / 簡中 / 日文 / 韓文 4 語上架。`,
    parse: genericParse('Translation / Localization', '翻譯在地化', '翻譯在地化', 'localization',
      [{ id: 't1', en: 'UI Translation', zh: 'UI × 4 語', hours: 32, role: 'Translation', tier: 'A+' },
       { id: 't2', en: 'Native QA', zh: 'Native 潤稿', hours: 24, role: 'Translation', tier: 'A+' }],
      56, 280_000, 380_000),
    workers: [
      genericWorker('w-loc-1', 'Tier A+ 在地化專家', 'Localization Lead', 'A+', ['UI Translation', 'CAT'], 91, 0.92, '翻譯'),
      genericWorker('w-loc-2', 'Tier A+ 多語 QA', 'Native Speaker QA', 'A+', ['ZH', 'JA', 'KO'], 87, 0.88, '翻譯'),
      genericWorker('w-loc-3', 'Tier A 多語 SEO', 'Multi-lang SEO', 'A', ['hreflang', 'i18n'], 80, 0.81, '翻譯'),
    ],
    suggestedPair: ['w-loc-1', 'w-loc-2', 'w-loc-3'],
  },

  other: {
    brief: `# 其他類型案件\n\n不在當前 14 個 vertical 內的案件、平台客服 24h 內人工分類、配對對應領域的 worker。請在下方輸入你的需求。`,
    parse: {
      industry: { en: 'Other / Custom', zh: '其他 / 客製', confidence: 0.50 },
      scope: 'manual-review',
      tasks: [
        { id: 't1', en: 'Manual Review', zh: '人工分類 + 評估', hours: 4, role: 'Strategy', tier: 'A+' },
        { id: 't2', en: 'Worker Sourcing', zh: 'Worker 配對', hours: 8, role: 'Ops', tier: 'A' },
      ],
      recommendedTier: 'A+', vertical: 'Other', totalHours: 12,
      budget: { lo: 0, hi: 0, currency: 'NT$', model: 'TBD' },
      contractType: { en: 'Custom Quote', zh: '客製報價', alt: '24h 內 BeyondPath 團隊評估' },
      flags: [
        { kind: 'info', text: '其他類別 · 平台客服 24h 內接觸你' },
        { kind: 'info', text: '配對方案 + 報價區間 + 時程會在 email 給' },
      ],
    },
    workers: [
      genericWorker('w-other-1', 'BeyondPath 平台客服', 'Custom Routing', 'A+', ['Manual', 'Custom'], 90, 0.50, '其他'),
    ],
    suggestedPair: ['w-other-1'],
  },
};

// ════════════════════════════════════════════════════════════
// 2026-05-29 calcifer · 交付物「翻人話」(doc 29 霍爾設計 · Edward 5/29 拍板 B)
//   破洞①: deliverablesFor() 原本直接丟 parse.tasks[].zh = 工程術語
//   解法: DELIVERABLE_HUMAN 對照表 · key = 工程詞 zh · value = { human, tech }
//     human = 客戶看得懂的成果語言 (大字 · 講你會得到什麼結果)
//     tech  = 原工程詞 (小灰註腳 · 給內行客戶/接案者看 · 不刪只降級)
//   全 15 vertical task zh 覆蓋 · doc 29 起草 5 個 · 其餘照同風格補
// ════════════════════════════════════════════════════════════
var DELIVERABLE_HUMAN = {
  // -- DTC --
  "主視覺 KV":       { human: "上架就能用的品牌主視覺",           tech: "Visual KV × 2" },
  "短影音腳本":       { human: "照著拍就行的短影音腳本",           tech: "Reels Script × 6" },
  "產品長文案":       { human: "官網 / EDM / LP 都能直接用的產品文案", tech: "Product Copy × 3" },
  "排程上架":         { human: "幫你排好各平台的發布時間，不用一個個傳", tech: "Channel Scheduling" },
  "成效分析報告":     { human: "一份看得懂的成效報告，知道錢花得值不值", tech: "ROAS Read-out" },
  // -- 軟體開發 --
  "HubSpot API 整合":  { human: "你的客戶與成交資料自動同步進系統（不用再手動貼 Excel）", tech: "HubSpot API 整合" },
  "React Dashboard 前端": { human: "一個你自己就能打開看的銷售儀表板", tech: "React + TypeScript Dashboard" },
  "KPI 視覺化":        { human: "業績漏斗、成交率、回本天數，一眼看懂的圖表", tech: "KPI Visualization" },
  "Slack 整合":        { human: "大金額訂單一有動靜，自動發訊息通知你的團隊", tech: "Slack Webhook" },
  // -- 設計品牌 --
  "Brand DNA 工作坊":  { human: "把想成為什麼樣的品牌講清楚的一場深談 + 一份定位文件", tech: "Brand DNA Workshop" },
  "Logo + 識別系統":   { human: "你的 Logo、配色、字體，加一份怎麼用才不會走樣的手冊", tech: "Identity System" },
  "包裝設計 × 4":      { human: "4 款產品的完整包裝設計稿（可直接送印）", tech: "Packaging × 4" },
  "品牌 GPTs 訓練":    { human: "一個會用你品牌口吻寫東西的專屬 AI 助手",   tech: "Brand GPTs" },
  // -- 短影音 --
  "週腳本 × 5":        { human: "每週 5 支影片的腳本，照著拍就行",         tech: "Weekly Script × 5" },
  "剪輯 × 5":          { human: "每週 5 支剪好可直接上架的成片",           tech: "Video Edit × 5" },
  "AI 配音 + 雙語字幕": { human: "中英雙語配音與字幕，做完直接給海外觀眾看", tech: "AI VO + 雙語字幕" },
  "三平台排程":        { human: "幫你排好 IG / TikTok / YouTube 的發布時間", tech: "3-Platform Sched" },
  // -- AI Agent --
  "RAG 建置 + FAQ 灌入": { human: "一個讀過你所有 FAQ、答得出客戶問題的 AI 客服", tech: "RAG Build + FAQ" },
  "Multi-agent 路由":  { human: "接單、退換貨、推薦商品分開處理，問什麼接對人", tech: "Multi-agent Routing" },
  "LINE OA + Web Chat 接入": { human: "你的 LINE 官方帳號跟官網都能用這個 AI 客服", tech: "LINE OA + Web Chat" },
  "人工接手介面":      { human: "AI 答不了的時候，你的真人客服可以一鍵接手", tech: "Human-in-loop" },
  // -- 行銷增長 --
  "ICP 訪談 + GTM playbook": { human: "訪談你的真實客戶 + 一份怎麼把產品賣出去的操作手冊", tech: "ICP + GTM Playbook" },
  "三平台廣告操盤":    { human: "三大平台的廣告操盤，每月幫你帶進新名單",   tech: "Ad Ops × 3" },
  "Content 月產 12 篇": { human: "每月 12 篇行銷內容（案例 + 觀點文）幫你帶流量", tech: "Content × 12" },
  "數據儀表板":        { human: "每月一份看得懂的成效報告，知道錢花在哪、帶來什麼", tech: "Marketing Dashboard" },
  // -- 網頁設計 --
  "Figma 設計":        { human: "你品牌官網 + LP 的完整設計稿（可直接交給工程切版）", tech: "Figma Design" },
  "切版":             { human: "一個做好、可直接上線、手機電腦都好看的網站", tech: "Webflow / Front-end Build" },
  // -- 客製化系統 --
  "Odoo 模組開發":     { human: "照你流程客製的 ERP 模組，做完直接在你公司系統用", tech: "Odoo Module" },
  "CRM 雙向同步":      { human: "你的 CRM 跟 ERP 資料自動雙向更新，不用兩邊重打", tech: "CRM Sync" },
  // -- 數據 BI --
  "ETL 建置":          { human: "把你散在各處的資料自動匯整到一個地方",     tech: "ETL Setup" },
  "Dashboard 視覺化":  { human: "一個你自己就能登入看完整生意數據的儀表板", tech: "BI Dashboard" },
  // -- B2B GTM --
  "ICP 訪談":          { human: "訪談你的真實客戶，整理成他們為什麼買的報告", tech: "ICP Interview" },
  "Sales playbook":    { human: "一份業務照著做就能談成的銷售操作手冊", tech: "Sales Playbook" },
  // -- 品牌調研 --
  "訪談 × 30":         { human: "訪談 30 位真實消費者，整理成決策洞察報告", tech: "Interview × 30" },
  "競品分析":          { human: "一份對手在做什麼、你的機會在哪的競品報告", tech: "Competitor Analysis" },
  // -- SEO --
  "Topical 規劃":      { human: "一份該寫哪些主題才會被搜尋到的內容地圖", tech: "Topical Plan" },
  "月文 × 20":         { human: "每月 20 篇能被 Google 搜到的內容文章",     tech: "Content × 20" },
  // -- 客服自動化 --
  "KB + RAG 建置":     { human: "一個讀過你知識庫、答得出客戶問題的 AI 客服", tech: "KB + RAG Build" },
  // -- 翻譯在地化 --
  "UI × 4 語":         { human: "你產品介面的繁中 / 簡中 / 日 / 韓 4 語版本", tech: "UI Translation × 4" },
  "Native 潤稿":       { human: "母語人士潤過的譯文，讀起來像當地人寫的",   tech: "Native QA" },
  // -- 其他 --
  "人工分類 + 評估":   { human: "BeyondPath 團隊幫你判斷需求 + 給配對方案", tech: "Manual Review" },
  "Worker 配對":       { human: "配對到最適合你這個案子的認證接案者",       tech: "Worker Sourcing" },
};

// 工程詞 zh -> 成果語言 (找不到就回原工程詞 · 確保不漏)
function humanizeDeliverable(zh) {
  var m = DELIVERABLE_HUMAN[zh];
  return (m && m.human) ? m.human : zh;
}

// 2026-05-29 calcifer Q2 (升級) · deliverables = 成果語言陣列 (人話)
//   回 string 陣列維持向後相容 (Step3 badges chip 用 string key / includes)
function deliverablesFor(demo) {
  var tasks = (demo && demo.parse && demo.parse.tasks) || [];
  var out = [];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i] && tasks[i].zh) out.push(humanizeDeliverable(tasks[i].zh));
  }
  return out;
}

// 交付物 4 件套 meta · UI 顯示 成果語言(大) + 技術註腳(小灰) 用
//   回 [{ human, tech }] · 跟 deliverablesFor() 同序
function deliverableMetaFor(demo) {
  var tasks = (demo && demo.parse && demo.parse.tasks) || [];
  var out = [];
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    if (!t || !t.zh) continue;
    var m = DELIVERABLE_HUMAN[t.zh];
    out.push({ human: (m && m.human) ? m.human : t.zh, tech: (m && m.tech) ? m.tech : (t.en || t.zh) });
  }
  return out;
}

// ════════════════════════════════════════════════════════════
// 2026-05-29 calcifer · 交付邊界 A/B (doc 30 蕪菁頭調研 · Edward 5/29 拍板 B)
//   PMF 先支援 A (交付成果) + B (交付 + 協助上線) · C/D 暫不做
//   軟體/開發類 = 完整文案 · 非軟體類 (設計/內容/SEO) = 簡化版對應
// ════════════════════════════════════════════════════════════
var DELIVERY_SCOPE_OPTIONS = {
  // 軟體 / 系統 / Agent / 數據 / 網頁 · 需界定交付到哪
  build: [
    { id: "A", en: "Deliverable only", zh: "交付成果", desc: "交付檔案 / 程式 / 帳號，後續我自己處理" },
    { id: "B", en: "Deliver + go-live", zh: "交付 + 協助上線", desc: "交付後協助上線、確認真的能用" },
  ],
  // 設計 / 內容 / 短影音 · 交檔 vs 持續調整
  content: [
    { id: "A", en: "Files only", zh: "交付檔案", desc: "交付完整檔案，後續我自己用" },
    { id: "B", en: "Files + revisions", zh: "交付 + 協助調整", desc: "交付後協助微調、確認可直接使用" },
  ],
};

// vertical id -> 該用哪組交付邊界文案 (預設 build)
var VERTICAL_SCOPE_KIND = {
  dtc: "content", design: "content", video: "content", seo: "content", research: "content", localize: "content",
  software: "build", system: "build", agent: "build", data: "build", web: "build", cs: "build",
  mkt: "build", b2b: "build", other: "build",
};

// 回該 vertical 的交付邊界選項 (A/B) · 給 Step3 Confirm 顯示
function deliveryScopeOptionsFor(verticalId) {
  var kind = VERTICAL_SCOPE_KIND[verticalId] || "build";
  return DELIVERY_SCOPE_OPTIONS[kind] || DELIVERY_SCOPE_OPTIONS.build;
}

function getDemoForVertical(verticalId) {
  var demo = VERTICAL_DEMO_MAP[verticalId] || VERTICAL_DEMO_MAP.dtc;
  // attach deliverables (人話) + meta (人話+技術註腳) derived from parse tasks
  return Object.assign({}, demo, {
    deliverables: deliverablesFor(demo),
    deliverableMeta: deliverableMetaFor(demo),
  });
}

window.BP_DATA = {
  VERTICALS,
  VERTICAL_CATS,
  VERTICAL_DEMO_MAP,
  getDemoForVertical,
  SAMPLE_BRIEF,
  AI_PARSE_RESULT,
  WORKERS,
  SUGGESTED_PAIR,
  // 2026-05-29 calcifer · 交付物人話 + 交付邊界 A/B
  DELIVERABLE_HUMAN,
  humanizeDeliverable,
  deliverableMetaFor,
  deliveryScopeOptionsFor,
  DELIVERY_SCOPE_OPTIONS,
  VERTICAL_SCOPE_KIND,
};
