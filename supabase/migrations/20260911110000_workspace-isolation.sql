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
