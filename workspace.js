const express = require("express");
const { z } = require("zod");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { ok, created } = require("../utils/apiResponse");
const { auditLog } = require("../services/audit");
const { generateLegalDocument: generateLegalDocumentService } = require("../services/documentAutomationService");

const router = express.Router();
router.use(authRequired, tenantRequired);

function log(req, module, action, entityType, detail) {
  auditLog({ userId: req.user?.id, officeId: req.officeId, module, action, entityType, detail: JSON.stringify(detail || {}), ip: req.ip });
}

router.get("/notices", async (req, res) => {
  const result = await query(
    `select n.*, u.name as created_by_name
     from office_notices n
     left join users u on u.id=n.created_by
     where n.office_id=$1 and n.deleted_at is null and n.active=true
     order by n.pinned desc, n.created_at desc
     limit 50`,
    [req.officeId]
  );
  return ok(res, result.rows);
});

router.post("/notices", async (req, res) => {
  const input = z.object({
    title: z.string().min(3),
    message: z.string().min(3),
    priority: z.enum(["baixa","normal","alta","urgente"]).default("normal"),
    audience: z.string().default("all"),
    pinned: z.boolean().default(false)
  }).parse(req.body);
  const result = await query(
    `insert into office_notices (office_id, title, message, priority, audience, pinned, created_by)
     values ($1,$2,$3,$4,$5,$6,$7) returning *`,
    [req.officeId, input.title, input.message, input.priority, input.audience, input.pinned, req.user.id]
  );
  log(req, "Avisos", "create", "notice", { id: result.rows[0].id });
  return created(res, result.rows[0]);
});

router.get("/conversations", async (req, res) => {
  const result = await query(
    `select c.*, cl.name as client_name, pr.number as process_number,
      (select count(*)::int from internal_messages m where m.conversation_id=c.id and m.read_at is null) as unread_count
     from internal_conversations c
     left join clients cl on cl.id=c.client_id
     left join processes pr on pr.id=c.process_id
     where c.office_id=$1 and c.deleted_at is null
     order by c.updated_at desc
     limit 100`,
    [req.officeId]
  );
  return ok(res, result.rows);
});

router.post("/conversations", async (req, res) => {
  const input = z.object({
    title: z.string().min(3),
    conversationType: z.string().default("internal"),
    priority: z.enum(["baixa","normal","alta","urgente"]).default("normal"),
    clientId: z.string().uuid().optional().nullable(),
    processId: z.string().uuid().optional().nullable(),
    message: z.string().optional().nullable()
  }).parse(req.body);
  const conv = await query(
    `insert into internal_conversations (office_id, client_id, process_id, title, conversation_type, priority, created_by)
     values ($1,$2,$3,$4,$5,$6,$7) returning *`,
    [req.officeId, input.clientId || null, input.processId || null, input.title, input.conversationType, input.priority, req.user.id]
  );
  if (input.message) {
    await query(
      `insert into internal_messages (conversation_id, office_id, sender_user_id, message)
       values ($1,$2,$3,$4)`,
      [conv.rows[0].id, req.officeId, req.user.id, input.message]
    );
  }
  log(req, "Chat Interno", "create", "conversation", { id: conv.rows[0].id });
  return created(res, conv.rows[0]);
});

router.get("/conversations/:id/messages", async (req, res) => {
  const result = await query(
    `select m.*, u.name as sender_name
     from internal_messages m
     left join users u on u.id=m.sender_user_id
     where m.office_id=$1 and m.conversation_id=$2 and m.deleted_at is null
     order by m.created_at asc`,
    [req.officeId, req.params.id]
  );
  return ok(res, result.rows);
});

router.post("/conversations/:id/messages", async (req, res) => {
  const input = z.object({ message: z.string().min(1) }).parse(req.body);
  const result = await query(
    `insert into internal_messages (conversation_id, office_id, sender_user_id, message)
     values ($1,$2,$3,$4) returning *`,
    [req.params.id, req.officeId, req.user.id, input.message]
  );
  await query(`update internal_conversations set updated_at=now() where id=$1 and office_id=$2`, [req.params.id, req.officeId]);
  log(req, "Chat Interno", "message", "conversation", { id: req.params.id });
  return created(res, result.rows[0]);
});

router.get("/document-templates", async (req, res) => {
  const result = await query(
    `select * from document_automation_templates
     where active=true and (office_id=$1 or office_id is null)
     order by name asc`,
    [req.officeId]
  );
  return ok(res, result.rows);
});

function renderGeneratedText(templateCode, data) {
  const name = data.cliente_nome || data.name || "CLIENTE";
  if (templateCode === "procuracao") {
    return `PROCURAÇÃO\n\nOUTORGANTE: ${name}, CPF ${data.cliente_cpf || "[CPF]"}, residente em ${data.cliente_endereco || "[ENDEREÇO]"}.\nOUTORGADO: ${data.outorgado_nome || "advogado(a) do escritório"}.\nPODERES: ${data.poderes || "poderes da cláusula ad judicia et extra"}.\nFORO/LOCAL: ${data.foro || "[FORO]"}.\n\nDocumento gerado automaticamente para conferência e revisão.`;
  }
  if (templateCode === "contrato_honorarios") {
    return `CONTRATO DE HONORÁRIOS\n\nCONTRATANTE: ${name}.\nSERVIÇO: ${data.servico || "[SERVIÇO]"}.\nHONORÁRIOS: ${data.valor_honorarios || "[VALOR]"}.\nFORMA DE PAGAMENTO: ${data.forma_pagamento || "[FORMA]"}.\nFORO: ${data.foro || "[FORO]"}.\n\nMinuta gerada automaticamente para revisão.`;
  }
  if (templateCode === "hipossuficiencia") {
    return `DECLARAÇÃO DE HIPOSSUFICIÊNCIA\n\n${name}, CPF ${data.cliente_cpf || "[CPF]"}, declara, para os fins legais, não possuir condições de arcar com custas e despesas processuais sem prejuízo do próprio sustento.\nRENDA INFORMADA: ${data.renda || "[RENDA]"}.\n\nMinuta gerada automaticamente para revisão.`;
  }
  return `FICHA DE ATENDIMENTO ADVOCATÍCIO\n\nCLIENTE: ${name}\nTELEFONE: ${data.telefone || "[TELEFONE]"}\nE-MAIL: ${data.email || "[E-MAIL]"}\nÁREA: ${data.area || "[ÁREA]"}\nRELATO: ${data.relato || "[RELATO]"}\nDOCUMENTOS: ${data.documentos_entregues || "[DOCUMENTOS]"}\n\nFicha gerada automaticamente.`;
}

router.post("/generate-document", async (req, res) => {
  const input = z.object({
    templateCode: z.enum(["todos","procuracao","contrato_honorarios","hipossuficiencia","faa"]),
    title: z.string().optional(),
    clientId: z.string().uuid().optional().nullable(),
    processId: z.string().uuid().optional().nullable(),
    data: z.record(z.any()).default({})
  }).parse(req.body);

  const templates = input.templateCode === "todos" ? ["procuracao","contrato_honorarios","hipossuficiencia","faa"] : [input.templateCode];
  const docs = [];
  for (const templateCode of templates) {
    const title = input.title && templates.length === 1 ? input.title : `Documento automático - ${templateCode}`;
    docs.push(await generateLegalDocumentService({
      officeId: req.officeId,
      userId: req.user.id,
      clientId: input.clientId || null,
      processId: input.processId || null,
      templateCode,
      title,
      data: input.data,
      documentGroupId: input.data?.document_group_id || null
    }));
  }
  log(req, "Documentos Automáticos", "generate", "document", { count: docs.length, templateCode: input.templateCode });
  return created(res, input.templateCode === "todos" ? { documents: docs, generated_text: docs.map(d=>d.generated_text).join("\n\n---\n\n") } : docs[0]);
});

router.get("/generated-documents", async (req, res) => {
  const result = await query(
    `select * from generated_legal_documents
     where office_id=$1
     order by generated_at desc
     limit 100`,
    [req.officeId]
  );
  return ok(res, result.rows);
});

router.get("/calendar/month", async (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear());
  const month = Number(req.query.month || (new Date().getMonth() + 1));
  const start = `${year}-${String(month).padStart(2,"0")}-01`;
  const result = await query(
    `select id, title, event_type, start_at, status
     from agenda_events
     where office_id=$1 and deleted_at is null
       and start_at >= $2::date
       and start_at < ($2::date + interval '1 month')
     order by start_at asc`,
    [req.officeId, start]
  );
  return ok(res, { year, month, events: result.rows });
});

module.exports = router;
