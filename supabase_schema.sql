-- =====================================================================
-- Interview Tracker – Supabase schema (2 tables, RLS enabled)
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
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

create index if not exists interviews_user_date_idx on public.interviews (user_id, interview_at desc);
create index if not exists interviews_company_idx   on public.interviews (company_id);
create index if not exists companies_user_idx       on public.companies (user_id);

-- Keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_interviews_touch on public.interviews;
create trigger trg_interviews_touch before update on public.interviews
for each row execute function public.touch_updated_at();

-- Row Level Security: every row is private to its owner
alter table public.companies  enable row level security;
alter table public.interviews enable row level security;

drop policy if exists "own companies"  on public.companies;
drop policy if exists "own interviews" on public.interviews;

create policy "own companies"  on public.companies
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own interviews" on public.interviews
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Adding a new status later? Update the check constraint, e.g.:
--   alter table public.interviews drop constraint interviews_status_check;
--   alter table public.interviews add constraint interviews_status_check
--     check (status in ('applied','scheduled', ... ,'your_new_status'));
-- and add the same key to STATUS in app.js.
-- ---------------------------------------------------------------------
