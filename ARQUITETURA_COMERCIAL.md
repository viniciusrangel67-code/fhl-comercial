# Arquitetura Comercial FHL 1.2

## Itens incorporados

1. Backend real: Node.js/Express.
2. Banco por cliente/escritório: `offices` + `office_id` nas entidades.
3. Login seguro: JWT, cookie HTTP-only e Google OAuth Workspace.
4. Controle de permissões: RBAC por perfil.
5. Multiusuário: usuários vinculados ao escritório.
6. Backup automático: `backup_jobs` e `backupService`.
7. Painel de administração: rotas `/api/admin`.
8. Modelo de cobrança: planos, assinaturas e faturas.
9. Política de privacidade e termos: `policies` + aceite.
10. Suporte técnico: `support_tickets`.
11. Deploy automatizado: Dockerfile, docker-compose e scripts.
12. Atualizações sem quebrar dados: `schema_migrations` e migration 1.2.
13. Separação por escritório: middleware `tenantRequired`.
14. Segurança/LGPD reforçada: logs, LGPD, auditoria e soft delete.
