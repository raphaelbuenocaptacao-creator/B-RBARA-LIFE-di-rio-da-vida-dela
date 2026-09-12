-- BÁRBARA LIFE — schema privado
-- Execute em um projeto Supabase exclusivo do aplicativo.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Bárbara',
  avatar_path text,
  diary_lock_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_date date not null default current_date,
  title text not null check (char_length(title) between 1 and 180),
  category text not null default 'pessoal',
  priority text not null default 'media' check (priority in ('baixa','media','alta')),
  scheduled_time time,
  recurrence text,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists daily_goals_user_date_idx on public.daily_goals(user_id, goal_date);

create table if not exists public.long_term_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 220),
  why_it_matters text,
  category text not null default 'pessoal',
  start_date date not null default current_date,
  target_date date,
  progress_percent smallint not null default 0 check (progress_percent between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists long_term_goals_user_idx on public.long_term_goals(user_id, created_at desc);

create table if not exists public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.long_term_goals(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists goal_steps_goal_idx on public.goal_steps(user_id, goal_id, position);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  title text,
  body text not null check (char_length(body) > 0),
  mood text,
  gratitude text,
  learned_today text,
  tomorrow_change text,
  photo_paths text[] not null default '{}',
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists diary_entries_user_date_idx on public.diary_entries(user_id, entry_date desc);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  mood text not null,
  note text,
  created_at timestamptz not null default now(),
  unique(user_id, entry_date)
);

create table if not exists public.wellness_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  sleep_hours numeric(4,1) check (sleep_hours is null or (sleep_hours >= 0 and sleep_hours <= 24)),
  water_glasses smallint check (water_glasses is null or (water_glasses >= 0 and water_glasses <= 40)),
  energy smallint check (energy between 1 and 5),
  mood_score smallint check (mood_score between 1 and 5),
  stress_score smallint check (stress_score between 1 and 5),
  exercised boolean not null default false,
  nutrition text check (nutrition is null or nutrition in ('Muito boa','Boa','Poderia melhorar')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, entry_date)
);

create table if not exists public.beauty_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tip_key text not null,
  title text not null,
  category text not null,
  created_at timestamptz not null default now(),
  unique(user_id, tip_key)
);

create table if not exists public.selfcare_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  routine_type text not null check (routine_type in ('manha','noite','semanal')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid not null references public.selfcare_routines(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  completed_on date,
  created_at timestamptz not null default now()
);
create index if not exists routine_items_user_routine_idx on public.routine_items(user_id, routine_id, position);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  title text not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_key)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  reminder_type text not null default 'geral',
  remind_at timestamptz,
  recurring_rule text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- Nenhum acesso anônimo às tabelas pessoais.
revoke all on public.profiles, public.daily_goals, public.long_term_goals, public.goal_steps,
  public.diary_entries, public.mood_entries, public.wellness_checkins, public.beauty_favorites,
  public.selfcare_routines, public.routine_items, public.achievements, public.reminders from anon;

grant select, insert, update, delete on public.profiles, public.daily_goals, public.long_term_goals, public.goal_steps,
  public.diary_entries, public.mood_entries, public.wellness_checkins, public.beauty_favorites,
  public.selfcare_routines, public.routine_items, public.achievements, public.reminders to authenticated;

alter table public.profiles enable row level security;
alter table public.daily_goals enable row level security;
alter table public.long_term_goals enable row level security;
alter table public.goal_steps enable row level security;
alter table public.diary_entries enable row level security;
alter table public.mood_entries enable row level security;
alter table public.wellness_checkins enable row level security;
alter table public.beauty_favorites enable row level security;
alter table public.selfcare_routines enable row level security;
alter table public.routine_items enable row level security;
alter table public.achievements enable row level security;
alter table public.reminders enable row level security;

-- Uma política por tabela: somente o dono autenticado pode operar suas linhas.
drop policy if exists "owner only" on public.profiles;
create policy "owner only" on public.profiles for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.daily_goals;
create policy "owner only" on public.daily_goals for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.long_term_goals;
create policy "owner only" on public.long_term_goals for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.goal_steps;
create policy "owner only" on public.goal_steps for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.diary_entries;
create policy "owner only" on public.diary_entries for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.mood_entries;
create policy "owner only" on public.mood_entries for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.wellness_checkins;
create policy "owner only" on public.wellness_checkins for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.beauty_favorites;
create policy "owner only" on public.beauty_favorites for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.selfcare_routines;
create policy "owner only" on public.selfcare_routines for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.routine_items;
create policy "owner only" on public.routine_items for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.achievements;
create policy "owner only" on public.achievements for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.reminders;
create policy "owner only" on public.reminders for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Storage privado. Arquivos devem seguir: {user_id}/...
insert into storage.buckets (id, name, public)
values ('barbara-private', 'barbara-private', false)
on conflict (id) do update set public = false;

drop policy if exists "barbara private read" on storage.objects;
create policy "barbara private read" on storage.objects for select to authenticated
using (
  bucket_id = 'barbara-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "barbara private insert" on storage.objects;
create policy "barbara private insert" on storage.objects for insert to authenticated
with check (
  bucket_id = 'barbara-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "barbara private update" on storage.objects;
create policy "barbara private update" on storage.objects for update to authenticated
using (
  bucket_id = 'barbara-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'barbara-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "barbara private delete" on storage.objects;
create policy "barbara private delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'barbara-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
