create extension if not exists "pgcrypto";

do $$ begin
  create type job_status as enum (
    'pending',
    'assigned',
    'in_progress',
    'completed',
    'issue',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists farmers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  memo text,
  created_at timestamptz not null default now()
);

create table if not exists fields (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references farmers(id) on delete cascade,
  field_name text not null,
  address text,
  center_lat double precision not null,
  center_lng double precision not null,
  polygon_geojson jsonb not null,
  area_size numeric,
  crop_name text,
  memo text,
  created_at timestamptz not null default now()
);

create table if not exists spray_teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  manager_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists spray_jobs (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references fields(id) on delete cascade,
  farmer_id uuid not null references farmers(id) on delete cascade,
  assigned_team_id uuid references spray_teams(id) on delete set null,
  scheduled_date date,
  status job_status not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  memo text,
  created_at timestamptz not null default now()
);

create table if not exists spray_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references spray_jobs(id) on delete cascade,
  photo_url text not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create table if not exists job_status_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references spray_jobs(id) on delete cascade,
  old_status job_status,
  new_status job_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists fields_farmer_id_idx on fields(farmer_id);
create index if not exists spray_jobs_field_id_idx on spray_jobs(field_id);
create index if not exists spray_jobs_assigned_team_id_idx on spray_jobs(assigned_team_id);
create index if not exists spray_jobs_status_idx on spray_jobs(status);
create index if not exists spray_jobs_scheduled_date_idx on spray_jobs(scheduled_date);
create index if not exists spray_photos_job_id_idx on spray_photos(job_id);

alter table farmers enable row level security;
alter table fields enable row level security;
alter table spray_teams enable row level security;
alter table spray_jobs enable row level security;
alter table spray_photos enable row level security;
alter table job_status_logs enable row level security;

create policy "authenticated users can read farmers"
  on farmers for select
  to authenticated
  using (true);

create policy "authenticated users can manage farmers"
  on farmers for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can read fields"
  on fields for select
  to authenticated
  using (true);

create policy "authenticated users can manage fields"
  on fields for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can read spray teams"
  on spray_teams for select
  to authenticated
  using (true);

create policy "authenticated users can manage spray teams"
  on spray_teams for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can read spray jobs"
  on spray_jobs for select
  to authenticated
  using (true);

create policy "authenticated users can manage spray jobs"
  on spray_jobs for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can read spray photos"
  on spray_photos for select
  to authenticated
  using (true);

create policy "authenticated users can upload spray photos"
  on spray_photos for insert
  to authenticated
  with check (uploaded_by = auth.uid() or uploaded_by is null);

create policy "authenticated users can read job status logs"
  on job_status_logs for select
  to authenticated
  using (true);

create policy "authenticated users can create job status logs"
  on job_status_logs for insert
  to authenticated
  with check (changed_by = auth.uid() or changed_by is null);

insert into storage.buckets (id, name, public)
values ('spray-photos', 'spray-photos', true)
on conflict (id) do nothing;

create policy "authenticated users can upload spray photo files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'spray-photos');

create policy "public can read spray photo files"
  on storage.objects for select
  to public
  using (bucket_id = 'spray-photos');
