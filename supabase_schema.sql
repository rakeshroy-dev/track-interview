-- =====================================================================
-- Interview Tracker – Supabase schema (4 tables, RLS enabled)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: existing projects only get the new objects added
-- (opportunities, calls, interviews.opportunity_id); no data is touched.
--
--   companies ──< opportunities ──< calls
--                      └──────────< interviews   (interview history per opportunity)
-- =====================================================================

-- 1) Companies (one row per company + its HR contact)
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null,
  hr_name     text,
  hr_phone    text,
  hr_email    text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- 2) Interviews (one row per interview / round)
create table if not exists public.interviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company_id    uuid not null references public.companies(id) on delete cascade,
  role          text not null,
  round         text default 'Screening',
  mode          text default 'Video',            -- Video | Phone | Onsite
  interview_at  timestamptz,                     -- date + time of the interview
  status        text not null default 'applied'
                check (status in ('applied','scheduled','rescheduled','completed',
                                  'awaiting','hold','selected','rejected','cancelled')),
  followup_on   date,                            -- when you plan to follow up next
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 3) Job opportunities (one row per role you are pursuing at a company)
create table if not exists public.opportunities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  role        text not null,
  source      text default 'Recruiter call',     -- Recruiter call | Naukri | LinkedIn | Referral | ...
  status      text not null default 'lead'
              check (status in ('lead','active','hold','offer','closed')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 4) Calls (recruiter / HR call log for an opportunity)
create table if not exists public.calls (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  opportunity_id  uuid not null references public.opportunities(id) on delete cascade,
  call_at         timestamptz not null default now(),
  direction       text not null default 'Incoming' check (direction in ('Incoming','Outgoing')),
  contact_name    text,
  duration_min    integer check (duration_min is null or duration_min >= 0),
  outcome         text,                           -- Interested | Call back later | Interview scheduled | ...
  notes           text,
  next_action_on  date,                           -- call back / follow up on
  created_at      timestamptz not null default now()
);

-- Link interviews to an opportunity (nullable: old interviews keep working)
alter table public.interviews
  add column if not exists opportunity_id uuid references public.opportunities(id) on delete set null;

create index if not exists opportunities_user_idx   on public.opportunities (user_id);
create index if not exists opportunities_company_idx on public.opportunities (company_id);
create index if not exists calls_opportunity_idx    on public.calls (opportunity_id, call_at desc);
create index if not exists interviews_opp_idx       on public.interviews (opportunity_id);

create index if not exists interviews_user_date_idx on public.interviews (user_id, interview_at desc);
create index if not exists interviews_company_idx   on public.interviews (company_id);
create index if not exists companies_user_idx       on public.companies (user_id);

-- Keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_opportunities_touch on public.opportunities;
create trigger trg_opportunities_touch before update on public.opportunities
for each row execute function public.touch_updated_at();

drop trigger if exists trg_interviews_touch on public.interviews;
create trigger trg_interviews_touch before update on public.interviews
for each row execute function public.touch_updated_at();

-- Row Level Security: every row is private to its owner
alter table public.companies  enable row level security;
alter table public.interviews enable row level security;
alter table public.opportunities enable row level security;
alter table public.calls enable row level security;

drop policy if exists "own companies"  on public.companies;
drop policy if exists "own interviews" on public.interviews;
drop policy if exists "own opportunities" on public.opportunities;
drop policy if exists "own calls" on public.calls;

create policy "own companies"  on public.companies
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own interviews" on public.interviews
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own opportunities" on public.opportunities
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own calls" on public.calls
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Adding a new status later? Update the check constraint, e.g.:
--   alter table public.interviews drop constraint interviews_status_check;
--   alter table public.interviews add constraint interviews_status_check
--     check (status in ('applied','scheduled', ... ,'your_new_status'));
-- and add the same key to STATUS in app.js.
-- ---------------------------------------------------------------------
