-- BeyondPath POC . 004 worker_decisions table (Q3 Task 4 . 2026-05-20 calcifer)
-- Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md Q3 Task 4
--
-- Adds: worker_decisions table . audit trail for client decisions on workers
-- decision enum: invited / accepted / declined / expired
-- token_hash stores SHA-256 of issued JWT (NOT the JWT itself · avoid leaking)
-- RLS: Admin (Edward) reads all . anon can SELECT own row via token_hash join (for accept/decline link)

create table if not exists public.worker_decisions (
  id uuid primary key default gen_random_uuid(),
  client_intake_id uuid not null references public.client_intakes(id) on delete cascade,
  worker_application_id uuid not null references public.worker_applications(id) on delete cascade,
  decision text not null default 'invited'
    check (decision in ('invited', 'accepted', 'declined', 'expired')),
  token_hash text,
  created_at timestamptz default now(),
  decided_at timestamptz default null
);

create index if not exists worker_decisions_client_intake_idx
  on public.worker_decisions (client_intake_id);

create index if not exists worker_decisions_worker_app_idx
  on public.worker_decisions (worker_application_id);

create index if not exists worker_decisions_token_hash_idx
  on public.worker_decisions (token_hash);

create index if not exists worker_decisions_decision_idx
  on public.worker_decisions (decision);

alter table public.worker_decisions enable row level security;

-- Admin (Edward) sees everything
create policy "worker_decisions: admin sees all" on public.worker_decisions
  for select using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

create policy "worker_decisions: admin update" on public.worker_decisions
  for update using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- Service role (Edge Functions) does all the actual writes . no anon write policy intentionally.
-- Edge Functions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.

comment on table public.worker_decisions is
  'Audit trail for client matching decisions . each row = one invitation sent to one worker';
comment on column public.worker_decisions.decision is
  'invited (default · email sent) . accepted (worker clicked accept) . declined (worker clicked decline) . expired (token TTL passed)';
comment on column public.worker_decisions.token_hash is
  'SHA-256 hex of the signed JWT . used to locate decision row by accept/decline link';
