const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }

const app = fs.readFileSync(path.join(root, "public", "app-comercial.html"), "utf8");
const api = fs.readFileSync(path.join(root, "public", "api-client.js"), "utf8");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const schema = fs.readFileSync(path.join(root, "sql", "migration-1.5-calculators.sql"), "utf8");

["calculatorsView","Central de Calculadoras Jurídicas","Atualização de valores","Juros e correção monetária","Pensão alimentícia","Horas extras","Verbas rescisórias","Parcelas vencidas","Atualização de débito judicial"].forEach(t => assert(app.includes(t), `UI calculadora: ${t}`));
["calculateMonetaryCorrection","calculateInterestCorrection","calculatePension","calculateOvertime","calculateSeverance","calculateOverdueInstallments","calculateJudicialDebt","indexers","syncIndexers"].forEach(t => assert(api.includes(t), `api-client: ${t}`));
["/api/calculators","/api/indexers"].forEach(t => assert(server.includes(t), `server rota ${t}`));
["legal_indexes","legal_index_values","legal_index_sync_logs","legal_calculations","legal_calculation_memory"].forEach(t => assert(schema.includes(t), `schema ${t}`));
["src/routes/calculators.js","src/routes/indexers.js","src/services/calculators/calculatorEngine.js"].forEach(file => assert(fs.existsSync(path.join(root,file)), `arquivo ${file}`));
