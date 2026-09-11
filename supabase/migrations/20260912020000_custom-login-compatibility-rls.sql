-- Compatibility policies for the current custom username/password login.
-- These policies keep RLS enabled but do not isolate workspace rows at the database layer.
-- Replace with JWT-backed workspace policies before enabling multi-tenant enforcement.

alter table public.account_profiles enable row level security;
alter table public.subject_sections enable row level security;
alter table public.subjects enable row level security;
alter table public.requirements enable row level security;

drop policy if exists "prototype account profiles access" on public.account_profiles;
drop policy if exists "account_profiles_own_record_or_admin" on public.account_profiles;
drop policy if exists "account_profiles_admin_write" on public.account_profiles;
drop policy if exists "account_profiles_admin_update" on public.account_profiles;
drop policy if exists "prototype subject sections access" on public.subject_sections;
drop policy if exists "subject_sections_workspace_scope" on public.subject_sections;
drop policy if exists "prototype subjects access" on public.subjects;
drop policy if exists "subjects_workspace_scope" on public.subjects;
drop policy if exists "prototype requirements access" on public.requirements;
drop policy if exists "requirements_workspace_scope" on public.requirements;

create policy "compat account profiles access" on public.account_profiles
for all to anon, authenticated
using (true) with check (true);

create policy "compat subject sections access" on public.subject_sections
for all to anon, authenticated
using (true) with check (true);

create policy "compat subjects access" on public.subjects
for all to anon, authenticated
using (true) with check (true);

create policy "compat requirements access" on public.requirements
for all to anon, authenticated
using (true) with check (true);
