create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.officers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_schedules (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null check (day_of_week between 1 and 7),
  officer_id uuid references public.officers(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique(day_of_week, officer_id)
);

create table if not exists public.jimpitan_records (
  id uuid primary key default gen_random_uuid(),
  officer_id uuid references public.officers(id) on delete set null,
  record_date date not null,
  amount bigint not null default 0 check (amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fines (
  id uuid primary key default gen_random_uuid(),
  officer_id uuid references public.officers(id) on delete set null,
  incident_date date not null,
  amount bigint not null default 15000 check (amount = 15000),
  payment_status text not null default 'unpaid' check (payment_status in ('paid', 'unpaid')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((payment_status = 'paid' and paid_at is not null) or (payment_status = 'unpaid'))
);

create index if not exists officers_name_idx on public.officers(name);
create index if not exists jimpitan_records_date_idx on public.jimpitan_records(record_date desc);
create index if not exists fines_incident_date_idx on public.fines(incident_date desc);
create index if not exists fines_status_idx on public.fines(payment_status);

alter table public.profiles enable row level security;
alter table public.officers enable row level security;
alter table public.weekly_schedules enable row level security;
alter table public.jimpitan_records enable row level security;
alter table public.fines enable row level security;

create policy "authenticated users manage profiles" on public.profiles for all to authenticated using (true) with check (true);
create policy "authenticated users manage officers" on public.officers for all to authenticated using (true) with check (true);
create policy "authenticated users manage schedules" on public.weekly_schedules for all to authenticated using (true) with check (true);
create policy "authenticated users manage jimpitan" on public.jimpitan_records for all to authenticated using (true) with check (true);
create policy "authenticated users manage fines" on public.fines for all to authenticated using (true) with check (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_weekly_schedules_updated_at on public.weekly_schedules;
create trigger set_weekly_schedules_updated_at before update on public.weekly_schedules for each row execute procedure public.set_updated_at();
drop trigger if exists set_jimpitan_records_updated_at on public.jimpitan_records;
create trigger set_jimpitan_records_updated_at before update on public.jimpitan_records for each row execute procedure public.set_updated_at();
drop trigger if exists set_fines_updated_at on public.fines;
create trigger set_fines_updated_at before update on public.fines for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
