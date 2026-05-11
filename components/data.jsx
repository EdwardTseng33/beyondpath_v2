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
    name: 'Edward',
    avatar: 'assets/edward.jpg',
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
  },
  {
    id: 'w-mei',
    handle: '@mei.ko',
    name: 'Edward',
    avatar: 'assets/edward.jpg',
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
  },
  {
    id: 'w-jay',
    handle: '@jay.ops',
    name: 'Edward',
    avatar: 'assets/edward.jpg',
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
  },
  {
    id: 'w-noa',
    handle: '@noa.studio',
    name: 'Edward',
    avatar: 'assets/edward.jpg',
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
  },
  {
    id: 'w-ren',
    handle: '@ren.copy',
    name: 'Edward',
    avatar: 'assets/edward.jpg',
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
  },
];

// Suggested 2-expert pairing
const SUGGESTED_PAIR = ['w-arc', 'w-mei', 'w-jay'];

window.BP_DATA = { VERTICALS, VERTICAL_CATS, SAMPLE_BRIEF, AI_PARSE_RESULT, WORKERS, SUGGESTED_PAIR };
