-- BeyondPath POC . seed_edward_profile (2026-05-28 calcifer)
-- 把 Edward 自己接案者檔案寫進 worker_applications . status='approved' . 進 worker_unified_v 池
--
-- 依據:
--   . 蘇菲 5/28 12:24 draft + Edward 12:54 默許「自治推進」
--   . worker_applications schema (001_initial_schema.sql + 20260520125059_worker_unified.sql)
--   . unified_card 結構 ref: supabase/functions/_shared/worker-schema.ts (aiProofToUnifiedWorker)
--
-- Idempotent:
--   . 用 email 為 dedupe key . 若已存在 update . 否則 insert
--   . 重跑安全 . Edward 可在 Supabase Studio SQL Editor 反覆執行
--
-- Manual deploy: Edward 在 Supabase Studio SQL Editor 跑

-- ============================================================
-- 0. 確保 email unique constraint 存在（ON CONFLICT 前置 · 順序修正 2026-05-29）
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'worker_applications_email_key'
  ) then
    alter table public.worker_applications
      add constraint worker_applications_email_key unique (email);
  end if;
exception when others then
  raise notice 'email unique constraint skipped: %', sqlerrm;
end $$;

-- ============================================================
-- 1. INSERT or UPDATE worker_applications row for Edward
-- ============================================================
insert into public.worker_applications (
  email,
  display_name,
  ai_proof,
  l_score,
  verticals,
  case_count,
  tier_suggestion,
  status,
  unified_card,
  admin_notes
)
values (
  'edwardt0303@gmail.com',
  'Edward Tseng',
  jsonb_build_object(
    'name', 'Edward Tseng',
    'L_score', 9,
    'L_confidence', 'high',
    'tier_suggestion', 'Bplus',
    'evidence_quality', 'high',
    'verticals', jsonb_build_array('agent', 'strategy', 'software'),
    'case_count', '5-10',
    'skill_matrix', jsonb_build_object(
      'workflow_design', 10,
      'tool_orchestration', 10,
      'judgment', 9,
      'domain_depth', 9,
      'client_communication', 8,
      'delivery_reliability', 9
    ),
    'strengths', jsonb_build_array(
      '多 agent 協作系統設計（城堡 7 人 + Cowork 模式）',
      'AI workflow 從零到上線完整交付',
      '產品策略 + PM 視角貫穿、不只技術'
    ),
    'growth', jsonb_build_array(
      '前端視覺實作（深度視覺仰賴卡西法/女巫）',
      '深度資安/合規審查（仰賴沙利曼）'
    ),
    'portfolio', jsonb_build_array(
      jsonb_build_object(
        'client', 'BeyondPath (self)',
        'desc', 'AI native 雙邊接案配對平台、5 維配對演算法 + 邀請信閉環 + Admin Console v0.1、8 週 0 → live',
        'metric', '12 步流程 5 步 live + 整套配對閉環'
      ),
      jsonb_build_object(
        'client', 'Castle AI System',
        'desc', '7 agent 協作架構（蘇菲/霍爾/卡西法/女巫/蕪菁頭/馬魯克/沙利曼）+ 跨裝置記憶 + 24/7 監聽小程式 + L6 自治',
        'metric', '7 agent + 3 主程式庫'
      ),
      jsonb_build_object(
        'client', '多產品分管框架',
        'desc', 'Voice Path / CAREON / BeyondPath 並行、產品護照制 + 燒錢/架構懷疑 Gate 治理',
        'metric', '多產品 portfolio 並行 SOP'
      )
    )
  ),
  9,
  array['agent', 'strategy', 'software'],
  '5-10',
  'Bplus',
  'approved',
  -- ============================================================
  -- unified_card . 照 aiProofToUnifiedWorker 規格手寫 (frontend 不必跑 derive)
  -- ref: supabase/functions/_shared/worker-schema.ts
  -- ============================================================
  jsonb_build_object(
    'id', 'edward-tseng',
    'handle', '@edwardtseng',
    'name', 'Edward Tseng',
    'role', 'Agent + Workflow Expert',
    'tier', 'Bplus',
    'L_score', 9,
    'L_confidence', 'high',
    'skill_matrix', jsonb_build_object(
      'workflow_design', 10,
      'tool_orchestration', 10,
      'judgment', 9,
      'domain_depth', 9,
      'client_communication', 8,
      'delivery_reliability', 9
    ),
    'verticals', jsonb_build_array('agent', 'strategy', 'software'),
    -- badges: vertical 0 (Agent) + skills >=8 (Workflow / Tools / Judgment / Domain / Delivery) + Tier Bplus
    'badges', jsonb_build_array('Agent', 'Workflow', 'Tools', 'Judgment', 'Tier Bplus'),
    'strengths', jsonb_build_array(
      '多 agent 協作系統設計（城堡 7 人 + Cowork 模式）',
      'AI workflow 從零到上線完整交付',
      '產品策略 + PM 視角貫穿、不只技術'
    ),
    'growth', jsonb_build_array(
      '前端視覺實作（深度視覺仰賴卡西法/女巫）',
      '深度資安/合規審查（仰賴沙利曼）'
    ),
    'capacity', 3,
    'rate_range', jsonb_build_object('lo', 0, 'hi', 0),
    'last_active', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'nps', null,
    'cases_completed', 0,
    'case_count_bucket', '5-10',
    'evidence_quality', 'high',
    'portfolio', jsonb_build_array(
      jsonb_build_object(
        'client', 'BeyondPath (self)',
        'desc', 'AI native 雙邊接案配對平台、5 維配對演算法 + 邀請信閉環 + Admin Console v0.1、8 週 0 → live',
        'metric', '12 步流程 5 步 live + 整套配對閉環'
      ),
      jsonb_build_object(
        'client', 'Castle AI System',
        'desc', '7 agent 協作架構（蘇菲/霍爾/卡西法/女巫/蕪菁頭/馬魯克/沙利曼）+ 跨裝置記憶 + 24/7 監聽小程式 + L6 自治',
        'metric', '7 agent + 3 主程式庫'
      ),
      jsonb_build_object(
        'client', '多產品分管框架',
        'desc', 'Voice Path / CAREON / BeyondPath 並行、產品護照制 + 燒錢/架構懷疑 Gate 治理',
        'metric', '多產品 portfolio 並行 SOP'
      )
    ),
    -- blurb: strengths slice(0,2).join(' / ') + '.'
    'blurb', '多 agent 協作系統設計（城堡 7 人 + Cowork 模式） / AI workflow 從零到上線完整交付.',
    -- works: portfolio[0..2].client
    'works', jsonb_build_array('BeyondPath (self)', 'Castle AI System', '多產品分管框架')
  ),
  'seed via 20260528_seed_edward_profile.sql . 自治推進 . 蘇菲 5/28 12:24 draft + Edward 默許'
)
on conflict (email) do update set
  display_name = excluded.display_name,
  ai_proof = excluded.ai_proof,
  l_score = excluded.l_score,
  verticals = excluded.verticals,
  case_count = excluded.case_count,
  tier_suggestion = excluded.tier_suggestion,
  status = excluded.status,
  unified_card = excluded.unified_card,
  admin_notes = excluded.admin_notes,
  updated_at = now();

-- ============================================================
-- Verify: SELECT after seed
-- ============================================================
-- 跑完此 migration 後在 Supabase Studio 跑:
--   select email, status, tier_suggestion, l_score, verticals, unified_card->>'role'
--     from worker_unified_v
--     where email = 'edwardt0303@gmail.com';
-- 應回一筆 row . status=approved . role=Agent + Workflow Expert
