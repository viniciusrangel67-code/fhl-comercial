const { query } = require("../db");

async function requireCurrentPolicyAcceptance(req, res, next) {
  if (!req.user?.id || !req.officeId) return next();

  const result = await query(
    `select p.id
     from policies p
     left join policy_acceptances pa on pa.policy_id=p.id and pa.user_id=$1
     where p.active=true and pa.id is null
     limit 1`,
    [req.user.id]
  );

  if (result.rows[0]) {
    return res.status(428).json({
      success: false,
      error: { message: "Aceite dos termos/políticas vigente é obrigatório para continuar." },
      meta: { requestId: res.locals.requestId || null, timestamp: new Date().toISOString() }
    });
  }

  return next();
}

module.exports = { requireCurrentPolicyAcceptance };
