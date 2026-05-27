alter table generated_legal_documents
  add column if not exists document_group_id uuid,
  add column if not exists preview_summary text,
  add column if not exists financial_terms jsonb not null default '{}'::jsonb,
  add column if not exists legal_context jsonb not null default '{}'::jsonb;
insert into schema_migrations (version, description)
values ('2.2.0','Detalhes finos dos documentos automáticos e geração todos')
on conflict (version) do nothing;
