class FHLApiClient {
  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
    this.demoMode = localStorage.getItem("FHL_DEMO_MODE") === "true";
  }

  setDemoMode(enabled) {
    this.demoMode = Boolean(enabled);
    localStorage.setItem("FHL_DEMO_MODE", this.demoMode ? "true" : "false");
  }

  async request(path, options = {}) {
    if (this.demoMode) return this.demo(path, options);

    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options,
      body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      const message = payload?.message || payload?.error || "Erro na requisição.";
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  get(path) { return this.request(path); }
  post(path, body) { return this.request(path, { method: "POST", body }); }
  put(path, body) { return this.request(path, { method: "PUT", body }); }
  patch(path, body) { return this.request(path, { method: "PATCH", body }); }
  delete(path, body) { return this.request(path, { method: "DELETE", body }); }

  async login(email, password) { return this.post("/auth/login", { email, password }); }
  async me() { return this.get("/auth/me"); }
  async logout() { return this.post("/auth/logout", {}); }

  async clients() { return this.get("/clients"); }
  async createClient(data) { return this.post("/clients", data); }
  async updateClient(id, data) { return this.put(`/clients/${id}`, data); }
  async archiveClient(id, reason) { return this.delete(`/clients/${id}`, { reason }); }
  async restoreClient(id) { return this.patch(`/clients/${id}/restore`, {}); }

  async processes() { return this.get("/processes"); }
  async createProcess(data) { return this.post("/processes", data); }
  async tasks() { return this.get("/tasks"); }
  async createTask(data) { return this.post("/tasks", data); }
  async updateTaskStatus(id, status) { return this.patch(`/tasks/${id}/status`, { status }); }
  async finance() { return this.get("/finance"); }
  async createFinance(data) { return this.post("/finance", data); }
  async markFinancePaid(id) { return this.patch(`/finance/${id}/status`, { status:"pago", paidAt:new Date().toISOString().slice(0,10) }); }
  async documents() { return this.get("/documents"); }
  async createDocument(data) { return this.post("/documents", data); }
  async lgpd() { return this.get("/lgpd"); }
  async createLgpd(data) { return this.post("/lgpd", data); }

  async plans() { return this.get("/billing/plans"); }
  async subscription() { return this.get("/billing/subscription"); }
  async changePlan(planCode) { return this.post("/billing/change-plan", { planCode }); }
  async createInvoice(data) { return this.post("/billing/manual-invoice", data); }

  async supportTickets() { return this.get("/support"); }
  async createTicket(data) { return this.post("/support", data); }
  async updateTicketStatus(id, status) { return this.patch(`/support/${id}/status`, { status }); }

  async backups() { return this.get("/backups"); }
  async runBackup() { return this.post("/backups/run", {}); }


  async indexers() { return this.get("/indexers"); }
  async indexerSeries(code) { return this.get(`/indexers/${code}/serie`); }
  async indexerAccumulated(code, months) { return this.get(`/indexers/${code}/acumulado?months=${months}`); }
  async syncIndexers() { return this.post("/indexers/sync", {}); }
  async architectureStatus() { return this.get("/status/architecture"); }

  async saasPlans() { return this.get("/saas/plans"); }
  async saasMe() { return this.get("/saas/me"); }
  async saasUsage() { return this.get("/saas/usage"); }
  async saasOnboarding(data) { return this.post("/saas/onboarding", data); }
  async saasChecklist(patch) { return this.patch("/saas/onboarding/checklist", { patch }); }
  async saasBillingStatus(data) { return this.post("/saas/billing/status", data); }
  async saasLockAccount(data) { return this.post("/saas/account/lock", data); }
  async saasUnlockAccount() { return this.post("/saas/account/unlock", {}); }

  async publications() { return this.get("/operational/publications"); }
  async createPublication(data) { return this.post("/operational/publications", data); }
  async createTaskFromPublication(id) { return this.post(`/operational/publications/${id}/task`, {}); }
  async agendaEvents() { return this.get("/operational/agenda"); }
  async createAgendaEvent(data) { return this.post("/operational/agenda", data); }
  async updateAgendaStatus(id, status) { return this.patch(`/operational/agenda/${id}/status`, { status }); }
  async siteLeads() { return this.get("/operational/leads"); }
  async createSiteLead(data) { return this.post("/operational/leads", data); }
  async convertLead(id) { return this.post(`/operational/leads/${id}/convert`, {}); }

  async notices() { return this.get("/workspace/notices"); }
  async createNotice(data) { return this.post("/workspace/notices", data); }
  async conversations() { return this.get("/workspace/conversations"); }
  async createConversation(data) { return this.post("/workspace/conversations", data); }
  async conversationMessages(id) { return this.get(`/workspace/conversations/${id}/messages`); }
  async sendConversationMessage(id, message) { return this.post(`/workspace/conversations/${id}/messages`, { message }); }
  async documentTemplates() { return this.get("/workspace/document-templates"); }
  async generateLegalDocument(data) { return this.post("/workspace/generate-document", data); }
  async generatedDocuments() { return this.get("/workspace/generated-documents"); }
  async calendarMonth(year, month) { return this.get(`/workspace/calendar/month?year=${year}&month=${month}`); }

  async calculateMonetaryCorrection(data) { return this.post("/calculators/atualizacao-valores", data); }
  async calculateInterestCorrection(data) { return this.post("/calculators/juros-correcao", data); }
  async calculatePension(data) { return this.post("/calculators/pensao-alimenticia", data); }
  async calculateOvertime(data) { return this.post("/calculators/horas-extras", data); }
  async calculateSeverance(data) { return this.post("/calculators/verbas-rescisorias", data); }
  async calculateOverdueInstallments(data) { return this.post("/calculators/parcelas-vencidas", data); }
  async calculateJudicialDebt(data) { return this.post("/calculators/debito-judicial", data); }

  async policies() { return this.get("/policies"); }
  async acceptPolicy(id) { return this.post(`/policies/${id}/accept`, { accepted: true }); }

  async adminMetrics() { return this.get("/admin/metrics"); }
  async adminOffices() { return this.get("/admin/offices"); }
  async createOffice(data) { return this.post("/admin/offices", data); }

  demo(path, options = {}) {
    const method = options.method || "GET";
    const now = new Date().toISOString();

    const stores = {
      clients: "FHL_API_DEMO_CLIENTS",
      processes: "FHL_API_DEMO_PROCESSES",
      tasks: "FHL_API_DEMO_TASKS",
      finance: "FHL_API_DEMO_FINANCE",
      documents: "FHL_API_DEMO_DOCUMENTS",
      lgpd: "FHL_API_DEMO_LGPD",
      support: "FHL_API_DEMO_SUPPORT",
      backups: "FHL_API_DEMO_BACKUPS",
      offices: "FHL_API_DEMO_OFFICES"
    };

    const load = (key, fallback = []) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const id = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    const body = () => JSON.parse(options.body || "{}");

    if (path === "/auth/me") return Promise.resolve({ data: { id: "demo-user", name: "Administrador Demo", email: "admin@demo.com", role: "admin", officeId: "demo-office" } });
    if (path === "/auth/login") return Promise.resolve({ data: { ok: true } });
    if (path === "/auth/logout") return Promise.resolve({ data: { ok: true } });

    const map = [
      ["/clients", stores.clients, [{ id:"c1", name:"Cliente Demonstração", document:"000.000.000-00", email:"cliente@demo.com", phone:"(41) 99999-0000", created_at:now }]],
      ["/processes", stores.processes, [{ id:"p1", client_id:"c1", number:"0000000-00.2026.8.16.0129", area:"Cível", status:"ativo", risk:"baixo", created_at:now }]],
      ["/tasks", stores.tasks, [{ id:"t1", title:"Conferir documentação inicial", status:"pendente", priority:"normal", due_date:new Date().toISOString().slice(0,10) }]],
      ["/finance", stores.finance, [{ id:"f1", type:"receita", description:"Honorários iniciais", amount:1500, status:"aberto" }]],
      ["/documents", stores.documents, [{ id:"d1", client_id:"c1", category:"Procuração", name:"Procuração assinada", status:"recebido" }]],
      ["/lgpd", stores.lgpd, [{ id:"l1", client_id:"c1", legal_basis:"execução de contrato", data_category:"dados cadastrais", retention:"5 anos" }]],
      ["/support", stores.support, [{ id:"s1", subject:"Chamado demo", message:"Exemplo de chamado", status:"open", priority:"normal" }]],
      ["/backups", stores.backups, [{ id:"b1", status:"done", created_at:now, checksum:"demo" }]],
      ["/admin/offices", stores.offices, [{ id:"demo-office", name:"FHL Advocacia", slug:"fhl", active:true, plan_code:"professional" }]]
    ];

    for (const [route, store, fallback] of map) {
      if (path === route && method === "GET") return Promise.resolve({ data: load(store, fallback) });
      if (path === route && method === "POST") {
        const items = load(store, fallback);
        const record = { id: id(), ...body(), created_at: now };
        items.unshift(record); save(store, items);
        return Promise.resolve({ data: record });
      }
      if (path.startsWith(route + "/") && method === "PUT") {
        const items = load(store, fallback);
        const targetId = path.split("/").pop();
        const idx = items.findIndex(x => String(x.id) === String(targetId));
        if (idx >= 0) items[idx] = { ...items[idx], ...body(), updated_at: now };
        save(store, items);
        return Promise.resolve({ data: idx >= 0 ? items[idx] : null });
      }
      if (path.startsWith(route + "/") && method === "DELETE") {
        const items = load(store, fallback);
        const targetId = path.split("/").pop();
        const filtered = items.filter(x => String(x.id) !== String(targetId));
        save(store, filtered);
        return Promise.resolve({ data: { id: targetId, deleted_at: now } });
      }
    }

    if (/^\/tasks\/[^/]+\/status$/.test(path) && method === "PATCH") {
      const items = load(stores.tasks, []);
      const targetId = path.split("/")[2];
      const item = items.find(x => String(x.id) === String(targetId));
      if (item) { item.status = body().status; item.updated_at = now; }
      save(stores.tasks, items);
      return Promise.resolve({ data: item || null });
    }
    if (/^\/support\/[^/]+\/status$/.test(path) && method === "PATCH") {
      const items = load(stores.support, []);
      const targetId = path.split("/")[2];
      const item = items.find(x => String(x.id) === String(targetId));
      if (item) { item.status = body().status; item.updated_at = now; }
      save(stores.support, items);
      return Promise.resolve({ data: item || null });
    }

    if (path === "/billing/plans") return Promise.resolve({ data: [
      { code:"starter", name:"Inicial", monthly_price:197, max_users:3 },
      { code:"professional", name:"Profissional", monthly_price:397, max_users:8 },
      { code:"premium", name:"Premium", monthly_price:697, max_users:20 }
    ]});
    if (path === "/billing/subscription") return Promise.resolve({ data: { plan_code:localStorage.getItem("FHL_DEMO_PLAN") || "professional", status:"trial", current_period_end:new Date(Date.now()+14*86400000).toISOString().slice(0,10) }});
    if (path === "/billing/change-plan" && method === "POST") { localStorage.setItem("FHL_DEMO_PLAN", body().planCode); return Promise.resolve({ data: { plan_code: body().planCode, status:"active" }}); }
    if (path === "/billing/manual-invoice" && method === "POST") return Promise.resolve({ data: { id:id(), ...body(), status:"open", created_at:now }});
    if (path === "/admin/metrics") return Promise.resolve({ data: { offices:load(stores.offices, []).length || 1, users:5, clients:load(stores.clients, []).length, openTickets:load(stores.support, []).filter(x=>x.status!=="closed").length }});
    if (path === "/admin/offices" && method === "POST") {
      const items = load(stores.offices, []);
      const record = { id:id(), ...body(), active:true, plan_code:"starter", created_at:now };
      items.unshift(record); save(stores.offices, items);
      return Promise.resolve({ data: record });
    }
    if (path === "/backups/run") {
      const items = load(stores.backups, []);
      const record = { id:id(), status:"done", checksum:String(Date.now()), created_at:now };
      items.unshift(record); save(stores.backups, items);
      return Promise.resolve({ data: record });
    }
    if (path === "/policies") return Promise.resolve({ data: [
      { id:"pol-privacy", kind:"privacy", version:"1.0", title:"Política de Privacidade", body:"Modelo de política de privacidade." },
      { id:"pol-terms", kind:"terms", version:"1.0", title:"Termos de Uso", body:"Modelo de termos de uso." }
    ]});
    if (/^\/policies\/[^/]+\/accept$/.test(path) && method === "POST") return Promise.resolve({ data: { accepted:true, accepted_at:now }});


    const round2 = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
    const monthsBetween = (start, end) => {
      const a = new Date(`${start}T00:00:00`);
      const b = new Date(`${end}T00:00:00`);
      if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
      return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1;
    };
    const demoRates = {
      IPCA:[0.38,0.46,0.21,0.39,0.24,0.32,0.28,0.16,0.44,0.56,0.41,0.52],
      INPC:[0.42,0.55,0.19,0.37,0.29,0.31,0.26,0.20,0.48,0.53,0.39,0.49],
      IPCA_E:[0.35,0.43,0.22,0.36,0.25,0.30,0.27,0.18,0.42,0.50,0.37,0.45],
      IGP_M:[0.07,-0.06,0.29,0.31,0.89,0.81,0.61,0.29,0.47,0.64,0.34,0.74],
      SELIC:[0.86,0.80,0.83,0.89,0.83,0.79,0.91,0.87,0.84,0.93,0.89,0.96],
      TR:[0.08,0.07,0.09,0.08,0.06,0.07,0.09,0.08,0.07,0.09,0.08,0.07]
    };
    const factor = (code, months) => Array.from({length:months},(_,i)=>(demoRates[code]||demoRates.IPCA)[i%12]).reduce((f,r)=>f*(1+r/100),1);
    const correction = (amount,startDate,endDate,indexCode="IPCA") => { const m=monthsBetween(startDate,endDate); const fac=factor(indexCode,m); const total=round2(Number(amount||0)*fac); return { amount:round2(amount), startDate, endDate, indexCode, months:m, factor:Number(fac.toFixed(8)), correctionAmount:round2(total-Number(amount||0)), total }; };
    const interestCorrection = (data) => { const c=correction(data.amount,data.startDate,data.endDate,data.indexCode||"IPCA"); const ir=Number(data.interestRateMonthly||1); const interest=(data.interestMode==="compound") ? c.total*(Math.pow(1+ir/100,c.months)-1) : c.total*(ir/100)*c.months; return {...c, interestRateMonthly:ir, interestMode:data.interestMode||"simple", interestAmount:round2(interest), totalWithInterest:round2(c.total+interest)}; };
    const wrapCalc = (title, input, result) => Promise.resolve({ data: { title, input, result, memory: { title, generatedAt: now, input, result, warnings:["Cálculo auxiliar. Conferir índice, termo inicial e título judicial.","Indexadores demo devem ser substituídos por sincronização oficial em produção."] } } });
    if (path === "/indexers") return Promise.resolve({ data: Object.keys(demoRates).map(code=>({ code, name: code.replace("_","-"), source:"demo/fonte oficial em produção", frequency:"monthly" })) });
    if (/^\/indexers\/[^/]+\/serie$/.test(path)) { const code=path.split("/")[2]; return Promise.resolve({ data: (demoRates[code]||demoRates.IPCA).map((percentage,i)=>({ reference:`M${i+1}`, percentage })) }); }
    if (/^\/indexers\/[^/]+\/acumulado/.test(path)) { const code=path.split("/")[2]; const months=Number((path.match(/months=(\d+)/)||[])[1]||12); return Promise.resolve({ data:{ code, months, factor:Number(factor(code,months).toFixed(8)) }}); }
    if (path === "/indexers/sync") return Promise.resolve({ data:{ status:"prepared", message:"Sync oficial depende do backend em produção." }});
    
    
    

    if (path === "/clients" && opts.method === "POST") {
      const b = body();
      const client = { id:"client-new", name:b.name, document:b.document, phone:b.phone, email:b.email, address:b.address, created_at:now };
      const generatedDocuments = b.autoGenerateDocuments === false ? [] : [
        {id:"gd-auto-procuracao", template_code:"procuracao", title:`Procuração — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-contrato", template_code:"contrato_honorarios", title:`Contrato de Honorários — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-hipossuficiencia", template_code:"hipossuficiencia", title:`Declaração de Hipossuficiência — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-faa", template_code:"faa", title:`FAA — ${b.name}`, status:"draft", generated_at:now}
      ];
      return Promise.resolve({ data: client, generatedDocuments });
    }


    if (/^\/finance\/[^/]+\/status$/.test(path)) {
      const id = path.split("/")[2];
      const items = JSON.parse(localStorage.getItem("FHL_API_DEMO_FINANCE") || "[]");
      const item = items.find(x => String(x.id) === String(id));
      if (item) { item.status = body().status || "pago"; item.paid_at = today(); localStorage.setItem("FHL_API_DEMO_FINANCE", JSON.stringify(items)); }
      return Promise.resolve({ data: item || { id, status: body().status || "pago", paid_at: today() } });
    }

    if (path === "/workspace/notices") return Promise.resolve({ data:[
      {id:"notice1",title:"Audiências da semana",message:"Verificar pauta e documentos pendentes.",priority:"alta",pinned:true,created_at:now},
      {id:"notice2",title:"Prazo interno",message:"Todos os prazos de amanhã devem estar revisados até 17h.",priority:"urgente",pinned:false,created_at:now}
    ]});

    if (path === "/clients" && opts.method === "POST") {
      const b = body();
      const client = { id:"client-new", name:b.name, document:b.document, phone:b.phone, email:b.email, address:b.address, created_at:now };
      const generatedDocuments = b.autoGenerateDocuments === false ? [] : [
        {id:"gd-auto-procuracao", template_code:"procuracao", title:`Procuração — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-contrato", template_code:"contrato_honorarios", title:`Contrato de Honorários — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-hipossuficiencia", template_code:"hipossuficiencia", title:`Declaração de Hipossuficiência — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-faa", template_code:"faa", title:`FAA — ${b.name}`, status:"draft", generated_at:now}
      ];
      return Promise.resolve({ data: client, generatedDocuments });
    }


    if (/^\/finance\/[^/]+\/status$/.test(path)) {
      const id = path.split("/")[2];
      const items = JSON.parse(localStorage.getItem("FHL_API_DEMO_FINANCE") || "[]");
      const item = items.find(x => String(x.id) === String(id));
      if (item) { item.status = body().status || "pago"; item.paid_at = today(); localStorage.setItem("FHL_API_DEMO_FINANCE", JSON.stringify(items)); }
      return Promise.resolve({ data: item || { id, status: body().status || "pago", paid_at: today() } });
    }

    if (path === "/workspace/notices") return Promise.resolve({ data:{ id:"notice-new", ...body(), active:true, created_at:now }});
    if (path === "/workspace/conversations") return Promise.resolve({ data:[
      {id:"conv1",title:"Estratégia — processo trabalhista",conversation_type:"internal",priority:"alta",status:"open",unread_count:2,client_name:"Cliente Demonstração"},
      {id:"conv2",title:"Documentos pendentes",conversation_type:"process",priority:"normal",status:"open",unread_count:0,process_number:"0000000-00.2026.8.16.0129"}
    ]});
    if (path === "/workspace/conversations") return Promise.resolve({ data:{ id:"conv-new", ...body(), status:"open", created_at:now }});
    if (/^\/workspace\/conversations\/[^/]+\/messages$/.test(path) && opts.method === "GET") return Promise.resolve({ data:[
      {id:"m1",sender_name:"Vinicius",message:"Verifiquei os documentos e precisamos revisar a tese.",created_at:now},
      {id:"m2",sender_name:"Equipe",message:"Prazo lançado na agenda.",created_at:now}
    ]});
    if (/^\/workspace\/conversations\/[^/]+\/messages$/.test(path)) return Promise.resolve({ data:{ id:"msg-new", message:body().message, created_at:now }});
    if (path === "/workspace/document-templates") return Promise.resolve({ data:[
      {code:"procuracao",name:"Procuração",template_file:"Procuração.docx"},
      {code:"contrato_honorarios",name:"Contrato de Honorários",template_file:"Contrato de Honorários.docx"},
      {code:"hipossuficiencia",name:"Declaração de Hipossuficiência",template_file:"Declaração de Hipossuficiência.docx"},
      {code:"faa",name:"FAA - Ficha de Atendimento",template_file:"FAA.docx"}
    ]});
    if (path === "/workspace/generate-document") {
      const b=body(); const d=b.data||{}; const name=d.cliente_nome||"CLIENTE DEMO";
      const makeDoc=(code)=>({ id:`doc-auto-${code}`, template_code:code, title:`${code} — ${name}`, input_data:d, generated_text:`DOCUMENTO AUTOMÁTICO\n\nModelo: ${code}\nCliente: ${name}\nÁrea jurídica: ${d.area_juridica||""}\nProcesso: ${d.processo_numero||""}\nObjeto: ${d.objeto_contrato||""}\nModalidade: ${d.modalidade_contratacao||""}\nHonorários: ${d.valor_honorarios||""}\nEntrada: ${d.valor_entrada||""}\nParcelas: ${d.numero_parcelas||""}\nVencimento: ${d.primeiro_vencimento||""}\nGarantias: ${d.garantias_contrato||""}\n\nMinuta gerada para conferência do advogado.`, generated_at:now });
      if (b.templateCode === "todos") {
        const documents=["procuracao","contrato_honorarios","hipossuficiencia","faa"].map(makeDoc);
        return Promise.resolve({ data:{ documents, generated_text:documents.map(x=>x.generated_text).join("\n\n---\n\n") }});
      }
      return Promise.resolve({ data:makeDoc(b.templateCode) });
    }
    if (path === "/workspace/generated-documents") return Promise.resolve({ data:[
      {id:"gd1",title:"Procuração — Cliente Demonstração",template_code:"procuracao",generated_at:now,status:"draft"},
      {id:"gd2",title:"FAA — Novo atendimento",template_code:"faa",generated_at:now,status:"draft"}
    ]});
    if (path.startsWith("/workspace/calendar/month")) return Promise.resolve({ data:{ year:new Date().getFullYear(), month:new Date().getMonth()+1, events:[
      {id:"cal1",title:"Audiência de instrução",event_type:"audiencia",start_at:new Date().toISOString(),status:"scheduled"},
      {id:"cal2",title:"Prazo final — manifestação",event_type:"prazo",start_at:new Date(Date.now()+86400000*3).toISOString(),status:"scheduled"}
    ]}});

    if (path === "/operational/publications") return Promise.resolve({ data:[
      {id:"pub1",title:"Intimação para manifestação sobre documentos",source:"manual/API preparada",court:"TJPR",publication_date:today(),deadline_date:today(),deadline_type:"manifestação",status:"new",client_name:"Cliente Demonstração",process_number:"0000000-00.2026.8.16.0129"},
      {id:"pub2",title:"Publicação de despacho — audiência designada",source:"importação",court:"TRT9",publication_date:today(),deadline_date:today(),deadline_type:"ciência",status:"task_created",client_name:"Empresa Demo",process_number:"0000000-00.2026.5.09.0322"}
    ]});
    

    if (path === "/clients" && opts.method === "POST") {
      const b = body();
      const client = { id:"client-new", name:b.name, document:b.document, phone:b.phone, email:b.email, address:b.address, created_at:now };
      const generatedDocuments = b.autoGenerateDocuments === false ? [] : [
        {id:"gd-auto-procuracao", template_code:"procuracao", title:`Procuração — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-contrato", template_code:"contrato_honorarios", title:`Contrato de Honorários — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-hipossuficiencia", template_code:"hipossuficiencia", title:`Declaração de Hipossuficiência — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-faa", template_code:"faa", title:`FAA — ${b.name}`, status:"draft", generated_at:now}
      ];
      return Promise.resolve({ data: client, generatedDocuments });
    }


    if (/^\/finance\/[^/]+\/status$/.test(path)) {
      const id = path.split("/")[2];
      const items = JSON.parse(localStorage.getItem("FHL_API_DEMO_FINANCE") || "[]");
      const item = items.find(x => String(x.id) === String(id));
      if (item) { item.status = body().status || "pago"; item.paid_at = today(); localStorage.setItem("FHL_API_DEMO_FINANCE", JSON.stringify(items)); }
      return Promise.resolve({ data: item || { id, status: body().status || "pago", paid_at: today() } });
    }

    if (path === "/workspace/notices") return Promise.resolve({ data:[
      {id:"notice1",title:"Audiências da semana",message:"Verificar pauta e documentos pendentes.",priority:"alta",pinned:true,created_at:now},
      {id:"notice2",title:"Prazo interno",message:"Todos os prazos de amanhã devem estar revisados até 17h.",priority:"urgente",pinned:false,created_at:now}
    ]});

    if (path === "/clients" && opts.method === "POST") {
      const b = body();
      const client = { id:"client-new", name:b.name, document:b.document, phone:b.phone, email:b.email, address:b.address, created_at:now };
      const generatedDocuments = b.autoGenerateDocuments === false ? [] : [
        {id:"gd-auto-procuracao", template_code:"procuracao", title:`Procuração — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-contrato", template_code:"contrato_honorarios", title:`Contrato de Honorários — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-hipossuficiencia", template_code:"hipossuficiencia", title:`Declaração de Hipossuficiência — ${b.name}`, status:"draft", generated_at:now},
        {id:"gd-auto-faa", template_code:"faa", title:`FAA — ${b.name}`, status:"draft", generated_at:now}
      ];
      return Promise.resolve({ data: client, generatedDocuments });
    }


    if (/^\/finance\/[^/]+\/status$/.test(path)) {
      const id = path.split("/")[2];
      const items = JSON.parse(localStorage.getItem("FHL_API_DEMO_FINANCE") || "[]");
      const item = items.find(x => String(x.id) === String(id));
      if (item) { item.status = body().status || "pago"; item.paid_at = today(); localStorage.setItem("FHL_API_DEMO_FINANCE", JSON.stringify(items)); }
      return Promise.resolve({ data: item || { id, status: body().status || "pago", paid_at: today() } });
    }

    if (path === "/workspace/notices") return Promise.resolve({ data:{ id:"notice-new", ...body(), active:true, created_at:now }});
    if (path === "/workspace/conversations") return Promise.resolve({ data:[
      {id:"conv1",title:"Estratégia — processo trabalhista",conversation_type:"internal",priority:"alta",status:"open",unread_count:2,client_name:"Cliente Demonstração"},
      {id:"conv2",title:"Documentos pendentes",conversation_type:"process",priority:"normal",status:"open",unread_count:0,process_number:"0000000-00.2026.8.16.0129"}
    ]});
    if (path === "/workspace/conversations") return Promise.resolve({ data:{ id:"conv-new", ...body(), status:"open", created_at:now }});
    if (/^\/workspace\/conversations\/[^/]+\/messages$/.test(path) && opts.method === "GET") return Promise.resolve({ data:[
      {id:"m1",sender_name:"Vinicius",message:"Verifiquei os documentos e precisamos revisar a tese.",created_at:now},
      {id:"m2",sender_name:"Equipe",message:"Prazo lançado na agenda.",created_at:now}
    ]});
    if (/^\/workspace\/conversations\/[^/]+\/messages$/.test(path)) return Promise.resolve({ data:{ id:"msg-new", message:body().message, created_at:now }});
    if (path === "/workspace/document-templates") return Promise.resolve({ data:[
      {code:"procuracao",name:"Procuração",template_file:"Procuração.docx"},
      {code:"contrato_honorarios",name:"Contrato de Honorários",template_file:"Contrato de Honorários.docx"},
      {code:"hipossuficiencia",name:"Declaração de Hipossuficiência",template_file:"Declaração de Hipossuficiência.docx"},
      {code:"faa",name:"FAA - Ficha de Atendimento",template_file:"FAA.docx"}
    ]});
    if (path === "/workspace/generate-document") {
      const d=body().data||{}; const name=d.cliente_nome||"CLIENTE DEMO";
      return Promise.resolve({ data:{ id:"doc-auto", template_code:body().templateCode, title:body().title||"Documento automático", input_data:d, generated_text:`DOCUMENTO AUTOMÁTICO\\n\\nCliente: ${name}\\nModelo: ${body().templateCode}\\n\\nMinuta gerada para conferência do advogado.`, generated_at:now }});
    }
    if (path === "/workspace/generated-documents") return Promise.resolve({ data:[
      {id:"gd1",title:"Procuração — Cliente Demonstração",template_code:"procuracao",generated_at:now,status:"draft"},
      {id:"gd2",title:"FAA — Novo atendimento",template_code:"faa",generated_at:now,status:"draft"}
    ]});
    if (path.startsWith("/workspace/calendar/month")) return Promise.resolve({ data:{ year:new Date().getFullYear(), month:new Date().getMonth()+1, events:[
      {id:"cal1",title:"Audiência de instrução",event_type:"audiencia",start_at:new Date().toISOString(),status:"scheduled"},
      {id:"cal2",title:"Prazo final — manifestação",event_type:"prazo",start_at:new Date(Date.now()+86400000*3).toISOString(),status:"scheduled"}
    ]}});

    if (path === "/operational/publications") return Promise.resolve({ data:{ id:"pub-new", ...body(), status:"new", created_at:now }});
    if (/^\/operational\/publications\/[^/]+\/task$/.test(path)) return Promise.resolve({ data:{ id:"task-from-publication", title:"Prazo criado a partir de intimação", status:"pending", due_date:today() }});
    if (path === "/operational/agenda") return Promise.resolve({ data:[
      {id:"ag1",title:"Audiência de instrução",event_type:"audiencia",start_at:new Date().toISOString(),status:"scheduled",client_name:"Cliente Demonstração",process_number:"0000000-00.2026.8.16.0129"},
      {id:"ag2",title:"Prazo final — manifestação",event_type:"prazo",start_at:new Date(Date.now()+86400000).toISOString(),status:"scheduled",client_name:"Empresa Demo",process_number:"0000000-00.2026.5.09.0322"}
    ]});
    if (path === "/operational/agenda") return Promise.resolve({ data:{ id:"ag-new", ...body(), status:"scheduled", created_at:now }});
    if (/^\/operational\/agenda\/[^/]+\/status$/.test(path)) return Promise.resolve({ data:{ id:path.split("/")[3], status:body().status }});
    if (path === "/operational/leads") return Promise.resolve({ data:[
      {id:"lead1",name:"Maria Lead",phone:"(41) 99999-0000",email:"maria@email.com",subject:"Consulta trabalhista",source:"site",status:"new",consent_lgpd:true,created_at:now},
      {id:"lead2",name:"João WhatsApp",phone:"(41) 98888-0000",subject:"Aposentadoria",source:"whatsapp",status:"contacted",consent_lgpd:true,created_at:now}
    ]});
    if (path === "/operational/leads") return Promise.resolve({ data:{ id:"lead-new", ...body(), status:"new", created_at:now }});
    if (/^\/operational\/leads\/[^/]+\/convert$/.test(path)) return Promise.resolve({ data:{ id:"client-from-lead", name:"Cliente convertido", origin:"site_lead" }});

    if (path === "/saas/plans") return Promise.resolve({ data: [
      {code:"starter",name:"Inicial",monthlyPrice:149,limits:{users:3,clients:150,storageGb:5}},
      {code:"professional",name:"Profissional",monthlyPrice:299,limits:{users:8,clients:800,storageGb:25}},
      {code:"premium",name:"Premium",monthlyPrice:599,limits:{users:20,clients:3000,storageGb:100}}
    ]});
    if (path === "/saas/me") return Promise.resolve({ data: { office:{name:"FHL Demonstração",public_slug:"fhl-demo",plan_code:"professional",billing_status:"trial",onboarding_status:"in_progress",trial_ends_at:"em 14 dias"}, usage:{allowed:true, usage:{users_count:4,clients_count:12,processes_count:18,documents_count:24,storageGb:0.08}, plan:{code:"professional",limits:{users:8,clients:800,storageGb:25}}} }});
    if (path === "/saas/usage") return Promise.resolve({ data: { allowed:true, checks:{users:true,clients:true,processes:true,documents:true,storage:true,apiCalls:true}, usage:{users_count:4,clients_count:12,processes_count:18,documents_count:24,storageGb:0.08,api_calls:126}, plan:{code:"professional",name:"Profissional",limits:{users:8,clients:800,processes:2000,documents:10000,storageGb:25,apiCalls:25000}} }});
    if (path === "/saas/onboarding") return Promise.resolve({ data: { office:{name:body().officeName,public_slug:body().publicSlug,plan_code:body().planCode,billing_status:"trial"}, onboarding:{status:"in_progress",step:"termsAccepted",checklist:{officeCreated:true,ownerCreated:true,planSelected:true,termsAccepted:false}} }});
    if (path === "/saas/onboarding/checklist") return Promise.resolve({ data: { status:"in_progress", step:"firstClientCreated", checklist:body().patch }});
    if (path === "/saas/billing/status") return Promise.resolve({ data: { billing_status:body().status, blocked_reason:body().reason||null }});
    if (path === "/saas/account/lock") return Promise.resolve({ data: { active:true, lock_type:body().lockType||"manual", reason:body().reason }});
    if (path === "/saas/account/unlock") return Promise.resolve({ data: { billing_status:"active", blocked_at:null, blocked_reason:null }});

    if (path === "/status/architecture") return Promise.resolve({ data:{ app:"FHL Comercial", version:"1.7.0", architecture:{ responseStandard:true, requestContext:true, globalErrorHandler:true, rbac:true, tenantIsolation:true, planGuards:true, policyGuards:true, calculatorsEngine:true, indexersPrepared:true }, readiness:{ demo:"ready", assistedDeployment:"ready_for_real_environment", autonomousSaas:"code_ready_requires_external_credentials" }, externalDependencies:["PostgreSQL real","Domínio/HTTPS","Google OAuth","SMTP","Gateway","Storage backup","Indexadores oficiais"] }});
    if (path === "/calculators/atualizacao-valores") return wrapCalc("Atualização de valores", body(), correction(body().amount,body().startDate,body().endDate,body().indexCode||"IPCA"));
    if (path === "/calculators/juros-correcao") return wrapCalc("Juros e correção monetária", body(), interestCorrection(body()));
    if (path === "/calculators/pensao-alimenticia") { const b=body(); const items=[]; for(let i=0;i<Number(b.monthsCount||0);i++){ const d=new Date(`${b.firstDueDate}T00:00:00`); d.setMonth(d.getMonth()+i); const r=interestCorrection({amount:b.installmentAmount,startDate:d.toISOString().slice(0,10),endDate:b.calculationDate,indexCode:b.indexCode||"INPC",interestRateMonthly:b.interestRateMonthly||1,interestMode:b.interestMode||"simple"}); items.push({installmentIndex:i,dueDate:d.toISOString().slice(0,10),total:r.totalWithInterest,correctionAmount:r.correctionAmount,interestAmount:r.interestAmount}); } return wrapCalc("Pensão alimentícia", b, { interestMode:b.interestMode||"simple", items, total:round2(items.reduce((s,x)=>s+x.total,0)) }); }
    if (path === "/calculators/horas-extras") { const b=body(); const hourly=Number(b.salary||0)/Number(b.divisor||220); const he=Number(b.overtimeHours||0)*hourly*(1+Number(b.additionalPercent||50)/100); const night=Number(b.nightHours||0)*hourly*(Number(b.nightAdditionalPercent||20)/100); const dsr=(he+night)/Number(b.dsrWorkdays||25)*Number(b.dsrRestdays||5); return wrapCalc("Horas extras", b, { hourlyRate:round2(hourly), overtimeValue:round2(he), nightValue:round2(night), dsr:round2(dsr), total:round2(he+night+dsr) }); }
    if (path === "/calculators/verbas-rescisorias") { const b=body(); const m=monthsBetween(b.admissionDate,b.terminationDate); const sal=Number(b.salary||0); const th=(b.thirteenthMonths ?? Math.min(12,m))/12*sal; const vac=(b.vacationProportionalMonths ?? Math.min(12,m))/12*sal; const third=(Number(b.vacationDue||0)+vac)/3; const balance=sal/30*Number(b.salaryBalanceDays||0); const notice=b.terminationType==="sem_justa_causa"?sal:0; const fgts=b.terminationType==="sem_justa_causa"?Number(b.fgtsBalance||0)*0.4:0; return wrapCalc("Verbas rescisórias", b, { months:m, salaryBalance:round2(balance), thirteenth:round2(th), proportionalVacation:round2(vac), vacationThird:round2(third), priorNotice:round2(notice), fgtsFine:round2(fgts), total:round2(balance+th+Number(b.vacationDue||0)+vac+third+notice+fgts) }); }
    if (path === "/calculators/parcelas-vencidas") { const b=body(); const items=(b.dueDates||[]).map((dueDate,i)=>{const r=interestCorrection({amount:b.installmentAmount,startDate:dueDate,endDate:b.calculationDate,indexCode:b.indexCode||"INPC",interestRateMonthly:b.interestRateMonthly||1,interestMode:b.interestMode||"simple"}); return { installmentIndex:i,dueDate,total:r.totalWithInterest,correctionAmount:r.correctionAmount,interestAmount:r.interestAmount };}); return wrapCalc("Parcelas vencidas", b, { interestMode:b.interestMode||"simple", items, total:round2(items.reduce((s,x)=>s+x.total,0)) }); }
    if (path === "/calculators/debito-judicial") { const b=body(); const r=interestCorrection({amount:b.principal,startDate:b.startDate,endDate:b.endDate,indexCode:b.indexCode||"IPCA_E",interestRateMonthly:b.interestRateMonthly||1,interestMode:b.interestMode||"simple"}); const subtotal=r.totalWithInterest+Number(b.costs||0); const fees=subtotal*Number(b.feesPercent||10)/100; return wrapCalc("Atualização de débito judicial", b, { ...r, costs:round2(b.costs), fees:round2(fees), total:round2(subtotal+fees) }); }

    return Promise.resolve({ data: null });
  }
}

window.FHLApiClient = FHLApiClient;
window.fhlApi = new FHLApiClient();
