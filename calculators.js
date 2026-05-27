const express = require("express");
const { z } = require("zod");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { auditLog } = require("../services/audit");
const engine = require("../services/calculators/calculatorEngine");

const router = express.Router();
router.use(authRequired, tenantRequired);

function respond(req, res, title, input, result) {
  const memory = engine.buildMemory(title, input, result);
  auditLog({ userId: req.user.id, officeId: req.officeId, module: "Calculadoras", action: title, entityType: "calculation", detail: JSON.stringify({ title }), ip: req.ip });
  res.json({ data: { title, input, result, memory } });
}

router.post("/atualizacao-valores", (req, res) => {
  const input = z.object({ amount:z.number(), startDate:z.string(), endDate:z.string(), indexCode:z.string().default("IPCA") }).parse(req.body);
  respond(req, res, "Atualização de valores", input, engine.monetaryCorrection(input));
});

router.post("/juros-correcao", (req, res) => {
  const input = z.object({ amount:z.number(), startDate:z.string(), endDate:z.string(), indexCode:z.string().default("IPCA"), interestRateMonthly:z.number().default(1), interestMode:z.enum(["simple","compound"]).default("simple") }).parse(req.body);
  respond(req, res, "Juros e correção monetária", input, engine.interestAndCorrection(input));
});

router.post("/pensao-alimenticia", (req, res) => {
  const input = z.object({ installmentAmount:z.number(), firstDueDate:z.string(), calculationDate:z.string(), monthsCount:z.number(), indexCode:z.string().default("INPC"), interestRateMonthly:z.number().default(1), interestMode:z.enum(["simple","compound"]).default("simple") }).parse(req.body);
  respond(req, res, "Pensão alimentícia", input, engine.pension(input));
});

router.post("/horas-extras", (req, res) => {
  const input = z.object({ salary:z.number(), divisor:z.number().default(220), overtimeHours:z.number().default(0), additionalPercent:z.number().default(50), nightHours:z.number().default(0), nightAdditionalPercent:z.number().default(20), dsrWorkdays:z.number().default(25), dsrRestdays:z.number().default(5) }).parse(req.body);
  respond(req, res, "Horas extras", input, engine.overtime(input));
});

router.post("/verbas-rescisorias", (req, res) => {
  const input = z.object({ salary:z.number(), admissionDate:z.string(), terminationDate:z.string(), terminationType:z.string().default("sem_justa_causa"), vacationDue:z.number().default(0), salaryBalanceDays:z.number().default(0), fgtsBalance:z.number().default(0), thirteenthMonths:z.number().optional(), vacationProportionalMonths:z.number().optional() }).parse(req.body);
  respond(req, res, "Verbas rescisórias", input, engine.severance(input));
});

router.post("/parcelas-vencidas", (req, res) => {
  const input = z.object({ installmentAmount:z.number(), dueDates:z.array(z.string()), calculationDate:z.string(), indexCode:z.string().default("INPC"), interestRateMonthly:z.number().default(1), interestMode:z.enum(["simple","compound"]).default("simple") }).parse(req.body);
  respond(req, res, "Parcelas vencidas", input, engine.overdueInstallments(input));
});

router.post("/debito-judicial", (req, res) => {
  const input = z.object({ principal:z.number(), startDate:z.string(), endDate:z.string(), indexCode:z.string().default("IPCA_E"), interestRateMonthly:z.number().default(1), interestMode:z.enum(["simple","compound"]).default("simple"), costs:z.number().default(0), feesPercent:z.number().default(10) }).parse(req.body);
  respond(req, res, "Atualização de débito judicial", input, engine.judicialDebtUpdate(input));
});

module.exports = router;
