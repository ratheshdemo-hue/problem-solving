create extension if not exists pgcrypto;

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null default ''
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone_number text,
  studying_year text
);

alter table if exists public.students
  add column if not exists phone_number text;

alter table if exists public.students
  add column if not exists studying_year text;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  answer text not null,
  score int,
  feedback text,
  evaluation_source text not null default 'pending',
  evaluation_status text not null default 'pending',
  evaluated_at timestamptz,
  created_at timestamptz not null default now()
);

alter table if exists public.submissions
  add column if not exists score int;

alter table if exists public.submissions
  add column if not exists feedback text;

alter table if exists public.submissions
  add column if not exists evaluation_source text not null default 'pending';

alter table if exists public.submissions
  add column if not exists evaluation_status text not null default 'pending';

alter table if exists public.submissions
  add column if not exists evaluated_at timestamptz;

create table if not exists public.evaluation_queue_state (
  id int primary key,
  is_processing boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.evaluation_queue_state (id, is_processing)
values (1, false)
on conflict (id) do nothing;

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

create index if not exists submissions_student_id_idx
  on public.submissions (student_id);

create index if not exists submissions_problem_id_idx
  on public.submissions (problem_id);

alter table public.problems enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "Public can read problems" on public.problems;
create policy "Public can read problems"
  on public.problems
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read submissions" on public.submissions;
create policy "Public can read submissions"
  on public.submissions
  for select
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table public.submissions;
