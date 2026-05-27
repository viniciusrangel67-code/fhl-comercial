# FHL Profissional 1.0

Esta pasta contém a finalização possível da versão profissional do sistema **Fonseca Hespanha Lisboa Advocacia**, indo além do HTML/localStorage.

Ela entrega:

- Backend Node.js/Express;
- Banco PostgreSQL;
- autenticação JWT;
- senhas criptografadas com bcrypt;
- permissões por perfil;
- logs de auditoria;
- clientes;
- processos;
- tarefas;
- financeiro;
- documentos;
- LGPD;
- contrato de integração com Google Workspace/Drive;
- MVP local preservado em `public/mvp-local.html`.

## O que ainda depende de implantação externa

Esta entrega não publica o sistema automaticamente, pois isso exige:

- servidor/hospedagem;
- banco PostgreSQL real;
- variáveis `.env`;
- domínio;
- credenciais Google Cloud/OAuth;
- conta Google Workspace configurada.

## Instalação local

```bash
cp .env.example .env
npm install
npm run check
npm run schema
node scripts/create-admin.js "Administrador FHL" admin@seudominio.com.br senha-forte
npm run dev
```

Depois acesse:

```text
http://localhost:3000
http://localhost:3000/mvp
http://localhost:3000/api/health
```

## Perfis sugeridos

- `admin`;
- `advogado`;
- `financeiro`;
- `atendimento`.

## Próximo passo técnico

1. Criar banco PostgreSQL;
2. preencher `.env`;
3. executar `sql/schema.sql`;
4. criar usuário administrador;
5. publicar backend;
6. configurar frontend;
7. configurar OAuth Google Workspace;
8. migrar dados do backup JSON do MVP.


## Versão 1.1

Melhorias adicionadas:

- troca de `@googleapis/drive` por `googleapis`;
- login com Google Workspace/OAuth;
- suporte a 2-Step Verification via política do Google Workspace;
- cookies HTTP-only;
- soft delete auditado;
- restauração de registros arquivados;
- Dockerfile;
- docker-compose com PostgreSQL;
- frontend inicial conectado à API em `/app.html`;
- testes estáticos de arquitetura;
- migration SQL 1.1.
