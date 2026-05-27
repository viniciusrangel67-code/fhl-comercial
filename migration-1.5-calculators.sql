create table if not exists legal_indexes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  source text not null,
  source_url text,
  frequency text not null default 'monthly',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists legal_index_values (
  id uuid primary key default uuid_generate_v4(),
  index_id uuid not null references legal_indexes(id) on delete cascade,
  reference_date date not null,
  percentage numeric(12,6),
  factor numeric(18,10),
  source text,
  fetched_at timestamptz not null default now(),
  checksum text,
  unique(index_id, reference_date)
);

create table if not exists legal_index_sync_logs (
  id uuid primary key default uuid_generate_v4(),
  index_id uuid references legal_indexes(id) on delete set null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  items_imported int not null default 0,
  error_message text
);

create table if not exists legal_calculations (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  process_id uuid references processes(id) on delete set null,
  calculator_type text not null,
  input_json jsonb not null,
  result_json jsonb not null,
  index_version text,
  created_at timestamptz not null default now()
);

create table if not exists legal_calculation_memory (
  id uuid primary key default uuid_generate_v4(),
  calculation_id uuid not null references legal_calculations(id) on delete cascade,
  html text,
  pdf_url text,
  created_at timestamptz not null default now()
);

insert into legal_indexes (code, name, source, source_url, frequency)
values
('IPCA','IPCA','IBGE/SIDRA ou BCB/SGS',null,'monthly'),
('INPC','INPC','IBGE/SIDRA ou BCB/SGS',null,'monthly'),
('IPCA_E','IPCA-E','IBGE/SIDRA ou BCB/SGS',null,'monthly'),
('IGP_M','IGP-M','FGV/IBRE',null,'monthly'),
('SELIC','SELIC','BCB/SGS',null,'monthly'),
('TR','TR','BCB/SGS',null,'monthly')
on conflict (code) do nothing;

insert into schema_migrations (version, description)
values ('1.5.0','Central de Calculadoras Jurídicas, indexadores e memória de cálculo')
on conflict (version) do nothing;
