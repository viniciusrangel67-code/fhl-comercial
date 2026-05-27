const { query } = require("../db");

const DEFAULT_TEMPLATES = ["procuracao", "contrato_honorarios", "hipossuficiencia", "faa"];

function renderGeneratedText(templateCode, data = {}) {
  const name = data.cliente_nome || data.name || "CLIENTE";
  const doc = data.cliente_cpf_cnpj || data.cliente_cpf || "[CPF/CNPJ]";
  const processo = data.processo_numero || "[processo/referência não informado]";
  const area = data.area_juridica || data.area || "[área jurídica]";
  const objeto = data.objeto_contrato || data.servico || "Prestação de serviços advocatícios";
  const modalidade = data.modalidade_contratacao || "por processo";
  const garantias = data.garantias_contrato || "sem garantia adicional expressa, salvo ajuste escrito entre as partes";
  const honorarios = data.valor_honorarios || "[valor dos honorários]";
  const entrada = data.valor_entrada || "[entrada]";
  const parcelas = data.numero_parcelas || "1";
  const vencimento = data.primeiro_vencimento || "[primeiro vencimento]";
  const foro = data.foro || "Paranaguá/PR";

  if (templateCode === "procuracao") {
    return `PROCURAÇÃO

OUTORGANTE: ${name}, CPF/CNPJ ${doc}, residente/sediado em ${data.cliente_endereco || "[ENDEREÇO]"}.
OUTORGADO: ${data.outorgado_nome || "advogado(a) responsável"}.
ÁREA JURÍDICA: ${area}.
PROCESSO/REFERÊNCIA: ${processo}.
PODERES: ${data.poderes || "ad judicia et extra, com poderes especiais para transigir, receber e dar quitação"}.
FORO/LOCAL: ${foro}.

Minuta gerada automaticamente para conferência.`;
  }

  if (templateCode === "contrato_honorarios") {
    return `CONTRATO DE HONORÁRIOS ADVOCATÍCIOS

CONTRATANTE: ${name}, CPF/CNPJ ${doc}.
ÁREA JURÍDICA: ${area}.
PROCESSO/REFERÊNCIA: ${processo}.
OBJETO DO CONTRATO: ${objeto}.
MODALIDADE DE CONTRATAÇÃO: ${modalidade}.

HONORÁRIOS CONTRATUAIS: ${honorarios}.
ENTRADA: ${entrada}.
PARCELAMENTO: ${parcelas} parcela(s).
PRIMEIRO VENCIMENTO: ${vencimento}.
FORMA DE PAGAMENTO: ${data.forma_pagamento || "[forma de pagamento]"}.

GARANTIAS DO CONTRATO: ${garantias}.

CLÁUSULAS OPERACIONAIS: os honorários remuneram a atuação técnica descrita no objeto contratual, sem abranger custas, emolumentos, diligências extraordinárias, preparo recursal ou despesas de terceiros, salvo estipulação expressa em contrário.

FORO: ${foro}.

Minuta gerada automaticamente para revisão do advogado antes de assinatura.`;
  }

  if (templateCode === "hipossuficiencia") {
    return `DECLARAÇÃO DE HIPOSSUFICIÊNCIA

${name}, CPF/CNPJ ${doc}, declara, para os fins legais, não possuir condições de arcar com custas e despesas processuais sem prejuízo do próprio sustento.
ÁREA/PROCESSO: ${area} — ${processo}.
RENDA INFORMADA: ${data.renda || "[renda]"}.
PROFISSÃO: ${data.profissao || "[profissão]"}.
ESTADO CIVIL: ${data.estado_civil || "[estado civil]"}.

Minuta gerada automaticamente para conferência e assinatura.`;
  }

  return `FICHA DE ATENDIMENTO ADVOCATÍCIO — FAA

CLIENTE: ${name}
CPF/CNPJ: ${doc}
TELEFONE: ${data.telefone || "[telefone]"}
E-MAIL: ${data.email || "[email]"}
ÁREA JURÍDICA: ${area}
PROCESSO/REFERÊNCIA: ${processo}
OBJETO/DEMANDA: ${objeto}
MODALIDADE DE CONTRATAÇÃO: ${modalidade}
HONORÁRIOS SUGERIDOS: ${honorarios}
RELATO: ${data.relato || "[relato inicial]"}
DOCUMENTOS ENTREGUES: ${data.documentos_entregues || "[documentos]"}

Ficha gerada automaticamente para conferência do atendimento.`;
}

function buildClientDocumentData(client = {}, extra = {}) {
  return {
    cliente_nome: client.name || extra.name || "",
    cliente_cpf: client.document || client.cpf || client.cpf_cnpj || extra.cpf || extra.cpf_cnpj || "",
    cliente_cpf_cnpj: client.document || client.cpf_cnpj || client.cpf || extra.cpf_cnpj || extra.cpf || "",
    cliente_endereco: client.address || extra.address || "",
    telefone: client.phone || extra.phone || "",
    email: client.email || extra.email || "",
    foro: extra.foro || "Paranaguá/PR",
    processo_numero: extra.processo_numero || extra.process_number || "",
    area_juridica: extra.area_juridica || extra.area || client.practice_area || "",
    objeto_contrato: extra.objeto_contrato || extra.objeto || extra.servico || "Prestação de serviços advocatícios",
    modalidade_contratacao: extra.modalidade_contratacao || extra.modalidade || "por processo",
    garantias_contrato: extra.garantias_contrato || extra.garantias || "",
    valor_honorarios: extra.valor_honorarios || extra.totalAmount || "[definir]",
    valor_entrada: extra.valor_entrada || extra.entryAmount || "[definir]",
    numero_parcelas: extra.numero_parcelas || extra.installments || "1",
    primeiro_vencimento: extra.primeiro_vencimento || extra.firstDueDate || "",
    forma_pagamento: extra.forma_pagamento || extra.paymentMethod || "",
    outorgado_nome: extra.outorgado_nome || "advogado(a) responsável",
    poderes: extra.poderes || "ad judicia et extra",
    renda: extra.renda || "[informar]",
    estado_civil: extra.estado_civil || "",
    profissao: extra.profissao || "",
    area: extra.area || extra.area_juridica || client.practice_area || "[área]",
    relato: extra.relato || client.notes || "[relato inicial]",
    documentos_entregues: extra.documentos_entregues || "[documentos pendentes]"
  };
}

async function generateLegalDocument({ officeId, userId, clientId = null, processId = null, templateCode, title, data, documentGroupId = null }) {
  const generatedText = renderGeneratedText(templateCode, data || {});
  const previewSummary = `${templateCode} — ${data?.cliente_nome || data?.name || "cliente"} — ${data?.area_juridica || data?.area || ""}`;
  const financialTerms = {
    valor_honorarios: data?.valor_honorarios || null,
    valor_entrada: data?.valor_entrada || null,
    numero_parcelas: data?.numero_parcelas || null,
    primeiro_vencimento: data?.primeiro_vencimento || null,
    modalidade_contratacao: data?.modalidade_contratacao || null,
    garantias_contrato: data?.garantias_contrato || null
  };
  const legalContext = {
    processo_numero: data?.processo_numero || null,
    area_juridica: data?.area_juridica || data?.area || null,
    objeto_contrato: data?.objeto_contrato || null
  };
  const result = await query(
    `insert into generated_legal_documents (office_id, client_id, process_id, template_code, title, input_data, generated_text, generated_by, document_group_id, preview_summary, financial_terms, legal_context)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *`,
    [officeId, clientId, processId, templateCode, title || `Documento automático - ${templateCode}`, data || {}, generatedText, userId || null, documentGroupId, previewSummary, financialTerms, legalContext]
  );
  return result.rows[0];
}

async function generateDefaultClientDocuments({ officeId, userId, client, templates = DEFAULT_TEMPLATES, data = {} }) {
  const input = buildClientDocumentData(client, data);
  const docs = [];
  for (const templateCode of templates) {
    const titleMap = {
      procuracao: `Procuração — ${input.cliente_nome}`,
      contrato_honorarios: `Contrato de Honorários — ${input.cliente_nome}`,
      hipossuficiencia: `Declaração de Hipossuficiência — ${input.cliente_nome}`,
      faa: `FAA — ${input.cliente_nome}`
    };
    docs.push(await generateLegalDocument({
      officeId,
      userId,
      clientId: client.id,
      templateCode,
      title: titleMap[templateCode] || `Documento automático — ${input.cliente_nome}`,
      data: input,
      documentGroupId: data.document_group_id || null
    }));
  }
  return docs;
}

module.exports = { DEFAULT_TEMPLATES, renderGeneratedText, buildClientDocumentData, generateLegalDocument, generateDefaultClientDocuments };
