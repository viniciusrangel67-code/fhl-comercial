create extension if not exists "uuid-ossp";

create table if not exists offices (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  document text,
  email text,
  phone text,
  domain text,
  active boolean not null default true,
  plan_code text not null default 'starter',
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid,
  deleted_reason text
);

create table if not exists plans (
  code text primary key,
  name text not null,
  monthly_price numeric(14,2) not null default 0,
  max_users int not null default 3,
  max_clients int not null default 100,
  max_storage_gb int not null default 5,
  features jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into plans (code, name, monthly_price, max_users, max_clients, max_storage_gb, features)
values
('starter','Inicial',197.00,3,150,5,'{"site":true,"clientes":true,"processos":true,"financeiro":true,"drive_links":true}'::jsonb),
('professional','Profissional',397.00,8,800,25,'{"site":true,"clientes":true,"processos":true,"financeiro":true,"drive_api":true,"google_login":true,"lgpd":true}'::jsonb),
('premium','Premium',697.00,20,3000,100,'{"site":true,"clientes":true,"processos":true,"financeiro":true,"drive_api":true,"google_login":true,"lgpd":true,"suporte_prioritario":true}'::jsonb)
on conflict (code) do nothing;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  name text not null,
  email text not null,
  password_hash text,
  role text not null default 'advogado',
  active boolean not null default true,
  google_subject text unique,
  google_picture text,
  google_domain text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id),
  deleted_reason text,
  unique (office_id, email)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'offices_deleted_by_fk'
  ) then
    alter table offices
      add constraint offices_deleted_by_fk
      foreign key (deleted_by) references users(id);
  end if;
end $$;

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  plan_code text not null references plans(code),
  status text not null default 'trial',
  billing_provider text not null default 'manual',
  external_customer_id text,
  external_subscription_id text,
  current_period_start date,
  current_period_end date,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  amount numeric(14,2) not null,
  status text not null default 'open',
  due_date date,
  paid_at date,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  name text not null,
  document text,
  phone text,
  email text,
  address text,
  legal_representative jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id),
  deleted_reason text
);

create table if not exists processes (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  number text not null,
  opposing_party text,
  area text,
  court text,
  phase text,
  status text not null default 'ativo',
  responsible_user_id uuid references users(id),
  claim_value numeric(14,2),
  likely_value numeric(14,2),
  success_chance numeric(5,2),
  risk text not null default 'baixo',
  next_deadline date,
  internal_deadline date,
  strategy_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id),
  deleted_reason text,
  unique (office_id, client_id, number)
);

create table if not exists process_updates (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  process_id uuid not null references processes(id) on delete cascade,
  user_id uuid references users(id),
  text text not null,
  visibility text not null default 'internal',
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  title text not null,
  description text,
  client_id uuid references clients(id) on delete set null,
  process_id uuid references processes(id) on delete set null,
  created_by uuid references users(id),
  assigned_to uuid references users(id),
  priority text not null default 'normal',
  status text not null default 'pendente',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id),
  deleted_reason text
);

create table if not exists finance_entries (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  process_id uuid references processes(id) on delete set null,
  type text not null,
  description text not null,
  amount numeric(14,2) not null,
  due_date date,
  paid_at date,
  status text not null default 'aberto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id),
  deleted_reason text
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  process_id uuid references processes(id) on delete cascade,
  category text not null,
  name text not null,
  url text,
  google_file_id text,
  status text not null default 'recebido',
  notes text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id),
  deleted_reason text
);

create table if not exists lgpd_records (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  legal_basis text not null,
  data_category text not null,
  retention text,
  notes text,
  consent_evidence_url text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id),
  deleted_reason text
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists backup_jobs (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  status text not null default 'pending',
  file_path text,
  checksum text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists policies (
  id uuid primary key default uuid_generate_v4(),
  kind text not null,
  version text not null,
  title text not null,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (kind, version)
);

create table if not exists policy_acceptances (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  policy_id uuid references policies(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  ip_address text,
  unique(user_id, policy_id)
);

create table if not exists schema_migrations (
  version text primary key,
  description text,
  applied_at timestamptz not null default now()
);

insert into schema_migrations (version, description)
values ('1.2.0','Arquitetura comercial multiempresa, planos, suporte, backup e LGPD reforçada')
on conflict (version) do nothing;

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  module text not null,
  action text not null,
  entity_type text,
  entity_id uuid,
  detail text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_office_email on users(office_id, lower(email));
create index if not exists idx_users_google_subject on users(google_subject);
create index if not exists idx_clients_office on clients(office_id);
create index if not exists idx_processes_office_client on processes(office_id, client_id);
create index if not exists idx_tasks_office_due on tasks(office_id, due_date);
create index if not exists idx_finance_office_due on finance_entries(office_id, due_date);
create index if not exists idx_documents_office_client on documents(office_id, client_id);
create index if not exists idx_audit_office_created on audit_logs(office_id, created_at desc);
create index if not exists idx_support_office_status on support_tickets(office_id, status);
