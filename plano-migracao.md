# Plano de Migração do MVP para Profissional

## Etapa 1 — MVP validado

Usar o HTML atual com dados simulados e exportar backup JSON.

## Etapa 2 — Banco

Criar banco PostgreSQL e executar `sql/schema.sql`.

## Etapa 3 — Importação

Criar script de importação do JSON exportado pelo MVP para as tabelas:

- clients;
- processes;
- tasks;
- finance_entries;
- documents;
- lgpd_records;
- audit_logs.

## Etapa 4 — Login real

Criar usuários reais e bloquear credenciais locais.

## Etapa 5 — Drive

Migrar links manuais para registros documentais no banco.

## Etapa 6 — Produção

Publicar API e frontend em HTTPS.
