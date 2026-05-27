const express = require("express");
const { z } = require("zod");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { ok, created } = require("../utils/apiResponse");
const { auditLog } = require("../services/audit");

const router = express.Router();

function log(req, module, action, entityType, detail) {
  auditLog({ userId: req.user?.id, officeId: req.officeId, module, action, entityType, detail: JSON.stringify(detail || {}), ip: req.ip });
}

router.use(authRequired, tenantRequired);

router.get("/publications", async (req, res) => {
  const result = await query(
    `select p.*, c.name as client_name, pr.number as process_number
     from publications_intimations p
     left join clients c on c.id=p.client_id
     left join processes pr on pr.id=p.process_id
     where p.office_id=$1 and p.deleted_at is null
     order by coalesce(p.deadline_date, p.publication_date, p.created_at::date) asc
     limit 100`,
    [req.officeId]
  );
  return ok(res, result.rows);
});

router.post("/publications", async (req, res) => {
  const input = z.object({
    title: z.string().min(3),
    source: z.string().default("manual"),
    clientId: z.string().uuid().optional().nullable(),
    processId: z.string().uuid().optional().nullable(),
    court: z.string().optional().nullable(),
    publicationDate: z.string().optional().nullable(),
    availabilityDate: z.string().optional().nullable(),
    deadlineDate: z.string().optional().nullable(),
    deadlineType: z.string().optional().nullable(),
    rawText: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  }).parse(req.body);

  const result = await query(
    `insert into publications_intimations
     (office_id, client_id, process_id, title, source, court, publication_date, availability_date, deadline_date, deadline_type, raw_text, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     returning *`,
    [req.officeId, input.clientId || null, input.processId || null, input.title, input.source, input.court || null, input.publicationDate || null, input.availabilityDate || null, input.deadlineDate || null, input.deadlineType || null, input.rawText || null, input.notes || null]
  );
  log(req, "Publicações/Intimações", "create", "publication", { id: result.rows[0].id });
  return created(res, result.rows[0]);
});

router.post("/publications/:id/task", async (req, res) => {
  const pub = await query(`select * from publications_intimations where id=$1 and office_id=$2 and deleted_at is null`, [req.params.id, req.officeId]);
  if (!pub.rows[0]) return res.status(404).json({ success:false, error:{ message:"Publicação/intimação não encontrada." }});
  const p = pub.rows[0];
  const task = await query(
    `insert into tasks (office_id, client_id, process_id, title, description, due_date, status, priority, assigned_to)
     values ($1,$2,$3,$4,$5,$6,'pending','alta',$7)
     returning *`,
    [req.officeId, p.client_id, p.process_id, `Prazo: ${p.title}`, p.raw_text || p.notes || "Tarefa criada a partir de publicação/intimação.", p.deadline_date, req.user.id]
  );
  await query(`update publications_intimations set created_task_id=$1, status='task_created', updated_at=now() where id=$2`, [task.rows[0].id, p.id]);
  log(req, "Publicações/Intimações", "create_task", "publication", { publicationId: p.id, taskId: task.rows[0].id });
  return created(res, task.rows[0]);
});

router.get("/agenda", async (req, res) => {
  const result = await query(
    `select a.*, c.name as client_name, pr.number as process_number
     from agenda_events a
     left join clients c on c.id=a.client_id
     left join processes pr on pr.id=a.process_id
     where a.office_id=$1 and a.deleted_at is null
     order by a.start_at asc
     limit 150`,
    [req.officeId]
  );
  return ok(res, result.rows);
});

router.post("/agenda", async (req, res) => {
  const input = z.object({
    title: z.string().min(3),
    eventType: z.string().default("prazo"),
    startAt: z.string(),
    endAt: z.string().optional().nullable(),
    clientId: z.string().uuid().optional().nullable(),
    processId: z.string().uuid().optional().nullable(),
    publicationId: z.string().uuid().optional().nullable(),
    location: z.string().optional().nullable(),
    description: z.string().optional().nullable()
  }).parse(req.body);
  const result = await query(
    `insert into agenda_events
     (office_id, client_id, process_id, publication_id, title, event_type, start_at, end_at, location, responsible_user_id, description)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     returning *`,
    [req.officeId, input.clientId || null, input.processId || null, input.publicationId || null, input.title, input.eventType, input.startAt, input.endAt || null, input.location || null, req.user.id, input.description || null]
  );
  log(req, "Agenda/Prazos", "create", "agenda_event", { id: result.rows[0].id });
  return created(res, result.rows[0]);
});

router.patch("/agenda/:id/status", async (req, res) => {
  const input = z.object({ status: z.enum(["scheduled","done","cancelled","postponed"]) }).parse(req.body);
  const result = await query(
    `update agenda_events set status=$3, updated_at=now() where id=$1 and office_id=$2 returning *`,
    [req.params.id, req.officeId, input.status]
  );
  log(req, "Agenda/Prazos", "status", "agenda_event", { id: req.params.id, status: input.status });
  return ok(res, result.rows[0]);
});

router.get("/leads", async (req, res) => {
  const result = await query(
    `select * from site_leads
     where (office_id=$1 or office_id is null) and deleted_at is null
     order by created_at desc
     limit 100`,
    [req.officeId]
  );
  return ok(res, result.rows);
});

router.post("/leads", async (req, res) => {
  const input = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    source: z.string().default("site"),
    subject: z.string().optional().nullable(),
    message: z.string().optional().nullable(),
    practiceArea: z.string().optional().nullable(),
    consentLgpd: z.boolean().default(false)
  }).parse(req.body);

  const result = await query(
    `insert into site_leads (office_id, name, email, phone, source, subject, message, practice_area, consent_lgpd)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning *`,
    [req.officeId, input.name, input.email || null, input.phone || null, input.source, input.subject || null, input.message || null, input.practiceArea || null, input.consentLgpd]
  );
  log(req, "Contatos/Leads", "create", "lead", { id: result.rows[0].id });
  return created(res, result.rows[0]);
});

router.post("/leads/:id/convert", async (req, res) => {
  const lead = await query(`select * from site_leads where id=$1 and (office_id=$2 or office_id is null) and deleted_at is null`, [req.params.id, req.officeId]);
  if (!lead.rows[0]) return res.status(404).json({ success:false, error:{ message:"Lead não encontrado." }});
  const l = lead.rows[0];
  const client = await query(
    `insert into clients (office_id, name, email, phone, origin, notes)
     values ($1,$2,$3,$4,'site_lead',$5)
     returning *`,
    [req.officeId, l.name, l.email, l.phone, l.message || l.subject || null]
  );
  await query(`update site_leads set converted_client_id=$1, status='converted', converted_at=now(), updated_at=now() where id=$2`, [client.rows[0].id, l.id]);
  log(req, "Contatos/Leads", "convert", "lead", { leadId: l.id, clientId: client.rows[0].id });
  return created(res, client.rows[0]);
});

module.exports = router;
