-- BeyondPath POC · 001 initial schema
-- Date: 2026-05-14
-- Tables: profiles, worker_applications, client_intakes
-- All RLS-enabled. Edward (edwardt0303@gmail.com) is the admin who sees everything.

-- ============================================================
-- profiles · 每個 auth.users 對應一個 profile
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text check (role in ('worker', 'client', 'admin')) default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles: own row select" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: own row update" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles: admin sees all" on public.profiles
  for select using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- Auto-create profile when new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- worker_applications · Tier B 認證申請
-- ============================================================
create table if not exists public.worker_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  display_name text,

  -- 對方 AI 整理出的 JSON (Step 2 paste-back)
  ai_proof jsonb,

  -- 抽出來方便 query (從 ai_proof 取的鏡像欄位)
  l_score int check (l_score between 0 and 10),
  verticals text[],
  case_count text,
  tier_suggestion text,

  -- 申請狀態
  status text check (status in ('pending', 'reviewing', 'tier_b', 'tier_b_plus', 'rejected', 'need_more_info')) default 'pending',
  edward_notes text,
  reviewed_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists worker_applications_user_id_idx on public.worker_applications(user_id);
create index if not exists worker_applications_status_idx on public.worker_applications(status);
create index if not exists worker_applications_l_score_idx on public.worker_applications(l_score);

alter table public.worker_applications enable row level security;

create policy "worker_apps: own rows" on public.worker_applications
  for select using (auth.uid() = user_id);

create policy "worker_apps: anyone can insert (with auth or anon)" on public.worker_applications
  for insert with check (true);

create policy "worker_apps: own row update" on public.worker_applications
  for update using (auth.uid() = user_id);

create policy "worker_apps: admin sees all" on public.worker_applications
  for select using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

create policy "worker_apps: admin update" on public.worker_applications
  for update using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- ============================================================
-- client_intakes · Client intake flow 結果
-- ============================================================
create table if not exists public.client_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  company_name text,

  -- Intake 完整資料 (vertical / brief / budget / timeline / acceptance / 等)
  intake_data jsonb,

  -- 抽出來方便 query
  vertical text,
  budget_range text,
  timeline text,

  -- 配對 / 後續
  status text check (status in ('new', 'reviewing', 'matched', 'in_progress', 'closed', 'cancelled')) default 'new',
  selected_worker_id uuid references public.worker_applications(id) on delete set null,
  edward_notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists client_intakes_user_id_idx on public.client_intakes(user_id);
create index if not exists client_intakes_status_idx on public.client_intakes(status);
create index if not exists client_intakes_vertical_idx on public.client_intakes(vertical);

alter table public.client_intakes enable row level security;

create policy "client_intakes: own rows" on public.client_intakes
  for select using (auth.uid() = user_id);

create policy "client_intakes: anyone can insert" on public.client_intakes
  for insert with check (true);

create policy "client_intakes: own row update" on public.client_intakes
  for update using (auth.uid() = user_id);

create policy "client_intakes: admin sees all" on public.client_intakes
  for select using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

create policy "client_intakes: admin update" on public.client_intakes
  for update using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- ============================================================
-- updated_at auto trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists worker_applications_updated_at on public.worker_applications;
create trigger worker_applications_updated_at before update on public.worker_applications
  for each row execute function public.set_updated_at();

drop trigger if exists client_intakes_updated_at on public.client_intakes;
create trigger client_intakes_updated_at before update on public.client_intakes
  for each row execute function public.set_updated_at();
