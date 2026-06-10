-- BeyondPath POC . contracts table . Phase 2 signatures (C-1 Phase 2 . 2026-05-28 calcifer)
-- Spec: Edward 拍板「接續開發」. Phase 2 加雙方簽署照片 + SHA-256 hash + 14d JWT tokens
--
-- Phase 2 adds:
--   . client_sign_token / worker_sign_token (14d JWT, signed with JWT_SECRET, payload {contract_id, role, exp})
--   . signature_hash (final hash after both signed: SHA-256 of pdf_hash + client_sig_hash + worker_sig_hash + timestamps)
--   . final_certificate_url (Phase 2 sends a cert PDF + both signature photos via email when complete)
--
-- Note: client_signature_url / worker_signature_url / client_signed_at / worker_signed_at columns
-- were created in 20260528_contracts.sql Phase 1 already. We only add the 3 new cols + RLS for anon-with-token.

alter table public.contracts
  add column if not exists client_sign_token text,
  add column if not exists worker_sign_token text,
  add column if not exists signature_hash text,
  add column if not exists final_certificate_url text,
  add column if not exists client_signature_uploaded_ip text,
  add column if not exists worker_signature_uploaded_ip text;

comment on column public.contracts.client_sign_token is
  '14d JWT signed with JWT_SECRET . payload {contract_id, role:client, kind:contract_sign, exp} . used by contract.html';
comment on column public.contracts.worker_sign_token is
  '14d JWT signed with JWT_SECRET . payload {contract_id, role:worker, kind:contract_sign, exp} . used by contract.html';
comment on column public.contracts.signature_hash is
  'SHA-256(pdf_hash + client_sig_hash + worker_sig_hash + client_signed_at + worker_signed_at) . computed on complete';
comment on column public.contracts.final_certificate_url is
  'Phase 2 . signed URL (30d) to final certificate PDF containing both signatures + timestamps + hash';
comment on column public.contracts.client_signature_uploaded_ip is
  'IP of client signature upload . audit trail (sulima H+ approved sparse logging)';
comment on column public.contracts.worker_signature_uploaded_ip is
  'IP of worker signature upload . audit trail (sulima H+ approved sparse logging)';

-- ============================================================
-- IP rate limit table for submit-signature (sulima 5/28 14:45 must-have)
-- Same IP fail 5 times / 15 min . block
-- ============================================================
create table if not exists public.signature_attempts (
  id bigserial primary key,
  ip text not null,
  contract_id uuid,
  ok boolean not null default false,
  fail_reason text,
  ua text,
  created_at timestamptz not null default now()
);

create index if not exists signature_attempts_ip_time_idx on public.signature_attempts(ip, created_at desc);
create index if not exists signature_attempts_contract_idx on public.signature_attempts(contract_id);

comment on table public.signature_attempts is
  'IP rate limit audit . submit-signature 5/15min cap (sulima 5/28 14:45 H+)';

alter table public.signature_attempts enable row level security;

drop policy if exists "signature_attempts: admin sees all" on public.signature_attempts;
create policy "signature_attempts: admin sees all" on public.signature_attempts
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- service_role bypass RLS . no anon select

-- ============================================================
-- contracts RLS . anon SELECT via valid contract token (contract.html)
-- ============================================================
-- Note: actual JWT verification happens in submit-signature Edge Function (service_role).
-- contract.html uses anon key + Edge Function for read+write, NOT direct PostgREST.
-- So we keep RLS strict here (admin-only) . the Edge Function handles token verify.

-- ============================================================
-- contract-verify public read . metadata only (NOT pdf_url, NOT emails)
-- Done via a SECURITY DEFINER function that returns sanitized rows.
-- ============================================================
create or replace function public.contract_verify_lookup(p_contract_id uuid)
returns table (
  id uuid,
  status text,
  pdf_hash text,
  signature_hash text,
  client_handle text,
  worker_handle text,
  client_signed_at timestamptz,
  worker_signed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    c.id,
    c.status,
    c.pdf_hash,
    c.signature_hash,
    -- Anonymize: only first 2 chars + *** (no full names, no emails)
    case
      when c.contract_snapshot ->> 'client_name' is not null
        then substring(c.contract_snapshot ->> 'client_name' from 1 for 2) || '***'
      else null
    end as client_handle,
    case
      when c.contract_snapshot ->> 'worker_name' is not null
        then substring(c.contract_snapshot ->> 'worker_name' from 1 for 2) || '***'
      else null
    end as worker_handle,
    c.client_signed_at,
    c.worker_signed_at,
    c.created_at
  from public.contracts c
  where c.id = p_contract_id;
end;
$$;

comment on function public.contract_verify_lookup(uuid) is
  'Public contract verify . returns sanitized metadata only . no PDF URL, no emails, anonymized handles';

-- anon can call this function
grant execute on function public.contract_verify_lookup(uuid) to anon, authenticated;
