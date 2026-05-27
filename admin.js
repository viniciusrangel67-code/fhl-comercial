const express = require("express");
const { z } = require("zod");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { auditLog } = require("../services/audit");

const router = express.Router();
router.use(authRequired, requireRole("admin"));

router.get("/offices", async (_req, res) => {
  const result = await query("select id, name, slug, email, active, plan_code, trial_ends_at, created_at from offices where deleted_at is null order by created_at desc");
  res.json({ data: result.rows });
});

router.post("/offices", async (req, res) => {
  const input = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    email: z.string().email().optional().nullable(),
    planCode: z.string().optional().nullable()
  }).parse(req.body);

  const result = await query(
    `insert into offices (name, slug, email, plan_code, trial_ends_at)
     values ($1,$2,$3,$4, now() + interval '14 days') returning *`,
    [input.name, input.slug, input.email || null, input.planCode || "starter"]
  );

  await query(
    `insert into subscriptions (office_id, plan_code, status, current_period_start, current_period_end)
     values ($1,$2,'trial', current_date, current_date + interval '14 days')`,
    [result.rows[0].id, input.planCode || "starter"]
  );

  await auditLog({ userId: req.user.id, officeId: result.rows[0].id, module: "Admin", action: "Criar escritório", entityType: "office", entityId: result.rows[0].id, ip: req.ip });
  res.status(201).json({ data: result.rows[0] });
});

router.get("/metrics", async (_req, res) => {
  const [offices, users, clients, tickets] = await Promise.all([
    query("select count(*)::int as total from offices where deleted_at is null"),
    query("select count(*)::int as total from users where deleted_at is null"),
    query("select count(*)::int as total from clients where deleted_at is null"),
    query("select count(*)::int as total from support_tickets where status <> 'closed'")
  ]);

  res.json({
    data: {
      offices: offices.rows[0].total,
      users: users.rows[0].total,
      clients: clients.rows[0].total,
      openTickets: tickets.rows[0].total
    }
  });
});

module.exports = router;
