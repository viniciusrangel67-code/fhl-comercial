# FHL Comercial 1.5 — Central de Calculadoras Jurídicas

## Calculadoras implementadas

1. Atualização de valores.
2. Juros e correção monetária.
3. Pensão alimentícia.
4. Horas extras.
5. Verbas rescisórias.
6. Parcelas vencidas.
7. Atualização de débito judicial.

## Critérios técnicos

- Motor de cálculo centralizado em `src/services/calculators/calculatorEngine.js`.
- APIs em `/api/calculators`.
- Indexadores em `/api/indexers`.
- Migration própria para tabelas de indexadores, cálculos e memória de cálculo.
- Memória de cálculo exportável em JSON e imprimível.
- Alertas de conferência jurídica.

## Observação importante

Os índices usados em demonstração são sementes internas para teste de consistência. Em produção, o sistema deve sincronizar os indexadores com fontes oficiais, como BCB/SGS, IBGE/SIDRA, FGV/IBRE e B3, conforme disponibilidade técnica, credenciais e política de uso.
