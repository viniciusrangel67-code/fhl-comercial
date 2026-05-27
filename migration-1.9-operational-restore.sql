create table if not exists publications_intimations (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  process_id uuid references processes(id) on delete set null,
  title text not null,
  source text not null default 'manual',
  external_id text,
  court text,
  publication_date date,
  availability_date date,
  deadline_date date,
  deadline_type text,
  status text not null default 'new',
  responsible_user_id uuid references users(id) on delete set null,
  raw_text text,
  notes text,
  created_task_id uuid references tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id) on delete set null,
  deleted_reason text
);

create table if not exists agenda_events (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  process_id uuid references processes(id) on delete set null,
  publication_id uuid references publications_intimations(id) on delete set null,
  title text not null,
  event_type text not null default 'prazo',
  start_at timestamptz not null,
  end_at timestamptz,
  status text not null default 'scheduled',
  location text,
  responsible_user_id uuid references users(id) on delete set null,
  description text,
  google_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id) on delete set null,
  deleted_reason text
);

create table if not exists site_leads (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  converted_client_id uuid references clients(id) on delete set null,
  name text not null,
  email text,
  phone text,
  source text not null default 'site',
  subject text,
  message text,
  practice_area text,
  status text not null default 'new',
  assigned_user_id uuid references users(id) on delete set null,
  consent_lgpd boolean not null default false,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id) on delete set null,
  deleted_reason text
);

create index if not exists publications_office_status_idx on publications_intimations(office_id, status, deadline_date);
create index if not exists agenda_office_start_idx on agenda_events(office_id, start_at, status);
create index if not exists site_leads_office_status_idx on site_leads(office_id, status, created_at);

insert into schema_migrations (version, description)
values ('1.9.0','Restauração operacional: publicações/intimações, agenda/prazos e contatos/leads')
on conflict (version) do nothing;
