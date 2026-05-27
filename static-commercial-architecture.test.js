const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
assert(pkg.version === "2.5.0", "Versão 2.3.0");
assert(Boolean(pkg.dependencies.express), "Backend Express");
assert(Boolean(pkg.dependencies.pg), "PostgreSQL");
assert(Boolean(pkg.dependencies.googleapis), "Google APIs");
assert(Boolean(pkg.dependencies["cookie-parser"]), "Cookie parser");
const schema = fs.readFileSync(path.join(root, "sql/schema.sql"), "utf8");
[
  "offices","plans","subscriptions","invoices","users","clients","processes","tasks","finance_entries","documents","lgpd_records","support_tickets","backup_jobs","policies","policy_acceptances","schema_migrations","audit_logs"
].forEach(table => assert(schema.includes(`create table if not exists ${table}`), `Tabela ${table}`));
["office_id","deleted_at","deleted_by","deleted_reason","google_subject","consent_evidence_url"].forEach(column => assert(schema.includes(column), `Coluna ${column}`));
[
  "src/middleware/tenant.js","src/middleware/security.js","src/routes/admin.js","src/routes/billing.js","src/routes/support.js","src/routes/backups.js","src/routes/policies.js","src/services/backupService.js","public/api-client.js","public/app-comercial.html"
].forEach(file => assert(fs.existsSync(path.join(root, file)), `Arquivo ${file}`));
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
["/api/admin","/api/billing","/api/support","/api/backups","/api/policies","/app-comercial.html"].forEach(route => assert(server.includes(route), `Rota ${route}`));
