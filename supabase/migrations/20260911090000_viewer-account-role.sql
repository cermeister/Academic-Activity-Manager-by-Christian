alter table public.account_profiles
  add column if not exists role text not null default 'admin';

alter table public.account_profiles
  drop constraint if exists account_profiles_role_check;

alter table public.account_profiles
  add constraint account_profiles_role_check check (role in ('admin', 'viewer'));

insert into public.account_profiles (username, role)
values ('BSBA-OM', 'viewer')
on conflict (username) do update
set role = 'viewer', updated_at = now();