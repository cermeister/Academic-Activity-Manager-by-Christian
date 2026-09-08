update public.requirements
set status = 'Completed'
where status = 'Submitted';

alter table public.requirements
	drop constraint requirements_status_check,
	add constraint requirements_status_check check (status in ('Pending', 'Ongoing', 'Completed'));
