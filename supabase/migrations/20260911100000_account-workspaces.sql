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

create or replace function public.requirement_account_matches_subject()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.subjects
    where id = new.subject_id
      and account_username = new.account_username
  ) then
    raise exception 'Requirement and subject must belong to the same account workspace';
  end if;
  return new;
end;
$$;

drop trigger if exists requirements_account_matches_subject on public.requirements;
create trigger requirements_account_matches_subject
before insert or update of subject_id, account_username on public.requirements
for each row execute function public.requirement_account_matches_subject();