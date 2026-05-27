const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
function read(rel){ return fs.readFileSync(path.join(root, rel), "utf8"); }
function assert(condition, message){
  if(!condition){ console.error("FALHA:", message); process.exitCode = 1; }
  else console.log("OK:", message);
}

const pkg = JSON.parse(read("package.json"));
const app = read("public/app-comercial.html");
const api = read("public/api-client.js");
const server = read("server.js");

assert(pkg.version === "2.5.0", "versão 2.5.0");

const expectedTabs = [
  "dashboard","notices","chat","clients","processes","tasks","publications","agenda","calendar","leads",
  "finance","calculators","documents","docauto","governance","admin","billing","saas","support","system"
];
for (const tab of expectedTabs) {
  assert(app.includes(`data-view="${tab}"`), `aba ${tab}`);
  assert(app.includes(`id="${tab}View"`), `view ${tab}`);
}

const ids = [...app.matchAll(/id="([^"]+)"/g)].map(m => m[1]).filter(id => !(id.startsWith("${") && id.endsWith("}")));
const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
assert(dupes.length === 0, `sem IDs duplicados reais (${[...new Set(dupes)].join(", ")})`);

const onclicks = [...app.matchAll(/onclick="([A-Za-z_$][\w$]*)\(/g)].map(m => m[1]);
const functions = new Set([...app.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]));
for (const fn of onclicks) assert(functions.has(fn), `função onclick existente: ${fn}`);

const apiMethods = new Set([...api.matchAll(/async\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]));
[
  "clients","createClient","updateClient","archiveClient","restoreClient",
  "processes","createProcess","tasks","createTask","updateTaskStatus",
  "finance","createFinance","markFinancePaid",
  "calculateMonetaryCorrection","calculateInterestCorrection","calculatePension","calculateOvertime","calculateSeverance","calculateOverdueInstallments","calculateJudicialDebt",
  "publications","createPublication","createTaskFromPublication",
  "agendaEvents","createAgendaEvent","calendarMonth",
  "siteLeads","createSiteLead","convertLead",
  "notices","createNotice","conversations","createConversation","conversationMessages","sendConversationMessage",
  "generateLegalDocument","generatedDocuments",
  "saasPlans","saasOnboarding","saasMe","saasUsage","saasBillingStatus","saasLockAccount","saasUnlockAccount"
].forEach(m => assert(apiMethods.has(m), `método API ${m}`));

[
  "/api/auth","/api/clients","/api/processes","/api/tasks","/api/finance","/api/documents","/api/audit","/api/lgpd",
  "/api/admin","/api/billing","/api/support","/api/backups","/api/policies","/api/calculators","/api/indexers",
  "/api/status","/api/saas","/api/operational","/api/workspace"
].forEach(route => assert(server.includes(route), `rota montada ${route}`));

[
  "helmet","rateLimit","cors","cookieParser","express.json"
].forEach(token => assert(server.includes(token) || fs.readFileSync(path.join(root, "src/middleware/security.js"), "utf8").includes(token), `segurança/middleware ${token}`));

[
  "authRequired","tenantRequired","auditLog","deleted_at","office_id"
].forEach(token => {
  const haystack = server + app + Object.values(Object.fromEntries(fs.readdirSync(path.join(root, "src/routes")).map(f => [f, fs.readFileSync(path.join(root, "src/routes", f), "utf8")]))).join("\n");
  assert(haystack.includes(token), `arquitetura preserva ${token}`);
});

const docService = read("src/services/documentAutomationService.js");
["OBJETO DO CONTRATO","MODALIDADE DE CONTRATAÇÃO","GARANTIAS DO CONTRATO","PARCELAMENTO","PRIMEIRO VENCIMENTO"].forEach(t => assert(docService.includes(t), `documento avançado ${t}`));

const calculatorEngine = read("src/services/calculators/calculatorEngine.js");
["interestMode","compound","simple","judicialDebtUpdate","overdueInstallments","pension","overtime","severance"].forEach(t => assert(calculatorEngine.includes(t), `calculadora preservada ${t}`));

assert(!/client_secret|refresh_token|password\s*=\s*["'][^"']+["']|api[_-]?key\s*=\s*["'][^"']+["']/i.test(app + api), "sem segredos óbvios no frontend");
assert(app.includes("FHL") && app.includes("Fonseca") && app.includes("Hespanha") && app.includes("Lisboa"), "identidade visual/institucional preservada");
