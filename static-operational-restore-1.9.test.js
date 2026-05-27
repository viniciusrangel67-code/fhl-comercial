const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const app = fs.readFileSync(path.join(root, "public", "app-comercial.html"), "utf8");
const api = fs.readFileSync(path.join(root, "public", "api-client.js"), "utf8");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "sql", "migration-1.9-operational-restore.sql"), "utf8");

assert(pkg.version === "2.5.0", "versão 2.5.0");
["publicationsView","agendaView","leadsView","Publicações e Intimações","Agenda e Prazos","Contatos e Leads"].forEach(t => assert(app.includes(t), `UI restaurada: ${t}`));
["loadPublications","createPublication","createTaskFromPublication","loadAgenda","createAgendaEvent","loadLeads","createLead","convertLead"].forEach(t => assert(app.includes(t), `função UI: ${t}`));
["publications","createPublication","agendaEvents","createAgendaEvent","siteLeads","createSiteLead","convertLead"].forEach(t => assert(api.includes(t), `api-client: ${t}`));
["/api/operational","operationalRoutes"].forEach(t => assert(server.includes(t), `server operacional: ${t}`));
["publications_intimations","agenda_events","site_leads"].forEach(t => assert(migration.includes(t), `migration tabela ${t}`));
["client_id","process_id","created_task_id","google_event_id","converted_client_id","consent_lgpd"].forEach(t => assert(migration.includes(t), `migration campo ${t}`));
