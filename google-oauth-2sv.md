# Login com Google Workspace e Duas Etapas

## O que foi implementado

A versão 1.1 inclui:

- rota `GET /api/auth/google`;
- rota `GET /api/auth/google/callback`;
- validação de `id_token`;
- restrição por domínio Workspace (`GOOGLE_ALLOWED_DOMAIN`);
- criação automática de usuário Google, com papel inicial `advogado`;
- cookie HTTP-only de sessão;
- auditoria do login Google.

## Sobre duas etapas

A segunda etapa é realizada pela própria conta Google quando a organização exige 2-Step Verification no Google Workspace.

Fluxo:

```text
Usuário acessa o sistema
→ clica em Entrar com Google Workspace
→ Google autentica e aplica 2-Step Verification se exigido
→ sistema recebe id_token
→ sistema valida domínio autorizado
→ sistema cria sessão interna
```

## Configuração necessária

No Google Admin Console:

1. ativar/exigir 2-Step Verification para usuários do domínio;
2. garantir que os usuários estejam inscritos;
3. usar políticas por unidade organizacional ou grupo, se necessário.

No Google Cloud Console:

1. criar projeto;
2. habilitar OAuth;
3. configurar tela de consentimento;
4. criar OAuth Client tipo Web Application;
5. cadastrar redirect URI:
   `https://seudominio.com.br/api/auth/google/callback`;
6. preencher `.env`.

## Observação

O sistema não armazena senha Google. A autenticação fica sob responsabilidade do Google.
