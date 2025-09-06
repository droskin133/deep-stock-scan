-- =========================================
-- AI DAYTRADER PRO — CLEAN INSTALL (FULL)
-- =========================================

-- ---------- DROP OLD OBJECTS WE OWN ----------
drop table if exists public.alert_triggers cascade;
drop table if exists public.notifications cascade;
drop table if exists public.widget_layouts cascade;
drop table if exists public.user_settings cascade;
drop table if exists public.ai_performance_daily cascade;
drop table if exists public.news_watches cascade;

drop table if exists public.sec_filings cascade;
drop table if exists public.congress_trades cascade;
drop table if exists public.institutional_ownership cascade;

drop table if exists public.market_anomalies cascade;
drop table if exists public.sp500 cascade;

drop table if exists public.watchlist cascade;
drop table if exists public.alerts cascade;
drop table if exists public.annotations cascade;
drop table if exists public.subscriptions cascade;

drop function if exists public.set_user_id() cascade;
drop function if exists public.prevent_role_change() cascade;

-- ---------- ENUMS ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role_enum') then
    create type public.user_role_enum as enum ('admin','president','premium','basic','trial');
  end if;

  if not exists (select 1 from pg_type where typname = 'plan_enum') then
    create type public.plan_enum as enum ('basic','premium','trial');
  end if;

  if not exists (select 1 from pg_type where typname = 'alert_source_enum') then
    create type public.alert_source_enum as enum ('user','ai','community');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type_enum') then
    create type public.notification_type_enum as enum ('alert_trigger','system','news');
  end if;
end$$;

-- ---------- PROFILES (SAFE CREATE) ----------
-- If you already have this table, this will be a no-op. Keep it minimal and secure.
create table if not exists public.profiles (
  id uuid primary key,                      -- auth.users.id
  email text unique,
  full_name text,
  initials text,
  role public.user_role_enum default 'trial',
  created_at timestamptz default now()
);

-- ---------- CORE USER TABLES ----------
create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ticker text not null,
  created_at timestamptz not null default now(),
  unique (user_id, ticker)
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ticker text not null,
  condition text not null,                    -- NL description ("crosses 250 w/ volume > 2x")
  source public.alert_source_enum not null default 'user',
  status text not null default 'active',      -- active | triggered | canceled | expired
  expires_at timestamptz,                     -- AI/community alerts usually 1 day
  created_at timestamptz not null default now(),
  triggered_at timestamptz
);

create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ticker text not null,
  type text not null,                         -- support | resistance | vol_anomaly | news | filing | congress
  data jsonb not null,                        -- coordinates/labels/meta
  at timestamptz not null,                    -- when it happened on chart
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan public.plan_enum not null default 'trial',
  status text not null default 'active',      -- active | canceled | trialing | past_due
  provider text default 'stripe',             -- stripe | TBD
  customer_id text,                           -- provider customer id
  current_period_end timestamptz,
  history jsonb,
  created_at timestamptz not null default now()
);

-- ---------- NOTIFICATION CENTER & ALERT LOG ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type public.notification_type_enum not null default 'alert_trigger',
  title text,
  body text,
  payload jsonb,                              -- link, ticker, alert_id, etc.
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index idx_notifications_user_created on public.notifications (user_id, created_at desc);

create table public.alert_triggers (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  user_id uuid not null,
  ticker text not null,
  triggered_at timestamptz not null default now(),
  price numeric,                               -- price at trigger snapshot (if captured)
  snapshot jsonb,                              -- extra calc context (indicators/vol/etc.)
  delivered_channels text[],                   -- ['push','email','in_app']
  acknowledged_at timestamptz,
  dismissed boolean not null default false,
  evaluation_window_minutes int not null default 30,
  pnl_after_window numeric,                    -- % return measured later (optional)
  outcome text check (outcome in ('win','loss','neutral'))  -- optional
);
create index idx_alert_triggers_user_time on public.alert_triggers (user_id, triggered_at desc);
create index idx_alert_triggers_alert on public.alert_triggers (alert_id);

-- ---------- AI PERFORMANCE (GLOBAL & PER TICKER) ----------
create table public.ai_performance_daily (
  dt date not null,
  ticker text not null,
  model text not null default 'gpt-4o-mini',  -- record model/version used
  alerts_total int not null default 0,
  alerts_win int not null default 0,
  win_rate numeric,                            -- computed = alerts_win/alerts_total
  avg_return numeric,
  features jsonb,                              -- indicators/features contributing
  updated_at timestamptz not null default now(),
  primary key (dt, ticker, model)
);
create index idx_ai_perf_ticker on public.ai_performance_daily (ticker, dt desc);

-- ---------- USER SETTINGS & LAYOUTS ----------
create table public.user_settings (
  user_id uuid primary key,
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  ai_suggestions_default boolean not null default true,   -- always on; user can toggle off per-alert
  theme text not null default 'system',                   -- system | light | dark
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.widget_layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  page text not null,                                    -- 'dashboard' | 'stock/:ticker'
  layout jsonb not null,                                 -- positions/sizes/order
  updated_at timestamptz not null default now(),
  unique (user_id, page)
);

-- ---------- GLOBAL DATA CACHES ----------
create table public.market_anomalies (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  kind text not null,          -- price_move | vol_anomaly | news | filing
  score numeric,
  data jsonb not null,
  detected_at timestamptz not null default now()
);
create index idx_anom_detected on public.market_anomalies (detected_at desc);
create index idx_anom_ticker on public.market_anomalies (ticker);

create table public.sp500 (
  ticker text primary key
);

-- optional caches (service_role writes; users read)
create table public.sec_filings (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  filing_type text not null,          -- 8-K, 10-K, 10-Q, 13D, 13G, Form 4, etc.
  filed_at timestamptz not null,
  title text,
  source_url text,
  raw jsonb,
  ingested_at timestamptz not null default now()
);
create index idx_sec_filings_ticker_time on public.sec_filings (ticker, filed_at desc);

create table public.congress_trades (
  id uuid primary key default gen_random_uuid(),
  person text,                         -- e.g., "Nancy Pelosi"
  chamber text,                        -- House | Senate
  ticker text not null,
  transaction_type text,               -- buy | sell
  amount_range text,
  trade_date date,
  reported_date date,
  source_url text,
  raw jsonb,
  ingested_at timestamptz not null default now()
);
create index idx_congress_trades_ticker_date on public.congress_trades (ticker, trade_date desc);

create table public.institutional_ownership (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  filer_name text not null,            -- institution/fund
  filer_cik text,
  position_change text,                -- increased | decreased | new | closed
  shares bigint,
  reported_date date,
  source_url text,
  raw jsonb,
  ingested_at timestamptz not null default now()
);
create index idx_inst_own_ticker_date on public.institutional_ownership (ticker, reported_date desc);

-- Optional keyword/ticker news watches per user
create table public.news_watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ticker text,                          -- optional specific ticker
  keyword text,                         -- optional keyword/topic
  channels text[] default array['in_app'],  -- in_app | email | push
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index idx_watchlist_user on public.watchlist (user_id);
create index idx_alerts_user on public.alerts (user_id);
create index idx_annotations_user_ticker on public.annotations (user_id, ticker);
create index idx_subscriptions_user on public.subscriptions (user_id);

create index idx_widget_layouts_user on public.widget_layouts (user_id);
create index idx_user_settings_pk on public.user_settings (user_id);

-- =========================================
-- RLS: ENABLE + POLICIES (LEAST PRIVILEGE)
-- =========================================
alter table public.profiles enable row level security;
alter table public.watchlist enable row level security;
alter table public.alerts enable row level security;
alter table public.annotations enable row level security;
alter table public.subscriptions enable row level security;

alter table public.notifications enable row level security;
alter table public.alert_triggers enable row level security;

alter table public.user_settings enable row level security;
alter table public.widget_layouts enable row level security;

alter table public.ai_performance_daily enable row level security;

alter table public.market_anomalies enable row level security;
alter table public.sp500 enable row level security;
alter table public.sec_filings enable row level security;
alter table public.congress_trades enable row level security;
alter table public.institutional_ownership enable row level security;
alter table public.news_watches enable row level security;

-- PROFILES
drop policy if exists profiles_read_own on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_write on public.profiles;

create policy profiles_read_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy profiles_admin_write on public.profiles
  for all to service_role
  using (true) with check (true);

-- WATCHLIST
drop policy if exists wl_select on public.watchlist;
drop policy if exists wl_modify on public.watchlist;
create policy wl_select on public.watchlist
  for select to authenticated using (auth.uid() = user_id);
create policy wl_modify on public.watchlist
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ALERTS
drop policy if exists al_select on public.alerts;
drop policy if exists al_modify on public.alerts;
create policy al_select on public.alerts
  for select to authenticated using (auth.uid() = user_id);
create policy al_modify on public.alerts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ANNOTATIONS
drop policy if exists an_select on public.annotations;
drop policy if exists an_modify on public.annotations;
create policy an_select on public.annotations
  for select to authenticated using (auth.uid() = user_id);
create policy an_modify on public.annotations
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SUBSCRIPTIONS
drop policy if exists sb_select on public.subscriptions;
drop policy if exists sb_modify on public.subscriptions;
create policy sb_select on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);
create policy sb_modify on public.subscriptions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- NOTIFICATIONS (per-user)
drop policy if exists nf_select on public.notifications;
drop policy if exists nf_modify on public.notifications;
create policy nf_select on public.notifications
  for select to authenticated using (auth.uid() = user_id);
create policy nf_modify on public.notifications
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ALERT TRIGGERS (per-user)
drop policy if exists at_select on public.alert_triggers;
drop policy if exists at_modify on public.alert_triggers;
create policy at_select on public.alert_triggers
  for select to authenticated using (auth.uid() = user_id);
create policy at_modify on public.alert_triggers
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- USER SETTINGS
drop policy if exists us_select on public.user_settings;
drop policy if exists us_modify on public.user_settings;
create policy us_select on public.user_settings
  for select to authenticated using (auth.uid() = user_id);
create policy us_modify on public.user_settings
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- WIDGET LAYOUTS
drop policy if exists wl2_select on public.widget_layouts;
drop policy if exists wl2_modify on public.widget_layouts;
create policy wl2_select on public.widget_layouts
  for select to authenticated using (auth.uid() = user_id);
create policy wl2_modify on public.widget_layouts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI PERFORMANCE (global read-only, service writes)
drop policy if exists aip_select on public.ai_performance_daily;
drop policy if exists aip_admin on public.ai_performance_daily;
create policy aip_select on public.ai_performance_daily
  for select to authenticated using (true);
create policy aip_admin on public.ai_performance_daily
  for all to service_role using (true) with check (true);

-- MARKET ANOMALIES (global read-only, service writes)
drop policy if exists ma_select on public.market_anomalies;
drop policy if exists ma_admin on public.market_anomalies;
create policy ma_select on public.market_anomalies
  for select to authenticated using (true);
create policy ma_admin on public.market_anomalies
  for all to service_role using (true) with check (true);

-- SP500 (global read-only)
drop policy if exists sp_select on public.sp500;
drop policy if exists sp_admin on public.sp500;
create policy sp_select on public.sp500
  for select to authenticated using (true);
create policy sp_admin on public.sp500
  for all to service_role using (true) with check (true);

-- SEC FILINGS (global read-only)
drop policy if exists sf_select on public.sec_filings;
drop policy if exists sf_admin on public.sec_filings;
create policy sf_select on public.sec_filings
  for select to authenticated using (true);
create policy sf_admin on public.sec_filings
  for all to service_role using (true) with check (true);

-- CONGRESS TRADES (global read-only)
drop policy if exists ct_select on public.congress_trades;
drop policy if exists ct_admin on public.congress_trades;
create policy ct_select on public.congress_trades
  for select to authenticated using (true);
create policy ct_admin on public.congress_trades
  for all to service_role using (true) with check (true);

-- INSTITUTIONAL OWNERSHIP (global read-only)
drop policy if exists io_select on public.institutional_ownership;
drop policy if exists io_admin on public.institutional_ownership;
create policy io_select on public.institutional_ownership
  for select to authenticated using (true);
create policy io_admin on public.institutional_ownership
  for all to service_role using (true) with check (true);

-- NEWS WATCHES (per-user)
drop policy if exists nw_select on public.news_watches;
drop policy if exists nw_modify on public.news_watches;
create policy nw_select on public.news_watches
  for select to authenticated using (auth.uid() = user_id);
create policy nw_modify on public.news_watches
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================
-- FUNCTIONS + TRIGGERS (SECURE SEARCH_PATH)
-- =========================================
create or replace function public.set_user_id()
returns trigger
language plpgsql
as $$
begin
  perform set_config('search_path', 'public, pg_temp', true);
  if (new.user_id is null) then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;
alter function public.set_user_id() set search_path = public, pg_temp;

create trigger trg_set_user_id_watchlist
before insert on public.watchlist
for each row execute function public.set_user_id();

create trigger trg_set_user_id_alerts
before insert on public.alerts
for each row execute function public.set_user_id();

create trigger trg_set_user_id_annotations
before insert on public.annotations
for each row execute function public.set_user_id();

create trigger trg_set_user_id_subs
before insert on public.subscriptions
for each row execute function public.set_user_id();

-- Prevent profile role changes except via backend (service_role)
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  perform set_config('search_path', 'public, pg_temp', true);
  if new.role is distinct from old.role then
    raise exception 'Direct role updates are not allowed';
  end if;
  return new;
end;
$$;
alter function public.prevent_role_change() set search_path = public, pg_temp;

drop trigger if exists trg_prevent_role_change on public.profiles;
create trigger trg_prevent_role_change
before update on public.profiles
for each row execute function public.prevent_role_change();

-- =========================================
-- SEED — S&P 500 (LARGE STARTER LIST)
-- (Safe upsert; you can add more later)
-- =========================================
insert into public.sp500 (ticker) values
('AAPL'), ('MSFT'), ('AMZN'), ('NVDA'), ('GOOGL'), ('GOOG'), ('META'), ('BRK.B'), ('BRK.A'), ('TSLA'),
('UNH'), ('JNJ'), ('XOM'), ('JPM'), ('V'), ('PG'), ('AVGO'), ('HD'), ('CVX'), ('LLY'),
('MA'), ('MRK'), ('PEP'), ('ABBV'), ('KO'), ('COST'), ('PFE'), ('BAC'), ('ADBE'), ('TMO'),
('CSCO'), ('WMT'), ('ACN'), ('DIS'), ('ABT'), ('DHR'), ('MCD'), ('LIN'), ('NKE'), ('VZ'),
('NEE'), ('PM'), ('TXN'), ('ORCL'), ('BMY'), ('AMD'), ('HON'), ('AMGN'), ('IBM'), ('UNP'),
('GS'), ('RTX'), ('INTC'), ('CAT'), ('LMT'), ('LOW'), ('CVS'), ('AXP'), ('ELV'), ('DE'),
('SPGI'), ('NOW'), ('QCOM'), ('MDT'), ('PLD'), ('AMT'), ('INTU'), ('ISRG'), ('BKNG'), ('GEHC'),
('MS'), ('C'), ('SYK'), ('GILD'), ('T'), ('BLK'), ('ADP'), ('VRTX'), ('TJX'), ('ZTS'),
('REGN'), ('PGR'), ('MMC'), ('AMAT'), ('ADI'), ('CI'), ('BDX'), ('MDLZ'), ('MO'), ('MU'),
('PNC'), ('CSX'), ('USB'), ('CB'), ('SO'), ('SCHW'), ('EQIX'), ('CL'), ('BSX'), ('DUK'),
('ICE'), ('SHW'), ('COP'), ('GD'), ('CME'), ('FCX'), ('NOC'), ('HUM'), ('EW'), ('ITW'),
('ETN'), ('WM'), ('MPC'), ('EOG'), ('HCA'), ('AON'), ('NSC'), ('MAR'), ('PSA'), ('APD'),
('LRCX'), ('CMCSA'), ('ORLY'), ('FISV'), ('TGT'), ('PAYX'), ('MNST'), ('ROP'), ('KLAC'), ('AEP'),
('CCI'), ('PH'), ('MCK'), ('AIG'), ('CTAS'), ('D'), ('MSCI'), ('TFC'), ('PSX'), ('AZO'),
('PCAR'), ('DXCM'), ('LHX'), ('TRV'), ('ADM'), ('JCI'), ('KMB'), ('CMG'), ('MCO'), ('IDXX'),
('EXC'), ('AMP'), ('FDX'), ('SNPS'), ('COF'), ('NEM'), ('YUM'), ('HLT'), ('CSGP'), ('STZ'),
('RSG'), ('DOW'), ('XEL'), ('KR'), ('APTV'), ('CDNS'), ('PPG'), ('WELL'), ('ODFL'), ('ROK'),
('EBAY'), ('HPQ'), ('ANET'), ('DFS'), ('ALL'), ('CTVA'), ('CNC'), ('TT'), ('WMB'), ('VLO'),
('MSI'), ('OKE'), ('FTNT'), ('SYY'), ('MET'), ('PEG'), ('KMI'), ('HSY'), ('LVS'), ('HES'),
('ECL'), ('MTB'), ('VRSK'), ('NUE'), ('AFL'), ('ED'), ('GIS'), ('LEN'), ('AEE'), ('CARR'),
('GLW'), ('AVB'), ('KEYS'), ('ROST'), ('DVN'), ('PAYC'), ('MLM'), ('VTR'), ('GWW'), ('CHD'),
('FITB'), ('KHC'), ('STT'), ('SWK'), ('CPRT'), ('MKC'), ('FANG'), ('BALL'), ('TSCO'), ('IR'),
('DTE'), ('AWK'), ('WEC'), ('TSN'), ('FAST'), ('ZBH'), ('MTD'), ('BRO'), ('HIG'), ('LYB'),
('HAL'), ('EXR'), ('NTRS'), ('PPL'), ('CMS'), ('DAL'), ('SYF'), ('ESS'), ('CNP'), ('VMC'),
('CFG'), ('HPE'), ('CAG'), ('EXPD'), ('HOLX'), ('DRI'), ('MOS'), ('UAL'), ('NTAP'), ('CF'),
('FLT'), ('PKG'), ('RCL'), ('APA'), ('XYL'), ('BBY'), ('ALB'), ('WST'), ('REG'), ('TXT'),
('PWR'), ('GEN'), ('ETSY'), ('PFG'), ('NVR'), ('DGX'), ('HBAN'), ('SJM'), ('NI'), ('MTCH'),
('INCY'), ('POOL'), ('BIO'), ('ALLE'), ('LKQ'), ('STE'), ('AKAM'), ('FDS'), ('CBOE'), ('EPAM'),
('CMA'), ('VTRS'), ('FMC'), ('MKTX'), ('IP'), ('TECH'), ('UDR'), ('WRB'), ('CRL'), ('BF.B'),
('JKHY'), ('HII'), ('CE'), ('LW'), ('PODD'), ('QRVO'), ('MAS'), ('HAS'), ('AES'), ('CTLT'),
('FFIV'), ('SEE'), ('FRT'), ('NCLH'), ('CHRW'), ('PNR'), ('SWKS'), ('UHS'), ('IPG'), ('FOX'),
('FOXA'), ('NWS'), ('NWSA'), ('BEN'), ('ZION'), ('RHI'), ('MHK'), ('AOS'), ('HRL'), ('GNRC'),
('IVZ'), ('TPR'), ('PNW'), ('NRG'), ('MRO'), ('LUMN'), ('DXC'), ('XRAY'), ('AAP'), ('BBWI'),
('WRK'), ('WHR'), ('PARA'), ('CCL'), ('RL'), ('MGM'), ('WYNN'), ('CZR'), ('KMX'), ('IRM'),
('HSIC')
on conflict (ticker) do nothing;