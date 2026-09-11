insert into public.account_profiles (username, role, password_hash, display_name)
values
  ('Nestor', 'editor', '162a0edae43e7d06445fb017b13a6da45d596ae6158a17a7008fd8d477cb6c73', 'Nestor'),
  ('Levy', 'editor', '162a0edae43e7d06445fb017b13a6da45d596ae6158a17a7008fd8d477cb6c73', 'Levy'),
  ('JasminT', 'editor', '162a0edae43e7d06445fb017b13a6da45d596ae6158a17a7008fd8d477cb6c73', 'JasminT')
on conflict (username) do update
set role = excluded.role,
    password_hash = excluded.password_hash,
    display_name = excluded.display_name,
    updated_at = now();

insert into public.subject_sections (account_username, name, sort_order)
select 'Nestor', 'My Subjects', 0
where not exists (select 1 from public.subject_sections where account_username = 'Nestor');

insert into public.subject_sections (account_username, name, sort_order)
select 'Levy', 'My Subjects', 0
where not exists (select 1 from public.subject_sections where account_username = 'Levy');

insert into public.subject_sections (account_username, name, sort_order)
select 'JasminT', 'My Subjects', 0
where not exists (select 1 from public.subject_sections where account_username = 'JasminT');
