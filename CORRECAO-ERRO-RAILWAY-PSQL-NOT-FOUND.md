# Correção do erro Railway — `sh: psql: not found`

## Erro visto nos logs

```txt
sh: psql: not found
```

## O que significa

O Railway conseguiu chegar no comando de migração, mas o ambiente não tinha o programa `psql` instalado.

## Correção aplicada nesta versão 2.6

A migração deixou de depender do `psql` do sistema operacional.

Antes:

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

Agora:

```bash
node scripts/migrate.js
```

O arquivo `scripts/migrate.js` usa a biblioteca `pg` do Node.js para executar os SQLs diretamente no banco.

## O que fazer no Railway

1. Suba esta versão 2.6 para o GitHub.
2. Confira que existe o arquivo:

```txt
scripts/migrate.js
```

3. No Railway, clique em `Redeploy`.

Se aparecer outro erro depois disso, provavelmente será falta de `DATABASE_URL` ou PostgreSQL não adicionado.
