const VERSAO_ADAPTADOR = "sisreg-3.4-observacional-0.1";

const REGRAS = [
  ["codigoSolicitacao", /c[oó]d(?:igo)?\.?\s*(?:da\s*)?solicita[cç][aã]o/i],
  ["cnesSolicitante", /cnes\s*solicitante/i],
  ["cnesExecutante", /cnes\s*executante/i],
  ["codigoUnificado", /c[oó]digo\s*unificado/i],
  ["codigoInterno", /c[oó]digo\s*interno/i],
  ["descricaoProcedimento", /descri[cç][aã]o(?:\s*do)?\s*procedimento/i],
  ["cid", /(?:^|\s)cid(?:-?10)?(?:\s|$)/i],
  ["classificacaoRisco", /classifica[cç][aã]o\s*(?:de)?\s*risco/i],
  ["situacao", /situa[cç][aã]o|status\s*(?:da)?\s*solicita[cç][aã]o/i],
  ["dataSolicitacao", /data\s*(?:da)?\s*solicita[cç][aã]o/i],
  ["avSemOD", /a(?:cuidade)?\.?\s*v(?:isual)?\.?.*od.*sem\s*corre[cç][aã]o/i],
  ["avSemOE", /a(?:cuidade)?\.?\s*v(?:isual)?\.?.*oe.*sem\s*corre[cç][aã]o/i],
  ["avComOD", /a(?:cuidade)?\.?\s*v(?:isual)?\.?.*od.*com\s*corre[cç][aã]o/i],
  ["avComOE", /a(?:cuidade)?\.?\s*v(?:isual)?\.?.*oe.*com\s*corre[cç][aã]o/i],
  ["pioOD", /p(?:ress[aã]o)?\s*i(?:ntra)?o(?:cular)?.*od/i],
  ["pioOE", /p(?:ress[aã]o)?\s*i(?:ntra)?o(?:cular)?.*oe/i],
  ["justificativaClinica", /justificativa|hist[oó]ria\s*cl[ií]nica|hda|motivo\s*cl[ií]nico/i],
  ["nomePaciente", /nome\s*do\s*paciente|nome\s*paciente|paciente/i],
  ["municipio", /munic[ií]pio|municipio/i],
  ["origemSolicitacao", /origem\s*(?:da\s*)?solicita[cç][aã]o|origem/i],
  ["medicoSolicitante", /m[eé]dico\s*solicitante|profissional\s*solicitante/i],
  ["procedimento", /procedimento\s*(?:solicitado|principal)|tipo\s*de\s*procedimento/i],
  ["status", /status\s*(?:da\s*)?solicita[cç][aã]o|status\s*(?:do\s*)?caso/i],
];

const BLOQUEADOS = /paciente|usu[aá]rio|cns|cpf|telefone|m[aã]e|nascimento|endere[cç]o|senha|operador/i;

function texto(el) {
  if (!el) return "";
  if ("value" in el) return String(el.value || "").trim();
  return String(el.textContent || "").trim();
}

function rotuloDoCampo(el) {
  const partes = [];
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label) partes.push(texto(label));
  }
  const ancestral = el.closest("label, td, th, .form-group, .campo, .linha");
  if (ancestral) partes.push(texto(ancestral).slice(0, 240));
  partes.push(el.getAttribute("name") || "", el.id || "", el.getAttribute("aria-label") || "");
  return partes.filter(Boolean).join(" | ");
}

function listarDocumentosAlvos() {
  const docs = new Set();

  function visitar(doc) {
    if (!doc || docs.has(doc)) return;
    docs.add(doc);
    try {
      const iframes = Array.from(doc.querySelectorAll('iframe, frame'));
      for (const iframe of iframes) {
        const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (frameDoc) visitar(frameDoc);
      }
    } catch (_) {
      // Ignorar iframes cross-origin ou inacessíveis
    }
  }

  visitar(document);
  return Array.from(docs);
}

function paginaEhValidaParaLeitura() {
  const pathname = (location.pathname || '').toLowerCase();
  const rotulosDeShell = /barra-brasil|login|auth|entrar|home|index\.|inicio|avisos/i;
  const temFramePrincipal = document.querySelector('iframe#f_main, frame[name="f_principal"], iframe[name="f_principal"]') !== null;
  return !(rotulosDeShell.test(pathname) || pathname === '/' || pathname === '') || temFramePrincipal;
}

function capturar(incluirNarrativa) {
  const docs = listarDocumentosAlvos();
  const campos = {};
  const bloqueadosDetectados = [];
  let totalElementos = 0;

  for (const doc of docs) {
    const elementos = doc.querySelectorAll(
      "input, select, textarea, [data-value], .campo, .form-control, [role='textbox'], span[data-field], td, th, label, div, p"
    );
    totalElementos += elementos.length;

    for (const el of elementos) {
      const rotulo = rotuloDoCampo(el);
      const valor = texto(el);
      if (!rotulo || !valor || valor.length < 1) continue;
      if (BLOQUEADOS.test(rotulo)) {
        bloqueadosDetectados.push(rotulo.slice(0, 80));
        continue;
      }

      const rotuloNormalizado = rotulo.toLowerCase();
      const valorNormalizado = valor.toLowerCase();

      for (const [chave, regra] of REGRAS) {
        if (chave === "justificativaClinica" && !incluirNarrativa) continue;
        if (chave === "nomePaciente" && /paciente/i.test(valorNormalizado) && !/nome\s*paciente/i.test(rotuloNormalizado)) continue;
        if (regra.test(rotuloNormalizado) && !campos[chave]) {
          campos[chave] = valor.slice(0, 500);
        }
      }

      if (valor && !campos.codigoSolicitacao && /\b\d{5,}\b/.test(valor) && /solicita/i.test(rotuloNormalizado)) {
        campos.codigoSolicitacao = valor.slice(0, 500);
      }
    }
  }

  if (!paginaEhValidaParaLeitura() && Object.keys(campos).length === 0) {
    return {
      origem: "sisreg-extension",
      versao: "0.1.0",
      adaptador: VERSAO_ADAPTADOR,
      capturadoEm: new Date().toISOString(),
      pagina: location.pathname,
      campos: {},
      metadados: {
        somenteLeitura: true,
        narrativaIncluida: Boolean(incluirNarrativa),
        quantidadeBloqueados: 0,
        urlOrigem: location.origin,
        totalElementosTratados: totalElementos,
        paginaValida: false,
        motivo: "Página do SISREG não é a tela da solicitação/registro clínico. Abra a solicitação real."
      }
    };
  }

  const camposSemVazios = Object.fromEntries(Object.entries(campos).filter(([, value]) => String(value).trim()));

  return {
    origem: "sisreg-extension",
    versao: "0.1.0",
    adaptador: VERSAO_ADAPTADOR,
    capturadoEm: new Date().toISOString(),
    pagina: location.pathname,
    campos: camposSemVazios,
    metadados: {
      somenteLeitura: true,
      narrativaIncluida: Boolean(incluirNarrativa),
      quantidadeBloqueados: bloqueadosDetectados.length,
      urlOrigem: location.origin,
      totalElementosTratados: totalElementos,
      paginaValida: true,
      motivo: Object.keys(camposSemVazios).length ? 'campos_localizados' : 'sem_campos_na_pagina'
    }
  };
}

chrome.runtime.onMessage.addListener((mensagem, _sender, responder) => {
  if (mensagem?.tipo !== "ORBITA_CAPTURAR") return;
  responder({ ok: true, pacote: capturar(Boolean(mensagem.incluirNarrativa)) });
});
