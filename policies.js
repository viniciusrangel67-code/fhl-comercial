const express = require("express");
const { z } = require("zod");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { auditLog } = require("../services/audit");

const router = express.Router();

router.get("/", async (_req, res) => {
  const result = await query("select id, kind, version, title, body, created_at from policies where active=true order by kind, created_at desc");
  res.json({ data: result.rows });
});

router.post("/:id/accept", authRequired, tenantRequired, async (req, res) => {
  const body = z.object({ accepted: z.boolean() }).parse(req.body);
  if (!body.accepted) return res.status(400).json({ error: true, message: "Aceite obrigatório." });

  const result = await query(
    `insert into policy_acceptances (office_id, user_id, policy_id, ip_address)
     values ($1,$2,$3,$4)
     on conflict (user_id, policy_id) do update set accepted_at=now(), ip_address=excluded.ip_address
     returning *`,
    [req.officeId, req.user.id, req.params.id, req.ip]
  );

  await auditLog({ userId: req.user.id, officeId: req.officeId, module: "Políticas", action: "Aceitar política", entityType: "policy", entityId: req.params.id, ip: req.ip });
  res.json({ data: result.rows[0] });
});

module.exports = router;
