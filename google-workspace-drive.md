# Google Workspace / Drive

## Fase atual

O MVP usa integração segura por links:

- link da pasta raiz;
- link da pasta do cliente;
- link da pasta do processo;
- link do arquivo;
- categoria;
- status;
- responsável.

## Fase profissional

A base backend já contém o serviço `src/services/driveService.js` e a rota:

```text
POST /api/documents/drive/folder
```

Ela está preparada para receber a implementação real com OAuth ou Domain-Wide Delegation.

## Estrutura recomendada

```text
Drive Compartilhado: FHL Advocacia
└── Clientes
    └── Nome do Cliente
        └── Processo nº ...
            ├── 01 - Procuração e Contrato
            ├── 02 - Documentos Pessoais
            ├── 03 - Provas
            ├── 04 - Petições
            ├── 05 - Decisões
            ├── 06 - Cálculos
            ├── 07 - Relatórios ao Cliente
            ├── 08 - Publicações e Intimações
            ├── 09 - Honorários e Financeiro
            └── 10 - Outros
```
