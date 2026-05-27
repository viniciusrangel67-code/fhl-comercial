# FHL Comercial 1.3 — Implementações realizadas

## Implementado no código

1. Frontend comercial conectado à API: `public/app-comercial.html`.
2. Cliente central de API: `public/api-client.js`.
3. Modo demonstração local para testes sem servidor.
4. Telas de clientes, processos, tarefas, financeiro, documentos e LGPD.
5. Telas de administração, cobrança, suporte, backups e políticas.
6. Middleware de segurança com Helmet e Rate Limit.
7. RBAC reforçado com matriz de permissões.
8. Rotas reescritas com segregação por escritório em módulos centrais.
9. Migration 1.3 com termos e política seed.
10. Scripts de verificação, seed e checklist de deploy.
11. Testes estáticos de arquitetura, frontend/API e segurança/LGPD.

## Ainda depende de ambiente externo

- Banco PostgreSQL real.
- Credenciais Google Cloud/OAuth.
- Domínio e HTTPS.
- Gateway de pagamento real.
- Serviço SMTP/e-mail.
- Storage externo de backup.
- Deploy em Render/Railway/VPS.
