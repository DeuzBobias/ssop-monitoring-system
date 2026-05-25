-- SSOP Monitoring Records Management System
-- Run this file in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'Viewer'
    check (role in ('Admin', 'QA Personnel', 'Inspector', 'Viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'Viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns text
security definer
set search_path = public
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
security definer
set search_path = public
language sql
stable
as $$
  select coalesce(public.current_user_role() = 'Admin', false);
$$;

create table if not exists public.stock_management_records (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  warehouse_location text not null,
  checked_by text not null,
  record_date date not null,
  record_time time not null,
  product_name text not null,
  batch_lot_no text not null,
  quantity_in_stock numeric(12,2) not null check (quantity_in_stock >= 0),
  expiry_date date not null,
  storage_condition text not null check (storage_condition in ('Good', 'Needs Attention')),
  fifo_fefo_followed text not null check (fifo_fefo_followed in ('Yes', 'No')),
  inspector_initials text not null,
  corrective_action text,
  verified_by_qa text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.raw_material_receiving_records (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  supplier_name text not null,
  scheduled_delivery_date date not null,
  receiving_date date not null,
  delivery_vehicle_id text not null,
  quality_control_inspector text not null,
  record_time time not null,
  raw_material text not null,
  packaging_condition text not null check (packaging_condition in ('Good', 'Damaged')),
  moisture_expiry text not null,
  within_specs text not null check (within_specs in ('Yes', 'No')),
  quantity numeric(12,2) not null check (quantity >= 0),
  accepted_rejected text not null check (accepted_rejected in ('Accepted', 'Rejected')),
  inspector_initials text not null,
  received_by text not null,
  remarks_corrective_action text,
  verified_by_qa text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_truck_records (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  truck_plate_no text not null,
  driver_name text not null,
  checked_by text not null,
  record_date date not null,
  record_time time not null,
  exterior_condition text not null check (exterior_condition in ('Clean', 'Dirty')),
  interior_condition text not null check (interior_condition in ('Clean', 'Dirty')),
  odor text not null check (odor in ('Normal', 'Unusual')),
  pest_activity text not null check (pest_activity in ('Yes', 'No')),
  sanitized text not null check (sanitized in ('Yes', 'No')),
  maintenance_issues text not null check (maintenance_issues in ('Yes', 'No')),
  inspector_initials text not null,
  corrective_action text,
  verified_by_qa text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pest_control_records (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  inspection_date date not null,
  inspector_name text not null,
  inspection_area text not null,
  pest_activity_observed text not null check (pest_activity_observed in ('Yes', 'No')),
  type_of_pest text,
  corrective_action_taken text,
  inspector_initials text not null,
  verified_by_qa text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.oil_temperature_records (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  production_date date not null,
  batch_lot_no text not null,
  operator_name_id text not null,
  record_time time not null,
  oil_temperature_celsius numeric(5,2) not null,
  operator_initial text not null,
  corrective_action text,
  verified_by_qa text,
  status text not null check (status in ('Normal', 'Below Range', 'Above Range')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oil_temperature_status_matches_value check (
    (oil_temperature_celsius < 180 and status = 'Below Range')
    or (oil_temperature_celsius between 180 and 190 and status = 'Normal')
    or (oil_temperature_celsius > 190 and status = 'Above Range')
  ),
  constraint oil_temperature_deviation_requires_action check (
    status = 'Normal' or nullif(trim(corrective_action), '') is not null
  )
);

create table if not exists public.cleaning_sanitation_records (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  record_date date not null,
  record_time time not null,
  area_of_concern text not null,
  standard text not null check (standard in ('Yes', 'No')),
  action_taken text,
  sanitizer_used text not null,
  performed_by text not null,
  checked_by text not null,
  verified_by_qa text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  module text not null,
  record_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

create index if not exists idx_stock_created_by on public.stock_management_records(created_by);
create index if not exists idx_stock_date on public.stock_management_records(record_date);
create index if not exists idx_stock_condition on public.stock_management_records(storage_condition);

create index if not exists idx_raw_created_by on public.raw_material_receiving_records(created_by);
create index if not exists idx_raw_receiving_date on public.raw_material_receiving_records(receiving_date);
create index if not exists idx_raw_packaging on public.raw_material_receiving_records(packaging_condition);
create index if not exists idx_raw_disposition on public.raw_material_receiving_records(accepted_rejected);

create index if not exists idx_truck_created_by on public.delivery_truck_records(created_by);
create index if not exists idx_truck_date on public.delivery_truck_records(record_date);
create index if not exists idx_truck_maintenance on public.delivery_truck_records(maintenance_issues);

create index if not exists idx_pest_created_by on public.pest_control_records(created_by);
create index if not exists idx_pest_date on public.pest_control_records(inspection_date);
create index if not exists idx_pest_activity on public.pest_control_records(pest_activity_observed);

create index if not exists idx_oil_created_by on public.oil_temperature_records(created_by);
create index if not exists idx_oil_date on public.oil_temperature_records(production_date);
create index if not exists idx_oil_status on public.oil_temperature_records(status);

create index if not exists idx_clean_created_by on public.cleaning_sanitation_records(created_by);
create index if not exists idx_clean_date on public.cleaning_sanitation_records(record_date);
create index if not exists idx_clean_standard on public.cleaning_sanitation_records(standard);

create index if not exists idx_activity_user on public.activity_logs(user_id);
create index if not exists idx_activity_created on public.activity_logs(created_at desc);
create index if not exists idx_activity_module on public.activity_logs(module);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_stock_updated_at on public.stock_management_records;
create trigger set_stock_updated_at before update on public.stock_management_records
  for each row execute function public.set_updated_at();

drop trigger if exists set_raw_updated_at on public.raw_material_receiving_records;
create trigger set_raw_updated_at before update on public.raw_material_receiving_records
  for each row execute function public.set_updated_at();

drop trigger if exists set_truck_updated_at on public.delivery_truck_records;
create trigger set_truck_updated_at before update on public.delivery_truck_records
  for each row execute function public.set_updated_at();

drop trigger if exists set_pest_updated_at on public.pest_control_records;
create trigger set_pest_updated_at before update on public.pest_control_records
  for each row execute function public.set_updated_at();

drop trigger if exists set_oil_updated_at on public.oil_temperature_records;
create trigger set_oil_updated_at before update on public.oil_temperature_records
  for each row execute function public.set_updated_at();

drop trigger if exists set_clean_updated_at on public.cleaning_sanitation_records;
create trigger set_clean_updated_at before update on public.cleaning_sanitation_records
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.stock_management_records enable row level security;
alter table public.raw_material_receiving_records enable row level security;
alter table public.delivery_truck_records enable row level security;
alter table public.pest_control_records enable row level security;
alter table public.oil_temperature_records enable row level security;
alter table public.cleaning_sanitation_records enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can update own profile name" on public.profiles;
create policy "Users can update own profile name"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (
  public.is_admin()
  or (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()))
);

-- Generic record policies are repeated per table so Supabase can plan each table efficiently.
drop policy if exists "View stock records" on public.stock_management_records;
create policy "View stock records" on public.stock_management_records for select to authenticated using (true);
drop policy if exists "Create stock records" on public.stock_management_records;
create policy "Create stock records" on public.stock_management_records for insert to authenticated
with check (created_by = auth.uid() and public.current_user_role() in ('Admin', 'Inspector'));
drop policy if exists "Update stock records" on public.stock_management_records;
create policy "Update stock records" on public.stock_management_records for update to authenticated
using (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()))
with check (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()));
drop policy if exists "Delete stock records" on public.stock_management_records;
create policy "Delete stock records" on public.stock_management_records for delete to authenticated using (public.is_admin());

drop policy if exists "View raw records" on public.raw_material_receiving_records;
create policy "View raw records" on public.raw_material_receiving_records for select to authenticated using (true);
drop policy if exists "Create raw records" on public.raw_material_receiving_records;
create policy "Create raw records" on public.raw_material_receiving_records for insert to authenticated
with check (created_by = auth.uid() and public.current_user_role() in ('Admin', 'Inspector'));
drop policy if exists "Update raw records" on public.raw_material_receiving_records;
create policy "Update raw records" on public.raw_material_receiving_records for update to authenticated
using (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()))
with check (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()));
drop policy if exists "Delete raw records" on public.raw_material_receiving_records;
create policy "Delete raw records" on public.raw_material_receiving_records for delete to authenticated using (public.is_admin());

drop policy if exists "View truck records" on public.delivery_truck_records;
create policy "View truck records" on public.delivery_truck_records for select to authenticated using (true);
drop policy if exists "Create truck records" on public.delivery_truck_records;
create policy "Create truck records" on public.delivery_truck_records for insert to authenticated
with check (created_by = auth.uid() and public.current_user_role() in ('Admin', 'Inspector'));
drop policy if exists "Update truck records" on public.delivery_truck_records;
create policy "Update truck records" on public.delivery_truck_records for update to authenticated
using (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()))
with check (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()));
drop policy if exists "Delete truck records" on public.delivery_truck_records;
create policy "Delete truck records" on public.delivery_truck_records for delete to authenticated using (public.is_admin());

drop policy if exists "View pest records" on public.pest_control_records;
create policy "View pest records" on public.pest_control_records for select to authenticated using (true);
drop policy if exists "Create pest records" on public.pest_control_records;
create policy "Create pest records" on public.pest_control_records for insert to authenticated
with check (created_by = auth.uid() and public.current_user_role() in ('Admin', 'Inspector'));
drop policy if exists "Update pest records" on public.pest_control_records;
create policy "Update pest records" on public.pest_control_records for update to authenticated
using (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()))
with check (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()));
drop policy if exists "Delete pest records" on public.pest_control_records;
create policy "Delete pest records" on public.pest_control_records for delete to authenticated using (public.is_admin());

drop policy if exists "View oil records" on public.oil_temperature_records;
create policy "View oil records" on public.oil_temperature_records for select to authenticated using (true);
drop policy if exists "Create oil records" on public.oil_temperature_records;
create policy "Create oil records" on public.oil_temperature_records for insert to authenticated
with check (created_by = auth.uid() and public.current_user_role() in ('Admin', 'Inspector'));
drop policy if exists "Update oil records" on public.oil_temperature_records;
create policy "Update oil records" on public.oil_temperature_records for update to authenticated
using (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()))
with check (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()));
drop policy if exists "Delete oil records" on public.oil_temperature_records;
create policy "Delete oil records" on public.oil_temperature_records for delete to authenticated using (public.is_admin());

drop policy if exists "View cleaning records" on public.cleaning_sanitation_records;
create policy "View cleaning records" on public.cleaning_sanitation_records for select to authenticated using (true);
drop policy if exists "Create cleaning records" on public.cleaning_sanitation_records;
create policy "Create cleaning records" on public.cleaning_sanitation_records for insert to authenticated
with check (created_by = auth.uid() and public.current_user_role() in ('Admin', 'Inspector'));
drop policy if exists "Update cleaning records" on public.cleaning_sanitation_records;
create policy "Update cleaning records" on public.cleaning_sanitation_records for update to authenticated
using (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()))
with check (public.current_user_role() in ('Admin', 'QA Personnel') or (public.current_user_role() = 'Inspector' and created_by = auth.uid()));
drop policy if exists "Delete cleaning records" on public.cleaning_sanitation_records;
create policy "Delete cleaning records" on public.cleaning_sanitation_records for delete to authenticated using (public.is_admin());

drop policy if exists "View activity logs" on public.activity_logs;
create policy "View activity logs" on public.activity_logs for select to authenticated using (true);
drop policy if exists "Create activity logs" on public.activity_logs;
create policy "Create activity logs" on public.activity_logs for insert to authenticated
with check (user_id = auth.uid());
drop policy if exists "Delete activity logs" on public.activity_logs;
create policy "Delete activity logs" on public.activity_logs for delete to authenticated using (public.is_admin());

