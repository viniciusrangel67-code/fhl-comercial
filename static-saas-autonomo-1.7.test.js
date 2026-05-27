const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const app = fs.readFileSync(path.join(root, "public", "app-comercial.html"), "utf8");
const api = fs.readFileSync(path.join(root, "public", "api-client.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "sql", "migration-1.7-saas-autonomo.sql"), "utf8");

assert(pkg.version === "2.5.0", "versão 2.5.0");
[
  "src/routes/saas.js",
  "src/middleware/saasGuard.js",
  "src/services/saas/saasPlanService.js",
  "src/services/saas/onboardingService.js",
  "src/services/saas/billingLifecycleService.js",
  "src/services/saas/usageService.js",
  "src/services/saas/webhookService.js",
  "sql/migration-1.7-saas-autonomo.sql",
  "docs/SAAS_AUTONOMO_1.7.md"
].forEach(file => assert(fs.existsSync(path.join(root, file)), `arquivo ${file}`));

[
  "saas_onboarding_flows",
  "saas_usage_counters",
  "saas_feature_flags",
  "saas_webhook_events",
  "saas_account_locks",
  "saas_provisioning_jobs",
  "billing_status",
  "onboarding_status",
  "trial_ends_at"
].forEach(token => assert(migration.includes(token), `migration ${token}`));

["/api/saas", "saasRoutes"].forEach(token => assert(server.includes(token), `server ${token}`));
[
  "saasPlans",
  "saasMe",
  "saasUsage",
  "saasOnboarding",
  "saasBillingStatus",
  "saasUnlockAccount"
].forEach(token => assert(api.includes(token), `api-client ${token}`));

[
  "saasView",
  "SaaS Autônomo",
  "loadSaasDashboard",
  "simulateOnboarding",
  "Checklist de autonomia"
].forEach(token => assert(app.includes(token), `UI SaaS ${token}`));

const planService = require("../src/services/saas/saasPlanService");
const starter = planService.getPlan("starter");
const premium = planService.getPlan("premium");
assert(starter.limits.users < premium.limits.users, "limites crescentes por plano");
const usage = planService.evaluateUsage("starter", { users_count: 4, clients_count: 1, processes_count: 1, documents_count: 1, storage_bytes: 1, api_calls: 1 });
assert(usage.allowed === false && usage.checks.users === false, "bloqueia excesso de usuários");
