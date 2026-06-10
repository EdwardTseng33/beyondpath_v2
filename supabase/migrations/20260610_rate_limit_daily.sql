-- 2026-06-10 蘇菲 · 試算每日額度 (Edward 拍板: 匿名 3 次/天/IP · 登入 10 次/天/帳號)
-- 背景: 原 Deno KV 限流 TTL<=120s (沙利曼 Gate 5)、記不了「一天」→ 改用 DB 表記日計數
-- 台灣時區為「一天」邊界。表很小 (每日活躍 key 數)、7 天前舊列由 daily-ops 順手清或放著無妨。

create table if not exists rate_limit_daily (
  key text not null,                -- 'client-brief-parse:ip:1.2.3.4' 或 'client-brief-parse:user:<uuid>'
  day date not null,
  count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (key, day)
);

-- RLS 開、不建任何 policy = 只有 service role 摸得到 (anon/authenticated 全擋)
alter table rate_limit_daily enable row level security;

-- 原子遞增 + 判斷：單一往返、無競態
create or replace function bp_rate_limit_daily(p_key text, p_limit int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Asia/Taipei')::date;
  v_count int;
begin
  insert into rate_limit_daily as r (key, day, count, updated_at)
  values (left(p_key, 128), v_day, 1, now())
  on conflict (key, day)
  do update set count = r.count + 1, updated_at = now()
  returning count into v_count;

  return jsonb_build_object(
    'allowed', v_count <= p_limit,
    'count', v_count,
    'limit', p_limit
  );
end
$$;

-- 只准 service role 呼叫 (Edge Function 內用 service key)
revoke execute on function bp_rate_limit_daily(text, int) from public;
revoke execute on function bp_rate_limit_daily(text, int) from anon;
revoke execute on function bp_rate_limit_daily(text, int) from authenticated;
