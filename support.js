const express = require("express");
const { z } = require("zod");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { auditLog } = require("../services/audit");

const router = express.Router();
router.use(authRequired, tenantRequired);

router.get("/", async (req, res) => {
  const result = await query("select * from support_tickets where office_id=$1 order by created_at desc limit 300", [req.officeId]);
  res.json({ data: result.rows });
});

router.post("/", async (req, res) => {
  const body = z.object({
    subject: z.string().min(3),
    message: z.string().min(5),
    priority: z.string().optional().nullable()
  }).parse(req.body);

  const result = await query(
    `insert into support_tickets (office_id, user_id, subject, message, priority)
     values ($1,$2,$3,$4,$5) returning *`,
    [req.officeId, req.user.id, body.subject, body.message, body.priority || "normal"]
  );

  await auditLog({ userId: req.user.id, officeId: req.officeId, module: "Suporte", action: "Abrir chamado", entityType: "support_ticket", entityId: result.rows[0].id, ip: req.ip });
  res.status(201).json({ data: result.rows[0] });
});

router.patch("/:id/status", async (req, res) => {
  const body = z.object({ status: z.string() }).parse(req.body);

  const result = await query(
    "update support_tickets set status=$3, updated_at=now() where id=$1 and office_id=$2 returning *",
    [req.params.id, req.officeId, body.status]
  );

  if (!result.rows[0]) return res.status(404).json({ error: true, message: "Chamado não encontrado." });
  await auditLog({ userId: req.user.id, officeId: req.officeId, module: "Suporte", action: "Alterar status", entityType: "support_ticket", entityId: req.params.id, detail: body.status, ip: req.ip });
  res.json({ data: result.rows[0] });
});

module.exports = router;
