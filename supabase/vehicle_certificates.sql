create table if not exists public.vehicle_certificates (
  id uuid primary key default gen_random_uuid(),
  public_key text not null unique,
  certificate_number text not null default '',
  certificate_date text not null default '',
  make_body text not null default '',
  importer_name text not null default '',
  declaration_number text not null default '',
  model text not null default '',
  country text not null default '',
  chassis_no text not null default '',
  engine_no text not null default '',
  color text not null default '',
  remarks text not null default '',
  user_id text not null default '',
  status text not null default 'VALID',
  created_at timestamptz not null default now()
);

alter table public.vehicle_certificates enable row level security;

grant select, insert, update, delete on table public.vehicle_certificates to authenticated;

revoke select, insert, update, delete on table public.vehicle_certificates from anon;

drop policy if exists "Anyone can read a vehicle certificate" on public.vehicle_certificates;
drop policy if exists "Signed-in users can read vehicles" on public.vehicle_certificates;
create policy "Signed-in users can read vehicles"
  on public.vehicle_certificates
  for select
  to authenticated
  using (true);

drop policy if exists "Dashboard can add a vehicle certificate" on public.vehicle_certificates;
create policy "Dashboard can add a vehicle certificate"
  on public.vehicle_certificates
  for insert
  to authenticated
  with check (true);

drop policy if exists "Dashboard can update a vehicle certificate" on public.vehicle_certificates;
create policy "Dashboard can update a vehicle certificate"
  on public.vehicle_certificates
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Dashboard can delete a vehicle certificate" on public.vehicle_certificates;
create policy "Dashboard can delete a vehicle certificate"
  on public.vehicle_certificates
  for delete
  to authenticated
  using (true);
