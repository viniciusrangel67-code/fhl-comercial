const { query } = require("../db");

/**
 * Resolve o escritório/tenant do usuário autenticado.
 * Em rotas autenticadas, req.user.officeId deve vir do JWT.
 * Em implantação multiempresa, todas as consultas devem filtrar office_id.
 */
async function tenantRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: true, message: "Autenticação obrigatória." });
  }

  const officeId = req.user.officeId || req.headers["x-office-id"];
  if (!officeId) {
    return res.status(403).json({ error: true, message: "Escritório não identificado." });
  }

  const result = await query("select id, name, slug, active from offices where id=$1 and deleted_at is null", [officeId]);
  const office = result.rows[0];

  if (!office || !office.active) {
    return res.status(403).json({ error: true, message: "Escritório inativo ou não autorizado." });
  }

  req.office = office;
  req.officeId = office.id;
  return next();
}

function officeFilter(req) {
  if (!req.officeId) {
    const error = new Error("Office ID ausente.");
    error.publicMessage = "Escritório não identificado.";
    error.status = 403;
    throw error;
  }
  return req.officeId;
}

module.exports = { tenantRequired, officeFilter };
