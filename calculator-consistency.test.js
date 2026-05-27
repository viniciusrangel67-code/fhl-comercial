const engine = require("../src/services/calculators/calculatorEngine");
function assertAlmost(actual, expected, tol, message) {
  if (Math.abs(actual - expected) > tol) {
    console.error("FALHA:", message, "esperado", expected, "obtido", actual);
    process.exitCode = 1;
  } else {
    console.log("OK:", message, actual);
  }
}
function assert(condition, message) {
  if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message);
}

// Horas extras: salário 2200, divisor 220, 10 HE 50%, sem noturno, DSR 25/5 => hora 10, HE 150, DSR 30, total 180
const he = engine.overtime({ salary: 2200, divisor: 220, overtimeHours: 10, additionalPercent: 50, nightHours: 0, dsrWorkdays: 25, dsrRestdays: 5 });
assertAlmost(he.hourlyRate, 10, 0.001, "salário-hora");
assertAlmost(he.overtimeValue, 150, 0.001, "horas extras");
assertAlmost(he.dsr, 30, 0.001, "DSR");
assertAlmost(he.total, 180, 0.001, "total horas extras");

// Verbas: salário 3000, 10 dias saldo, férias vencidas 0, FGTS 6000, sem justa causa, 12 meses => saldo 1000, 13º 3000, férias prop 3000, 1/3 1000, aviso 3000, multa 2400 = 13400
const sev = engine.severance({ salary: 3000, admissionDate: "2025-01-01", terminationDate: "2025-12-15", terminationType: "sem_justa_causa", vacationDue: 0, salaryBalanceDays: 10, fgtsBalance: 6000, thirteenthMonths: 12, vacationProportionalMonths: 12 });
assertAlmost(sev.salaryBalance, 1000, 0.001, "saldo salário");
assertAlmost(sev.thirteenth, 3000, 0.001, "13º");
assertAlmost(sev.proportionalVacation, 3000, 0.001, "férias proporcionais");
assertAlmost(sev.vacationThird, 1000, 0.001, "terço férias");
assertAlmost(sev.priorNotice, 3000, 0.001, "aviso");
assertAlmost(sev.fgtsFine, 2400, 0.001, "multa FGTS");
assertAlmost(sev.total, 13400, 0.001, "total rescisão");

// Correção sem meses inválidos não deve quebrar
const corr = engine.monetaryCorrection({ amount: 1000, startDate: "2025-01-01", endDate: "2025-01-01", indexCode: "IPCA" });
assert(corr.months === 1, "competência inclusiva");
assert(corr.total > 1000, "correção positiva IPCA demo");

// Juros simples: 1000 por 2 meses a 1% + correção deve ser maior que correção
const jc = engine.interestAndCorrection({ amount: 1000, startDate: "2025-01-01", endDate: "2025-02-01", indexCode: "TR", interestRateMonthly: 1 });
assert(jc.interestAmount > 0, "juros positivos");
assert(jc.totalWithInterest > jc.total, "total com juros maior");

// Parcelas vencidas: 3 parcelas deve gerar 3 itens
const pv = engine.overdueInstallments({ installmentAmount: 500, dueDates: ["2025-01-10","2025-02-10","2025-03-10"], calculationDate: "2025-04-10", indexCode: "INPC", interestRateMonthly: 1 });
assert(pv.items.length === 3, "3 parcelas vencidas");
assert(pv.total > 1500, "parcelas com atualização/juros");

// Débito judicial com honorários deve superar subtotal
const dj = engine.judicialDebtUpdate({ principal: 10000, startDate: "2025-01-01", endDate: "2025-03-01", indexCode: "IPCA_E", interestRateMonthly: 1, costs: 200, feesPercent: 10 });
assert(dj.total > 10200, "débito judicial total");
