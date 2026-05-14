-- ============================================================
-- BeyondPath POC · 002 production RLS hardening
-- Author: Calcifer
-- Date: 2026-05-14
-- Purpose: Re-enable RLS on worker_applications + client_intakes
--          and define production-grade policies before beyondpath.tw launch.
-- How to run: paste into Supabase Dashboard -> SQL editor -> Run
-- ============================================================

-- ---------- worker_applications ----------
alter table public.worker_applications enable row level security;

drop policy if exists "worker_apps: own rows" on public.worker_applications;
drop policy if exists "worker_apps: anyone can insert (with auth or anon)" on public.worker_applications;
drop policy if exists "worker_apps: own row update" on public.worker_applications;
drop policy if exists "worker_apps: admin sees all" on public.worker_applications;
drop policy if exists "worker_apps: admin update" on public.worker_applications;

-- SELECT: 用戶看自己 + admin 看全部
create policy "worker_apps_select_self_or_admin"
  on public.worker_applications
  for select
  to anon, authenticated
  using (
    auth.uid() = user_id
    or auth.jwt() ->> 'email' = 'edwardt0303@gmail.com'
  );

-- INSERT: anon + auth 都可送 · 但限制 status 必 pending · email 必填
create policy "worker_apps_insert_open"
  on public.worker_applications
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and email is not null
    and length(email) > 3
  );

-- UPDATE: 用戶改自己未審 row + admin 改全部
create policy "worker_apps_update_self_pending"
  on public.worker_applications
  for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

create policy "worker_apps_update_admin"
  on public.worker_applications
  for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com')
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- DELETE: 只 admin
create policy "worker_apps_delete_admin"
  on public.worker_applications
  for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');


-- ---------- client_intakes ----------
alter table public.client_intakes enable row level security;

drop policy if exists "client_intakes: own rows" on public.client_intakes;
drop policy if exists "client_intakes: anyone can insert" on public.client_intakes;
drop policy if exists "client_intakes: own row update" on public.client_intakes;
drop policy if exists "client_intakes: admin sees all" on public.client_intakes;
drop policy if exists "client_intakes: admin update" on public.client_intakes;

create policy "client_intakes_select_self_or_admin"
  on public.client_intakes
  for select
  to anon, authenticated
  using (
    auth.uid() = user_id
    or auth.jwt() ->> 'email' = 'edwardt0303@gmail.com'
  );

create policy "client_intakes_insert_open"
  on public.client_intakes
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and email is not null
    and length(email) > 3
  );

create policy "client_intakes_update_self_pending"
  on public.client_intakes
  for update
  to authenticated
  using (auth.uid() = user_id and status in ('new','reviewing'))
  with check (auth.uid() = user_id and status in ('new','reviewing'));

create policy "client_intakes_update_admin"
  on public.client_intakes
  for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com')
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

create policy "client_intakes_delete_admin"
  on public.client_intakes
  for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- ---------- verify ----------
-- Run these after to confirm:
-- select schemaname, tablename, rowsecurity
--   from pg_tables where schemaname='public';
-- (rowsecurity 三表都應為 true)
--
-- select tablename, policyname, cmd, roles
--   from pg_policies where schemaname='public'
--   order by tablename, cmd;
