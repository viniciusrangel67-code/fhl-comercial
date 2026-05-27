# Pendências para produção real

## APIs externas ainda não conectadas

1. Tribunais/publicações/intimações: depende de fonte oficial, credenciais e regras de uso.
2. Google Calendar: depende de OAuth, domínio público, HTTPS e consent screen.
3. Gateway de pagamento: depende de provedor real, chaves, webhook e homologação.
4. SMTP/e-mail transacional: depende de provedor e credenciais.
5. Storage externo/backups: depende de S3/Drive corporativo/servidor.
6. Indexadores oficiais: depende de sincronização BCB/IBGE/FGV/B3.
7. DOCX real: depende de motor de preenchimento de placeholders, storage e download/assinatura.

## O que já existe internamente

- Rotas e telas internas preparadas.
- Modo demonstração.
- Banco/migrations preparados.
- Testes automatizados.
