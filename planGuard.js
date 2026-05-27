const { query } = require("../db");

const PLAN_LIMITS = {
  starter: { users: 3, clients: 150, storageGb: 5 },
  professional: { users: 8, clients: 800, storageGb: 25 },
  premium: { users: 20, clients: 3000, storageGb: 100 }
};

async function loadPlanContext(req, _res, next) {
  if (!req.officeId) return next();

  const result = await query(
    `select o.plan_code, s.status
     from offices o
     left join subscriptions s on s.office_id=o.id
     where o.id=$1 and o.deleted_at is null
     order by s.created_at desc
     limit 1`,
    [req.officeId]
  );

  const row = result.rows[0];
  req.plan = {
    code: row?.plan_code || "starter",
    status: row?.status || "trial",
    limits: PLAN_LIMITS[row?.plan_code] || PLAN_LIMITS.starter
  };

  return next();
}

function requireActiveSubscription(req, res, next) {
  const allowed = ["trial", "active"];
  if (!req.plan || allowed.includes(req.plan.status)) return next();
  return res.status(402).json({
    success: false,
    error: { message: "Assinatura inativa ou inadimplente." },
    meta: { requestId: res.locals.requestId || null, timestamp: new Date().toISOString() }
  });
}

module.exports = { PLAN_LIMITS, loadPlanContext, requireActiveSubscription };
