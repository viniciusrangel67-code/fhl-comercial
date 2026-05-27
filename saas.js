const express = require("express");
const { z } = require("zod");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { platformAdminOnly } = require("../middleware/rbac");
const { ok, created, accepted } = require("../utils/apiResponse");
const { PLAN_CATALOG, evaluateUsage } = require("../services/saas/saasPlanService");
const { createOnboardingFlow, updateChecklist } = require("../services/saas/onboardingService");
const { setBillingStatus, lockAccount, unlockAccount } = require("../services/saas/billingLifecycleService");
const { usageStatus } = require("../services/saas/usageService");
const { validateSignature, recordWebhookEvent } = require("../services/saas/webhookService");

const router = express.Router();

router.get("/plans", (_req, res) => ok(res, Object.values(PLAN_CATALOG)));

router.post("/onboarding", authRequired, async (req, res) => {
  const input = z.object({
    officeName: z.string().min(2),
    publicSlug: z.string().min(3).regex(/^[a-z0-9-]+$/),
    planCode: z.enum(["starter","professional","premium"]).default("starter")
  }).parse(req.body);

  const office = await query(
    `insert into offices (name, public_slug, plan_code, billing_status, onboarding_status, trial_ends_at)
     values ($1,$2,$3,'trial','in_progress',now() + interval '14 days')
     returning *`,
    [input.officeName, input.publicSlug, input.planCode]
  );

  await query(`update users set office_id=$1, role='admin' where id=$2`, [office.rows[0].id, req.user.id]);
  const flow = await createOnboardingFlow({ officeId: office.rows[0].id, ownerUserId: req.user.id, planCode: input.planCode });
  return created(res, { office: office.rows[0], onboarding: flow });
});

router.get("/me", authRequired, tenantRequired, async (req, res) => {
  const office = await query(`select id, name, public_slug, plan_code, billing_status, onboarding_status, trial_ends_at, blocked_at, blocked_reason from offices where id=$1`, [req.officeId]);
  const usage = await usageStatus({ officeId: req.officeId, planCode: office.rows[0]?.plan_code || "starter" });
  return ok(res, { office: office.rows[0], usage });
});

router.patch("/onboarding/checklist", authRequired, tenantRequired, async (req, res) => {
  const input = z.object({ patch: z.record(z.boolean()) }).parse(req.body);
  const flow = await updateChecklist({ officeId: req.officeId, patch: input.patch });
  await query(`update offices set onboarding_status=$2 where id=$1`, [req.officeId, flow.status]);
  return ok(res, flow);
});

router.get("/usage", authRequired, tenantRequired, async (req, res) => {
  const office = await query(`select plan_code from offices where id=$1`, [req.officeId]);
  return ok(res, await usageStatus({ officeId: req.officeId, planCode: office.rows[0]?.plan_code || "starter" }));
});

router.post("/billing/status", authRequired, tenantRequired, async (req, res) => {
  const input = z.object({ status: z.enum(["trial","active","past_due","suspended","cancelled"]), reason: z.string().optional() }).parse(req.body);
  return ok(res, await setBillingStatus({ officeId: req.officeId, status: input.status, reason: input.reason || null }));
});

router.post("/account/lock", authRequired, tenantRequired, async (req, res) => {
  const input = z.object({ lockType: z.string().default("manual"), reason: z.string().min(3) }).parse(req.body);
  return accepted(res, await lockAccount({ officeId: req.officeId, lockType: input.lockType, reason: input.reason, createdBy: req.user.id }));
});

router.post("/account/unlock", authRequired, tenantRequired, async (req, res) => {
  return ok(res, await unlockAccount({ officeId: req.officeId, liftedBy: req.user.id }));
});

router.post("/webhooks/:provider", async (req, res) => {
  const provider = req.params.provider;
  const signature = req.headers["x-fhl-signature"] || req.headers["x-signature"];
  const secret = process.env.WEBHOOK_SECRET;
  const valid = validateSignature({ payload: req.body, signature, secret });
  const event = await recordWebhookEvent({
    provider,
    eventType: req.body.type || req.body.event || "unknown",
    externalId: req.body.id || req.body.event_id || `${provider}-${Date.now()}`,
    officeId: req.body.office_id || null,
    payload: req.body,
    signatureValid: valid
  });
  return accepted(res, { received: true, signatureValid: valid, eventId: event.id });
});

router.get("/platform/offices", authRequired, platformAdminOnly, async (_req, res) => {
  const result = await query(`select id, name, public_slug, plan_code, billing_status, onboarding_status, trial_ends_at, created_at from offices order by created_at desc limit 100`);
  return ok(res, result.rows);
});

module.exports = router;
