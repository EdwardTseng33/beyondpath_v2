-- BeyondPath POC . 003 client_intake_match (P1-3 . 2026-05-20 calcifer)
-- Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md Task P1-3
--
-- Adds: client_intakes.match_result (jsonb) . client_intakes.matched_at (timestamptz)
-- Both nullable + default null . backward compatible with existing rows.

alter table public.client_intakes
  add column if not exists match_result jsonb default null;

alter table public.client_intakes
  add column if not exists matched_at timestamptz default null;

create index if not exists client_intakes_match_result_idx
  on public.client_intakes using gin (match_result);

create index if not exists client_intakes_matched_at_idx
  on public.client_intakes (matched_at);

comment on column public.client_intakes.match_result is
  'jsonb: { results: MatchResult[], generated_at, version } . populated by match-workers Edge Function';
comment on column public.client_intakes.matched_at is
  'Timestamp when match-workers Edge Function last produced match_result';
