const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const app = fs.readFileSync(path.join(root, "public", "app-comercial.html"), "utf8");
const api = fs.readFileSync(path.join(root, "public", "api-client.js"), "utf8");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "sql", "migration-2.0-consolidation.sql"), "utf8");

assert(pkg.version === "2.5.0", "versão 2.5.0");
[
  "noticesView","chatView","calendarView","docautoView",
  "Mural de Avisos","Chat Interno","Calendário Visual","Documentos Automáticos"
].forEach(t => assert(app.includes(t), `UI restaurada: ${t}`));

[
  "loadNotices","createNotice","loadConversations","createConversation",
  "loadVisualCalendar","renderCalendarGrid","generateAutomaticDocument","downloadGeneratedDocument"
].forEach(t => assert(app.includes(t), `função UI: ${t}`));

[
  "notices","createNotice","conversations","createConversation",
  "conversationMessages","sendConversationMessage","documentTemplates",
  "generateLegalDocument","generatedDocuments","calendarMonth"
].forEach(t => assert(api.includes(t), `api-client: ${t}`));

["/api/workspace","workspaceRoutes"].forEach(t => assert(server.includes(t), `server workspace: ${t}`));

[
  "office_notices","internal_conversations","internal_messages",
  "document_automation_templates","generated_legal_documents"
].forEach(t => assert(migration.includes(t), `migration tabela ${t}`));

[
  "procuracao","contrato_honorarios","hipossuficiencia","faa"
].forEach(t => assert(migration.includes(t), `template ${t}`));

[
  "templates/documentos/Procuração.docx",
  "templates/documentos/Contrato de Honorários.docx",
  "templates/documentos/Declaração de Hipossuficiência.docx",
  "templates/documentos/FAA.docx"
].forEach(file => assert(fs.existsSync(path.join(root, file)), `modelo copiado ${file}`));

["publicationsView","agendaView","leadsView","calculatorsView","saasView"].forEach(t => assert(app.includes(t), `preservado ${t}`));
