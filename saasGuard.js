const { query } = require("../db");
const { evaluateUsage, canUseFeature } = require("../services/saas/saasPlanService");

async function loadSaasContext(req, _res, next) {
  if (!req.officeId) return next();

  const officeResult = await query(
    `select id, name, plan_code, billing_status, onboarding_status, blocked_at, blocked_reason, trial_ends_at
     from offices
     where id=$1 and deleted_at is null`,
    [req.officeId]
  );
  const office = officeResult.rows[0];

  if (!office) return next();

  const usageResult = await query(
    `select * from saas_usage_counters
     where office_id=$1
     order by period_start desc
     limit 1`,
    [req.officeId]
  );

  req.saas = {
    office,
    plan: office.plan_code || "starter",
    usageEvaluation: evaluateUsage(office.plan_code || "starter", usageResult.rows[0] || {})
  };

  return next();
}

function requireSaasAccess(req, res, next) {
  const office = req.saas?.office;
  if (!office) return next();

  if (office.blocked_at || ["suspended", "cancelled"].includes(office.billing_status)) {
    return res.status(402).json({
      success: false,
      error: {
        message: "Conta bloqueada ou assinatura inativa.",
        details: { billingStatus: office.billing_status, reason: office.blocked_reason }
      },
      meta: { requestId: res.locals.requestId || null, timestamp: new Date().toISOString() }
    });
  }

  if (!req.saas.usageEvaluation.allowed) {
    return res.status(403).json({
      success: false,
      error: {
        message: "Limite do plano excedido.",
        details: req.saas.usageEvaluation
      },
      meta: { requestId: res.locals.requestId || null, timestamp: new Date().toISOString() }
    });
  }

  return next();
}

function requireFeature(feature) {
  return (req, res, next) => {
    const planCode = req.saas?.plan || req.plan?.code || "starter";
    if (canUseFeature(planCode, feature)) return next();
    return res.status(403).json({
      success: false,
      error: { message: `Recurso indisponível no plano atual: ${feature}` },
      meta: { requestId: res.locals.requestId || null, timestamp: new Date().toISOString() }
    });
  };
}

module.exports = { loadSaasContext, requireSaasAccess, requireFeature };
