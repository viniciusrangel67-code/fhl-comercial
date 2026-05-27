create table if not exists saas_onboarding_flows (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  owner_user_id uuid references users(id) on delete set null,
  step text not null default 'created',
  status text not null default 'draft',
  checklist jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saas_usage_counters (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  users_count int not null default 0,
  clients_count int not null default 0,
  processes_count int not null default 0,
  documents_count int not null default 0,
  storage_bytes bigint not null default 0,
  api_calls int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(office_id, period_start, period_end)
);

create table if not exists saas_feature_flags (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  flag_key text not null,
  enabled boolean not null default false,
  source text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(office_id, flag_key)
);

create table if not exists saas_webhook_events (
  id uuid primary key default uuid_generate_v4(),
  provider text not null,
  event_type text not null,
  external_id text,
  office_id uuid references offices(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  signature_valid boolean not null default false,
  processed boolean not null default false,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique(provider, external_id)
);

create table if not exists saas_account_locks (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  lock_type text not null,
  reason text not null,
  active boolean not null default true,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  lifted_at timestamptz,
  lifted_by uuid references users(id) on delete set null
);

create table if not exists saas_provisioning_jobs (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  job_type text not null,
  status text not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  attempts int not null default 0,
  last_error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

alter table offices add column if not exists public_slug text;
alter table offices add column if not exists trial_ends_at timestamptz;
alter table offices add column if not exists billing_status text not null default 'trial';
alter table offices add column if not exists onboarding_status text not null default 'pending';
alter table offices add column if not exists blocked_at timestamptz;
alter table offices add column if not exists blocked_reason text;

create unique index if not exists offices_public_slug_unique on offices(public_slug) where public_slug is not null;
create index if not exists saas_usage_office_period_idx on saas_usage_counters(office_id, period_start, period_end);
create index if not exists saas_webhook_events_provider_idx on saas_webhook_events(provider, event_type, processed);
create index if not exists saas_account_locks_office_idx on saas_account_locks(office_id, active);

insert into schema_migrations (version, description)
values ('1.7.0','Arquitetura SaaS autônomo: onboarding, usage, feature flags, webhooks, account locks e provisioning')
on conflict (version) do nothing;
