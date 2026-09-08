create table public.account_profiles (
	username text primary key,
	display_name text not null default '',
	photo_data_url text not null default '',
	password_hash text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.account_profiles enable row level security;

create policy "prototype account profiles access" on public.account_profiles
	for all to anon, authenticated
	using (true) with check (true);
