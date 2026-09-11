-- NOTE:
-- This migration is intended for a Supabase Auth-backed deployment where each signed-in
-- session carries JWT claims with:
--   username = the current account username
--   role = admin | editor | viewer
--
-- The current project still authenticates via a custom username/password flow and does not
-- issue Supabase JWTs, so this strict RLS layer must be enabled only after the app is moved
-- to a real authenticated session model or equivalent server-side session injection.

create or replace function public.session_username()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'username', '');
$$;

create or replace function public.session_role()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '');
$$;

create or replace function public.is_admin_session()
returns boolean
language sql
stable
as $$
  select coalesce(public.session_role() = 'admin', false);
$$;

create or replace function public.can_access_workspace(p_account_username text)
returns boolean
language sql
stable
as $$
  select
    public.is_admin_session()
    or public.session_username() = p_account_username;
$$;

alter table public.account_profiles enable row level security;

drop policy if exists "prototype account profiles access" on public.account_profiles;
create policy "account_profiles_own_record_or_admin" on public.account_profiles
for select to authenticated
using (
  username = public.session_username()
  or public.is_admin_session()
);

create policy "account_profiles_admin_write" on public.account_profiles
for insert to authenticated
with check (public.is_admin_session());

create policy "account_profiles_admin_update" on public.account_profiles
for update to authenticated
using (public.is_admin_session())
with check (public.is_admin_session());

alter table public.subject_sections enable row level security;
alter table public.subjects enable row level security;
alter table public.requirements enable row level security;

drop policy if exists "prototype subject sections access" on public.subject_sections;
drop policy if exists "prototype subjects access" on public.subjects;
drop policy if exists "prototype requirements access" on public.requirements;

create policy "subject_sections_workspace_scope" on public.subject_sections
for all to authenticated
using (public.can_access_workspace(account_username))
with check (public.can_access_workspace(account_username));

create policy "subjects_workspace_scope" on public.subjects
for all to authenticated
using (public.can_access_workspace(account_username))
with check (public.can_access_workspace(account_username));

create policy "requirements_workspace_scope" on public.requirements
for all to authenticated
using (public.can_access_workspace(account_username))
with check (public.can_access_workspace(account_username));
