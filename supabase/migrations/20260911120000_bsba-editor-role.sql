alter table public.account_profiles
  drop constraint if exists account_profiles_role_check;

alter table public.account_profiles
  add constraint account_profiles_role_check check (role in ('admin', 'editor', 'viewer'));

insert into public.account_profiles (username, role)
values ('BSBA-OM', 'editor')
on conflict (username) do update
set role = 'editor', updated_at = now();
