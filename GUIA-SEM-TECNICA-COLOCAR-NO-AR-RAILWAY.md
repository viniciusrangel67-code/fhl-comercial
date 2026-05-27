# Guia sem técnica — colocar a FHL Comercial no ar pelo Railway

Este pacote já foi preparado para o Railway.

## O que você precisa fazer

1. Criar uma conta no GitHub.
2. Criar um repositório chamado `fhl-comercial`.
3. Enviar todos os arquivos desta pasta para o GitHub.
4. Criar uma conta no Railway.
5. Clicar em `New Project`.
6. Escolher `Deploy from GitHub Repo`.
7. Selecionar o repositório `fhl-comercial`.
8. Dentro do projeto Railway, adicionar `PostgreSQL`.
9. No serviço da aplicação, abrir `Variables`.
10. Inserir as variáveis do arquivo `.env.railway.example`.
11. Ajustar `APP_ORIGIN` para o link público gerado pelo Railway.
12. Clicar em `Deploy`.

## Comandos já preparados

O Railway usará:

```bash
npm install
npm run railway:deploy
```

O comando `railway:deploy` faz:

```bash
npm run migrate && npm run seed && npm start
```

## O que deve funcionar depois do deploy

- Site público.
- Área restrita.
- Clientes.
- Processos.
- Financeiro.
- Documentos automáticos.
- Agenda.
- Calendário.
- Chat.
- Avisos.
- Leads.
- Calculadoras.
- SaaS.
- Suporte.
- Backups internos.

## O que ainda exige contratação/configuração externa

- API real de tribunais/publicações.
- Google Calendar.
- Gateway de pagamento.
- SMTP/e-mail.
- Storage externo de backups.
- DOCX real preenchido automaticamente.

## Observação importante

Este pacote facilita o deploy, mas o primeiro deploy ainda exige criação de conta, repositório e variáveis. Se você não tem familiaridade técnica, faça por etapas e valide cada tela antes de seguir.
