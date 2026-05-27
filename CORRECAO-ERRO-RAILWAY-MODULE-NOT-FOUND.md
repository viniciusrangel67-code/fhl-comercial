# Correção do erro Railway — MODULE_NOT_FOUND

## Erro visto nos logs

```txt
Error: Cannot find module './src/middleware/security'
Require stack:
- /app/server.js
```

## O que significa

O Railway encontrou `server.js`, mas não encontrou a pasta/arquivo:

```txt
src/middleware/security.js
```

Isso normalmente acontece quando o repositório GitHub foi enviado incompleto, sem a pasta `src`, ou quando foi enviada a pasta errada do ZIP.

## Como corrigir sem mexer em código

1. Baixe o pacote `fhl-comercial-2.5-railway-corrigido.zip`.
2. Extraia o ZIP.
3. Abra a pasta extraída.
4. Confirme que existem estes arquivos:

```txt
server.js
package.json
src/middleware/security.js
src/middleware/auth.js
src/routes/clients.js
public/app-comercial.html
railway.json
```

5. No GitHub, entre no repositório `fhl-comercial`.
6. Apague os arquivos atuais, se necessário.
7. Envie TODOS os arquivos e pastas da pasta extraída.
8. Confirme no GitHub que aparece a pasta `src`.
9. No Railway, clique em `Redeploy`.

## Não envie apenas o HTML

Este sistema não é apenas um HTML. Ele precisa das pastas:

```txt
src/
public/
sql/
templates/
tests/
```

Se uma delas faltar, o Railway pode quebrar o deploy.
