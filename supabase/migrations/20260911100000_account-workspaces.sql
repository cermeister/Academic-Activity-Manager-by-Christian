alter table public.subject_sections
  add column if not exists account_username text not null default 'christiancervantes';

alter table public.subjects
  add column if not exists account_username text not null default 'christiancervantes';

alter table public.requirements
  add column if not exists account_username text not null default 'christiancervantes';

create index if not exists subject_sections_account_username_idx on public.subject_sections(account_username);
create index if not exists subjects_account_username_idx on public.subjects(account_username);
create index if not exists requirements_account_username_idx on public.requirements(account_username);

insert into public.subject_sections (account_username, name, sort_order)
select 'BSBA-OM', 'My Subjects', 0
where not exists (select 1 from public.subject_sections where account_username = 'BSBA-OM');