const express = require("express");
const { z } = require("zod");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { requireRole } = require("../middleware/rbac");
const { auditLog } = require("../services/audit");

const router = express.Router();
router.use(authRequired);

router.get("/plans", async (_req, res) => {
  const result = await query("select * from plans where active=true order by monthly_price asc");
  res.json({ data: result.rows });
});

router.get("/subscription", tenantRequired, async (req, res) => {
  const result = await query(
    `select s.*, p.name as plan_name, p.monthly_price, p.max_users, p.max_clients, p.max_storage_gb
     from subscriptions s
     join plans p on p.code=s.plan_code
     where s.office_id=$1
     order by s.created_at desc
     limit 1`,
    [req.officeId]
  );
  res.json({ data: result.rows[0] || null });
});

router.post("/change-plan", tenantRequired, requireRole("admin"), async (req, res) => {
  const body = z.object({ planCode: z.string().min(2) }).parse(req.body);
  const plan = await query("select code from plans where code=$1 and active=true", [body.planCode]);
  if (!plan.rows[0]) return res.status(404).json({ error: true, message: "Plano não encontrado." });

  const result = await query(
    `update subscriptions set plan_code=$2, status='active', updated_at=now()
     where office_id=$1
     returning *`,
    [req.officeId, body.planCode]
  );

  await query("update offices set plan_code=$2, updated_at=now() where id=$1", [req.officeId, body.planCode]);
  await auditLog({ userId: req.user.id, officeId: req.officeId, module: "Cobrança", action: "Alterar plano", entityType: "subscription", entityId: result.rows[0]?.id, detail: body.planCode, ip: req.ip });

  res.json({ data: result.rows[0] });
});

router.post("/manual-invoice", tenantRequired, requireRole("admin"), async (req, res) => {
  const body = z.object({
    amount: z.number(),
    dueDate: z.string(),
    description: z.string().optional().nullable()
  }).parse(req.body);

  const sub = await query("select id from subscriptions where office_id=$1 order by created_at desc limit 1", [req.officeId]);
  const result = await query(
    `insert into invoices (office_id, subscription_id, amount, due_date, description)
     values ($1,$2,$3,$4,$5) returning *`,
    [req.officeId, sub.rows[0]?.id || null, body.amount, body.dueDate, body.description || "Mensalidade"]
  );

  await auditLog({ userId: req.user.id, officeId: req.officeId, module: "Cobrança", action: "Gerar fatura manual", entityType: "invoice", entityId: result.rows[0].id, ip: req.ip });
  res.status(201).json({ data: result.rows[0] });
});

module.exports = router;
