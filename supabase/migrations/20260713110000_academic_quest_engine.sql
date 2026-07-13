-- Personal academic progress model for Focus Bloom.
-- Every plan is private to its owner and has its own credit target.

create table if not exists public.academic_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  total_credits numeric not null check (total_credits > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.academic_courses (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.academic_plans(id) on delete cascade,
  code text,
  name text not null,
  cycle integer check (cycle is null or cycle > 0),
  credits numeric not null check (credits > 0),
  unique (plan_id, code)
);

create table if not exists public.academic_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.academic_courses(id) on delete cascade,
  grade numeric check (grade is null or (grade >= 0 and grade <= 20)),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'failed', 'in_progress')),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.academic_plans
  alter column total_credits drop default;

alter table public.academic_plans enable row level security;
alter table public.academic_courses enable row level security;
alter table public.academic_records enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'academic_plans'
      and policyname = 'Users manage their own academic plans'
  ) then
    create policy "Users manage their own academic plans"
      on public.academic_plans
      for all
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'academic_courses'
      and policyname = 'Users manage courses in their own plans'
  ) then
    create policy "Users manage courses in their own plans"
      on public.academic_courses
      for all
      to authenticated
      using (
        exists (
          select 1 from public.academic_plans
          where academic_plans.id = academic_courses.plan_id
            and academic_plans.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.academic_plans
          where academic_plans.id = academic_courses.plan_id
            and academic_plans.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'academic_records'
      and policyname = 'Users manage their own academic records'
  ) then
    create policy "Users manage their own academic records"
      on public.academic_records
      for all
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end
$$;
