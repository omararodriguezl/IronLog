-- ============================================================
-- IRON LOG — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  goal text check (goal in ('volume', 'strength', 'cut', 'maintenance')),
  days_per_week int check (days_per_week between 1 and 7),
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  equipment text check (equipment in ('full_gym', 'dumbbells_bar', 'dumbbells', 'bodyweight')),
  injuries text,
  use_kg boolean default true,
  created_at timestamptz default now()
);

create table if not exists workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  plan_json jsonb not null,
  goal text,
  total_weeks int,
  current_week int default 1,
  start_date date,
  created_at timestamptz default now()
);

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  plan_id uuid references workout_plans on delete set null,
  date date not null,
  day_label text,
  week_number int,
  duration_minutes int,
  exercises jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists food_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  date date not null,
  meal_name text not null,
  calories int default 0,
  protein_g decimal(8,1) default 0,
  carbs_g decimal(8,1) default 0,
  fat_g decimal(8,1) default 0,
  entry_method text check (entry_method in ('photo', 'manual', 'barcode')),
  created_at timestamptz default now()
);

create table if not exists cardio_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  date date not null,
  session_type text check (session_type in ('easy_run', 'intervals', 'tempo', 'long_run', 'race', 'rest')) not null,
  distance_miles decimal(6,2),
  description text,
  completed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_workout_sessions_user_date on workout_sessions(user_id, date desc);
create index if not exists idx_food_log_user_date on food_log(user_id, date desc);
create index if not exists idx_cardio_user_date on cardio_calendar(user_id, date);
create index if not exists idx_workout_plans_user on workout_plans(user_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table workout_plans enable row level security;
alter table workout_sessions enable row level security;
alter table food_log enable row level security;
alter table cardio_calendar enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can manage own workout plans" on workout_plans;
drop policy if exists "Users can manage own workout sessions" on workout_sessions;
drop policy if exists "Users can manage own food log" on food_log;
drop policy if exists "Users can manage own cardio calendar" on cardio_calendar;

-- Recreate policies
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can manage own workout plans"
  on workout_plans for all using (auth.uid() = user_id);

create policy "Users can manage own workout sessions"
  on workout_sessions for all using (auth.uid() = user_id);

create policy "Users can manage own food log"
  on food_log for all using (auth.uid() = user_id);

create policy "Users can manage own cardio calendar"
  on cardio_calendar for all using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
