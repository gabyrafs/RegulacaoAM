const $ = (id) => document.getElementById(id);
const estado = $("estado");
const saida = $("saida");
const copiar = $("copiar");

$("capturar").addEventListener("click", async () => {
  estado.textContent = "Lendo a solicitação completa da aba ativa...";
  saida.value = "";
  copiar.disabled = true;
  try {
    const [aba] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!aba?.id) throw new Error("Nenhuma aba ativa.");
    const urlValida = /https:\/\/[^/]*sisregiii\.saude\.(gov\.br|am\.gov\.br)/.test(aba.url || "");
    if (!urlValida) {
      throw new Error(`Abra o SISREG III. URL atual: ${aba.url || "desconhecida"}`);
    }
    const respostas = await chrome.tabs.sendMessage(aba.id, {
      tipo: "ORBITA_CAPTURAR",
      incluirNarrativa: $("narrativa").checked,
    });

    const lista = Array.isArray(respostas) ? respostas : [respostas];
    const resposta = lista
      .filter((r) => r?.ok && r?.pacote)
      .sort((a, b) => {
        const qa = Object.keys(a.pacote.campos || {}).length;
        const qb = Object.keys(b.pacote.campos || {}).length;
        return qb - qa;
      })[0];

    if (!resposta?.ok) throw new Error("A tela atual não respondeu ao conector.");
    if (!resposta.pacote || Object.keys(resposta.pacote.campos || {}).length === 0) {
      throw new Error("Página inválida para leitura. Abra a tela da solicitação do SISREG e tente novamente.");
    }
    saida.value = JSON.stringify(resposta.pacote, null, 2);
    copiar.disabled = false;
    estado.textContent = `${Object.keys(resposta.pacote.campos || {}).length} campos capturados para revisão.`;
  } catch (e) {
    estado.textContent = e?.message || "Falha na captura.";
  }
});

copiar.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(saida.value);
    estado.textContent = "Pacote copiado. Cole em Integração SISREG no Órbita.";
  } catch {
    saida.select();
    document.execCommand("copy");
    estado.textContent = "Pacote copiado pelo modo de compatibilidade.";
  }
});
