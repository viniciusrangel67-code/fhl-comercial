create table if not exists office_notices (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  title text not null,
  message text not null,
  priority text not null default 'normal',
  audience text not null default 'all',
  active boolean not null default true,
  pinned boolean not null default false,
  expires_at timestamptz,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id) on delete set null,
  deleted_reason text
);

create table if not exists internal_conversations (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  process_id uuid references processes(id) on delete set null,
  title text not null,
  conversation_type text not null default 'internal',
  priority text not null default 'normal',
  status text not null default 'open',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id) on delete set null,
  deleted_reason text
);

create table if not exists internal_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references internal_conversations(id) on delete cascade,
  office_id uuid not null references offices(id) on delete cascade,
  sender_user_id uuid references users(id) on delete set null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id) on delete set null,
  deleted_reason text
);

create table if not exists document_automation_templates (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid references offices(id) on delete cascade,
  code text not null,
  name text not null,
  template_file text,
  required_fields jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(office_id, code)
);

create table if not exists generated_legal_documents (
  id uuid primary key default uuid_generate_v4(),
  office_id uuid not null references offices(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  process_id uuid references processes(id) on delete set null,
  template_code text not null,
  title text not null,
  input_data jsonb not null default '{}'::jsonb,
  generated_text text,
  file_url text,
  status text not null default 'draft',
  generated_by uuid references users(id) on delete set null,
  generated_at timestamptz not null default now()
);

create index if not exists office_notices_office_idx on office_notices(office_id, active, pinned, created_at);
create index if not exists internal_conversations_office_idx on internal_conversations(office_id, status, updated_at);
create index if not exists internal_messages_conversation_idx on internal_messages(conversation_id, created_at);
create index if not exists generated_legal_documents_office_idx on generated_legal_documents(office_id, template_code, generated_at);

insert into document_automation_templates (office_id, code, name, template_file, required_fields)
values
(null, 'procuracao', 'Procuração', 'templates/documentos/Procuração.docx', '["cliente_nome","cliente_cpf","cliente_rg","cliente_endereco","outorgado_nome","poderes","foro"]'::jsonb),
(null, 'contrato_honorarios', 'Contrato de Honorários', 'templates/documentos/Contrato de Honorários.docx', '["cliente_nome","cliente_cpf_cnpj","servico","valor_honorarios","forma_pagamento","foro"]'::jsonb),
(null, 'hipossuficiencia', 'Declaração de Hipossuficiência', 'templates/documentos/Declaração de Hipossuficiência.docx', '["cliente_nome","cliente_cpf","estado_civil","profissao","renda","declaracao"]'::jsonb),
(null, 'faa', 'FAA - Ficha de Atendimento', 'templates/documentos/FAA.docx', '["cliente_nome","telefone","email","area","relato","documentos_entregues"]'::jsonb)
on conflict (office_id, code) do nothing;

insert into schema_migrations (version, description)
values ('2.0.0','Consolidação integral: chat, avisos, documentos automáticos e calendário visual')
on conflict (version) do nothing;
