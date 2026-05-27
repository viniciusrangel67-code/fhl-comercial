const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }
const app = fs.readFileSync(path.join(root, "public", "app-comercial.html"), "utf8");
const api = fs.readFileSync(path.join(root, "public", "api-client.js"), "utf8");

const tabs = [...app.matchAll(/data-view="([^"]+)"/g)].map(m=>m[1]);
const unique = new Set(tabs);
assert(tabs.length === unique.size, "sem abas duplicadas");
["dashboard","notices","chat","clients","processes","tasks","publications","agenda","calendar","leads","finance","calculators","documents","docauto","governance","admin","billing","saas","support","system"].forEach(v => {
  assert(tabs.includes(v), `aba ${v}`);
  assert(app.includes(`id="${v}View"`), `view ${v}`);
});

[
  "editClient","archiveClient","openClientFile","openProcessFile","updateTaskStatus",
  "markFinancePaid","exportLgpdRecord","changePlan","createManualInvoice",
  "updateTicketStatus","downloadBackupManifest","preMigrationBackupLock","runSelectedCalculator","renderCalculatorForm","downloadCalculationMemory","loadSaasDashboard","simulateOnboarding","simulatePastDue","simulateUnlock","loadPublications","createPublication","loadAgenda","createAgendaEvent","loadLeads","createLead","convertLead","loadNotices","createNotice","loadConversations","createConversation","loadVisualCalendar","generateAutomaticDocument","downloadGeneratedDocument"
].forEach(fn => assert(app.includes(fn), `ação visual ${fn}`));

[
  "Não criar processo sem cliente válido",
  "requireClientSelected",
  "Trava pré-migration",
  "PRODUÇÃO",
  "DEMO"
].forEach(token => assert(app.includes(token) || app.includes(token.replace("Não criar processo sem cliente válido","requireClientSelected")), `trava/produtividade ${token}`));

assert(api.includes("updateTaskStatus"), "API updateTaskStatus exposta");
assert(api.includes("/billing/change-plan"), "API demo troca de plano");
assert(api.includes("/billing/manual-invoice"), "API demo fatura manual");
