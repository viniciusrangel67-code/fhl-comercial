const express = require("express");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { demoMonthlyRates, compoundFactor } = require("../services/calculators/calculatorEngine");

const router = express.Router();
router.use(authRequired, tenantRequired);

const sources = {
  IPCA: { name: "IPCA", source: "IBGE/SIDRA ou BCB/SGS", frequency: "monthly", status: "demo_seed" },
  INPC: { name: "INPC", source: "IBGE/SIDRA ou BCB/SGS", frequency: "monthly", status: "demo_seed" },
  IPCA_E: { name: "IPCA-E", source: "IBGE/SIDRA ou BCB/SGS", frequency: "monthly", status: "demo_seed" },
  IGP_M: { name: "IGP-M", source: "FGV/IBRE", frequency: "monthly", status: "demo_seed" },
  SELIC: { name: "SELIC", source: "BCB/SGS", frequency: "monthly", status: "demo_seed" },
  TR: { name: "TR", source: "BCB/SGS", frequency: "monthly", status: "demo_seed" }
};

router.get("/", (_req, res) => {
  res.json({ data: Object.entries(sources).map(([code, meta]) => ({ code, ...meta })) });
});

router.get("/:code/serie", (req, res) => {
  const code = String(req.params.code || "IPCA").toUpperCase();
  const rates = demoMonthlyRates[code] || demoMonthlyRates.IPCA;
  res.json({ data: rates.map((value, i) => ({ reference: `M${i+1}`, percentage: value, source: sources[code]?.source || "demo" })) });
});

router.get("/:code/acumulado", (req, res) => {
  const code = String(req.params.code || "IPCA").toUpperCase();
  const months = Number(req.query.months || 12);
  const rates = (demoMonthlyRates[code] || demoMonthlyRates.IPCA).slice(0, months);
  res.json({ data: { code, months, factor: Number(compoundFactor(rates).toFixed(8)), rates } });
});

router.post("/sync", (_req, res) => {
  res.status(202).json({
    data: {
      status: "prepared",
      message: "Sincronização automática preparada. Em produção, conectar BCB/SGS, IBGE/SIDRA, FGV/IBRE e B3 conforme credenciais/fonte disponível."
    }
  });
});

module.exports = router;
