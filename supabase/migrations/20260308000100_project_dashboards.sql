-- Project dashboard foundation.
-- Run manually with the Supabase SQL editor or the Supabase CLI after reviewing
-- the target project's schema. This migration intentionally does not run remotely.

begin;

create table if not exists public.projects (
  id uuid primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.projects (id, name)
values
  ('4c49d22f-3cfe-4c19-9343-516ca4a0df9c', 'onboarding'),
  ('bc060a35-5a54-4c94-ac93-a796864ae1bf', 'plataforma')
on conflict do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  project_id uuid references public.projects(id),
  created_at timestamptz not null default now()
);

insert into public.profiles (id, project_id)
select id, '4c49d22f-3cfe-4c19-9343-516ca4a0df9c'
from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, project_id)
  values (new.id, '4c49d22f-3cfe-4c19-9343-516ca4a0df9c')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.stories add column if not exists project_id uuid;
alter table public.people add column if not exists project_id uuid;
alter table public.story_artifacts add column if not exists project_id uuid;
alter table public.artifactsv2 add column if not exists project_id uuid;

update public.stories set project_id = '4c49d22f-3cfe-4c19-9343-516ca4a0df9c' where project_id is null;
update public.people set project_id = '4c49d22f-3cfe-4c19-9343-516ca4a0df9c' where project_id is null;
update public.story_artifacts set project_id = '4c49d22f-3cfe-4c19-9343-516ca4a0df9c' where project_id is null;
update public.artifactsv2 set project_id = '4c49d22f-3cfe-4c19-9343-516ca4a0df9c' where project_id is null;

alter table public.stories alter column project_id set not null;
alter table public.people alter column project_id set not null;
alter table public.story_artifacts alter column project_id set not null;
alter table public.artifactsv2 alter column project_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass and conname = 'profiles_project_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_project_id_fkey foreign key (project_id) references public.projects(id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.stories'::regclass and conname = 'stories_project_id_fkey'
  ) then
    alter table public.stories
      add constraint stories_project_id_fkey foreign key (project_id) references public.projects(id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.people'::regclass and conname = 'people_project_id_fkey'
  ) then
    alter table public.people
      add constraint people_project_id_fkey foreign key (project_id) references public.projects(id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.story_artifacts'::regclass and conname = 'story_artifacts_project_id_fkey'
  ) then
    alter table public.story_artifacts
      add constraint story_artifacts_project_id_fkey foreign key (project_id) references public.projects(id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.artifactsv2'::regclass and conname = 'artifactsv2_project_id_fkey'
  ) then
    alter table public.artifactsv2
      add constraint artifactsv2_project_id_fkey foreign key (project_id) references public.projects(id);
  end if;
end;
$$;

-- Composite keys make it impossible to link records across projects.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.stories'::regclass and conname = 'stories_id_project_id_key'
  ) then
    alter table public.stories
      add constraint stories_id_project_id_key unique (id, project_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.artifactsv2'::regclass and conname = 'artifactsv2_id_project_id_key'
  ) then
    alter table public.artifactsv2
      add constraint artifactsv2_id_project_id_key unique (id, project_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.story_artifacts'::regclass and conname = 'story_artifacts_story_project_fkey'
  ) then
    alter table public.story_artifacts
      add constraint story_artifacts_story_project_fkey
      foreign key (story_id, project_id)
      references public.stories (id, project_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.story_artifacts'::regclass and conname = 'story_artifacts_artifact_project_fkey'
  ) then
    alter table public.story_artifacts
      add constraint story_artifacts_artifact_project_fkey
      foreign key (artifact_id, project_id)
      references public.artifactsv2 (id, project_id);
  end if;
end;
$$;

create index if not exists stories_project_id_idx on public.stories(project_id);
create index if not exists people_project_id_idx on public.people(project_id);
create index if not exists story_artifacts_project_id_idx on public.story_artifacts(project_id);
create index if not exists artifactsv2_project_id_idx on public.artifactsv2(project_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and project_id = target_project_id
    );
$$;

alter table public.projects enable row level security;
alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.people enable row level security;
alter table public.story_artifacts enable row level security;
alter table public.artifactsv2 enable row level security;

drop policy if exists projects_select_for_authenticated on public.projects;
create policy projects_select_for_authenticated on public.projects
for select to authenticated using (public.can_access_project(id));

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists stories_project_scope on public.stories;
create policy stories_project_scope on public.stories
for all to authenticated using (public.can_access_project(project_id))
with check (public.can_access_project(project_id));

drop policy if exists people_project_scope on public.people;
create policy people_project_scope on public.people
for all to authenticated using (public.can_access_project(project_id))
with check (public.can_access_project(project_id));

drop policy if exists story_artifacts_project_scope on public.story_artifacts;
create policy story_artifacts_project_scope on public.story_artifacts
for all to authenticated using (public.can_access_project(project_id))
with check (public.can_access_project(project_id));

drop policy if exists artifactsv2_project_scope on public.artifactsv2;
create policy artifactsv2_project_scope on public.artifactsv2
for all to authenticated using (public.can_access_project(project_id))
with check (public.can_access_project(project_id));

-- Manual post-migration step: promote an administrator by UUID after verifying
-- the account in Supabase Auth. Do not hardcode an email in versioned SQL:
-- update public.profiles set role = 'admin', project_id = null where id = '<AUTH_USER_UUID>';

commit;
