const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }
const api = fs.readFileSync(path.join(root, "public", "api-client.js"), "utf8");
const app = fs.readFileSync(path.join(root, "public", "app-comercial.html"), "utf8");

[
  "clients","createClient","updateClient","archiveClient","restoreClient",
  "processes","createProcess","tasks","createTask","updateTaskStatus",
  "finance","createFinance","documents","createDocument","lgpd","createLgpd",
  "plans","subscription","changePlan","createInvoice","supportTickets","createTicket",
  "updateTicketStatus","backups","runBackup","adminMetrics","adminOffices","policies","acceptPolicy"
].forEach(token => assert(api.includes(token), `api-client possui ${token}`));

[
  "dashboardView","clientsView","processesView","tasksView","financeView","documentsView",
  "governanceView","adminView","billingView","supportView","systemView",
  "saveClient","editClient","archiveClient","saveProcess","saveTask","updateTaskStatus",
  "markFinancePaid","saveDocument","saveLgpd","changePlan","createManualInvoice",
  "updateTicketStatus","preMigrationBackupLock","runSmokeTest","Modo demonstração local"
].forEach(token => assert(app.includes(token), `app comercial possui ${token}`));

["lgpdView","policiesView","backupsView"].forEach(token => assert(!app.includes(`id="${token}"`), `aba antiga removida/reorganizada: ${token}`));
["Governança/LGPD","Sistema/Backups","Cobrança SaaS","Dashboard Executivo"].forEach(token => assert(app.includes(token), `módulo reorganizado ${token}`));
assert(!/client_secret|refresh_token|google_oauth_client_secret|billing_webhook_secret/i.test(app + api), "sem segredos no frontend");
