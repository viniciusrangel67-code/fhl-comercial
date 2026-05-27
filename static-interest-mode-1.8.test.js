const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const app = fs.readFileSync(path.join(root, "public", "app-comercial.html"), "utf8");
const routes = fs.readFileSync(path.join(root, "src/routes/calculators.js"), "utf8");
const engineSource = fs.readFileSync(path.join(root, "src/services/calculators/calculatorEngine.js"), "utf8");
const engine = require("../src/services/calculators/calculatorEngine");

assert(pkg.version === "2.5.0", "versão 2.5.0");
assert(app.includes("function interestModeSelect") && app.includes("Regime de juros"), "UI possui componente de regime de juros");
assert((routes.match(/interestMode:z\.enum\(\["simple","compound"\]\)\.default\("simple"\)/g) || []).length >= 4, "rotas validam interestMode simples/composto nas calculadoras com juros");
["interestAndCorrection", "overdueInstallments", "pension", "judicialDebtUpdate"].forEach(fn => assert(engineSource.includes(fn), `engine possui ${fn}`));
["overdueInstallments({ installmentAmount", "pension({ installmentAmount", "judicialDebtUpdate({ principal"].forEach(token => assert(engineSource.includes(token), `engine assinatura ${token}`));
assert(engineSource.includes('interestMode = "simple"'), "engine possui default simple");

const simple = engine.interestAndCorrection({ amount: 1000, startDate: "2025-01-01", endDate: "2025-12-01", indexCode: "TR", interestRateMonthly: 2, interestMode: "simple" });
const compound = engine.interestAndCorrection({ amount: 1000, startDate: "2025-01-01", endDate: "2025-12-01", indexCode: "TR", interestRateMonthly: 2, interestMode: "compound" });
assert(compound.interestAmount > simple.interestAmount, "juros compostos superam juros simples no mesmo período");

const pensionSimple = engine.pension({ installmentAmount: 500, firstDueDate: "2025-01-10", calculationDate: "2025-12-10", monthsCount: 6, indexCode: "INPC", interestRateMonthly: 2, interestMode: "simple" });
const pensionCompound = engine.pension({ installmentAmount: 500, firstDueDate: "2025-01-10", calculationDate: "2025-12-10", monthsCount: 6, indexCode: "INPC", interestRateMonthly: 2, interestMode: "compound" });
assert(pensionCompound.total > pensionSimple.total, "pensão aceita juros compostos e altera o resultado");

const overdueSimple = engine.overdueInstallments({ installmentAmount: 500, dueDates: ["2025-01-10","2025-02-10"], calculationDate: "2025-12-10", indexCode: "INPC", interestRateMonthly: 2, interestMode: "simple" });
const overdueCompound = engine.overdueInstallments({ installmentAmount: 500, dueDates: ["2025-01-10","2025-02-10"], calculationDate: "2025-12-10", indexCode: "INPC", interestRateMonthly: 2, interestMode: "compound" });
assert(overdueCompound.total > overdueSimple.total, "parcelas vencidas aceitam juros compostos e alteram o resultado");

const debtSimple = engine.judicialDebtUpdate({ principal: 10000, startDate: "2025-01-01", endDate: "2025-12-01", indexCode: "IPCA_E", interestRateMonthly: 2, interestMode: "simple", costs: 0, feesPercent: 0 });
const debtCompound = engine.judicialDebtUpdate({ principal: 10000, startDate: "2025-01-01", endDate: "2025-12-01", indexCode: "IPCA_E", interestRateMonthly: 2, interestMode: "compound", costs: 0, feesPercent: 0 });
assert(debtCompound.total > debtSimple.total, "débito judicial aceita juros compostos e altera o resultado");
