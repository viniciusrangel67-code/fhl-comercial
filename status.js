const express = require("express");
const { config } = require("../config");
const { PLAN_LIMITS } = require("../middleware/planGuard");
const { ok } = require("../utils/apiResponse");

const router = express.Router();

router.get("/architecture", (_req, res) => {
  return ok(res, {
    app: "FHL Comercial",
    version: config.appVersion || process.env.npm_package_version || "1.7.0",
    architecture: {
      pattern: "routes/controllers-light/services/repositories-ready",
      responseStandard: true,
      requestContext: true,
      globalErrorHandler: true,
      rbac: true,
      tenantIsolation: true,
      planGuards: true,
      policyGuards: true,
      onboardingFlow: true,
      usageMetering: true,
      featureFlags: true,
      webhookReceiver: true,
      accountLocks: true,
      provisioningJobs: true,
      calculatorsEngine: true,
      indexersPrepared: true,
      dockerReady: true
    },
    readiness: {
      demo: "ready",
      assistedDeployment: "ready_for_real_environment",
      autonomousSaas: "code_ready_requires_external_credentials"
    },
    externalDependencies: [
      "PostgreSQL real",
      "Domínio e HTTPS",
      "Google OAuth/Workspace",
      "SMTP",
      "Gateway de pagamento",
      "Storage externo para backups",
      "Sincronização oficial dos indexadores"
    ],
    planLimits: PLAN_LIMITS
  });
});

module.exports = router;
