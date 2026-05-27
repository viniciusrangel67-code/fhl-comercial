# Manual de Publicação

## 1. Hospedagem recomendada

Opções simples:

- Render;
- Railway;
- Fly.io;
- VPS com Ubuntu;
- Supabase para banco;
- Neon.tech para PostgreSQL.

## 2. Variáveis obrigatórias

Preencher `.env` com:

- `DATABASE_URL`;
- `JWT_SECRET`;
- `APP_ORIGIN`;
- `PORT`.

## 3. Banco de dados

Executar:

```bash
npm run schema
```

## 4. Usuário administrador

```bash
node scripts/create-admin.js "Vinicius Lisboa" vinicius@seudominio.com.br senha-forte
```

## 5. Google Workspace

Para integração real:

1. Acessar Google Cloud Console;
2. criar projeto;
3. habilitar Google Drive API;
4. configurar tela de consentimento OAuth;
5. criar OAuth Client;
6. informar redirect URI;
7. preencher `.env`;
8. implementar fluxo final de consentimento ou delegação de domínio.

## 6. Segurança mínima

- usar HTTPS;
- trocar `JWT_SECRET`;
- restringir CORS;
- usar senha forte;
- ativar backup do banco;
- revisar permissões.
