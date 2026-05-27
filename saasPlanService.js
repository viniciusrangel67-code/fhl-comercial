const PLAN_CATALOG = {
  starter: {
    code: "starter",
    name: "Inicial",
    monthlyPrice: 149,
    limits: { users: 3, clients: 150, processes: 300, documents: 1000, storageGb: 5, apiCalls: 5000 },
    features: ["clientes", "processos", "tarefas", "financeiro_basico", "calculadoras_basicas"]
  },
  professional: {
    code: "professional",
    name: "Profissional",
    monthlyPrice: 299,
    limits: { users: 8, clients: 800, processes: 2000, documents: 10000, storageGb: 25, apiCalls: 25000 },
    features: ["clientes", "processos", "tarefas", "financeiro", "documentos", "calculadoras", "lgpd", "suporte"]
  },
  premium: {
    code: "premium",
    name: "Premium",
    monthlyPrice: 599,
    limits: { users: 20, clients: 3000, processes: 10000, documents: 50000, storageGb: 100, apiCalls: 100000 },
    features: ["clientes", "processos", "tarefas", "financeiro", "documentos", "calculadoras", "lgpd", "suporte_prioritario", "backups_avancados", "api"]
  }
};

function getPlan(code = "starter") {
  return PLAN_CATALOG[code] || PLAN_CATALOG.starter;
}

function canUseFeature(planCode, feature) {
  return getPlan(planCode).features.includes(feature);
}

function evaluateUsage(planCode, usage = {}) {
  const plan = getPlan(planCode);
  const storageGb = Number(usage.storage_bytes || usage.storageBytes || 0) / 1024 / 1024 / 1024;
  const checks = {
    users: Number(usage.users_count || usage.users || 0) <= plan.limits.users,
    clients: Number(usage.clients_count || usage.clients || 0) <= plan.limits.clients,
    processes: Number(usage.processes_count || usage.processes || 0) <= plan.limits.processes,
    documents: Number(usage.documents_count || usage.documents || 0) <= plan.limits.documents,
    storage: storageGb <= plan.limits.storageGb,
    apiCalls: Number(usage.api_calls || usage.apiCalls || 0) <= plan.limits.apiCalls
  };
  return {
    plan,
    checks,
    allowed: Object.values(checks).every(Boolean),
    usage: { ...usage, storageGb: Number(storageGb.toFixed(3)) }
  };
}

module.exports = { PLAN_CATALOG, getPlan, canUseFeature, evaluateUsage };
