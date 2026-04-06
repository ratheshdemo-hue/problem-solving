create extension if not exists pgcrypto;

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null default ''
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  answer text not null,
  score int,
  feedback text,
  evaluation_source text not null default 'mock',
  created_at timestamptz not null default now()
);

alter table if exists public.submissions
  add column if not exists score int;

alter table if exists public.submissions
  add column if not exists feedback text;

alter table if exists public.submissions
  add column if not exists evaluation_source text not null default 'mock';

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
