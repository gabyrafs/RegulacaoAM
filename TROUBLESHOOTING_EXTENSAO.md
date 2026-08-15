# 🔧 Troubleshooting - Extensão não lê dados do SISREG

## ✅ Problemas Corrigidos

| Problema | Solução |
|----------|---------|
| 🔴 URL errada no manifest | ✅ Adicionado domínio do Amazonas: `sisregiii.saude.am.gov.br` |
| 🔴 Sidepanel rejeitava URLs | ✅ Regex mais flexível para múltiplos domínios |
| 🔴 Content-script não capturava campos | ✅ Seletores CSS expandidos e melhor validação |

---

## 🚀 Como Testar Depois das Correções

### 1️⃣ **Recarregar Extensão no Chrome**
```
chrome://extensions/
├─ Ativar "Modo de desenvolvedor" (canto superior direito)
├─ Encontrar "Órbita Conector SISREG"
└─ Clicar no botão de "Recarregar" (⟲ ícone)
```

### 2️⃣ **Testar em Página do SISREG**
```
1. Abra: https://sisregiii.saude.am.gov.br/
2. Autentique com credenciais institucional
3. Navegue para uma solicitação oftalmológica
4. Clique no ícone da extensão (lado direito do endereço)
5. Clique em "Capturar campos permitidos"
```

### 3️⃣ **Verificar no Console (F12)**
Se não funcionar, abra o DevTools:
```
F12 → Console
└─ Procure por mensagens de erro (vermelho)
```

---

## 🔍 Diagnóstico Passo-a-Passo

### **Passo 1: Extensão está carregada?**
```javascript
// Cole no Console (F12) da página do SISREG:
chrome.runtime.sendMessage({tipo: "ORBITA_CAPTURAR"}, 
  response => console.log("✅ Extensão respondeu:", response)
);
```
**Esperado**: Vê `✅ Extensão respondeu` com JSON dos campos

---

### **Passo 2: Content-script está injetado?**
```javascript
// Cole no Console da página do SISREG:
if (document.querySelector("input, select, textarea")) {
  console.log("✅ Página tem campos formulário");
} else {
  console.log("❌ Nenhum campo encontrado");
}
```
**Esperado**: `✅ Página tem campos formulário`

---

### **Passo 3: Padrões estão casando?**
```javascript
// Cole no Console da página do SISREG:
const REGRAS = [
  ["codigoSolicitacao", /c[oó]d(?:igo)?\.?\s*(?:da\s*)?solicita[cç][aã]o/i],
  ["cid", /(?:^|\s)cid(?:-?10)?(?:\s|$)/i],
  // ... (copie as REGRAS do content-script.js)
];

document.querySelectorAll("input, select, textarea, label").forEach(el => {
  const label = el.textContent + (el.id || "") + (el.name || "");
  REGRAS.forEach(([chave, regex]) => {
    if (regex.test(label)) {
      console.log(`✅ Encontrado [${chave}]:`, el.value || el.textContent);
    }
  });
});
```

---

## 🆘 Soluções por Erro

### ❌ Erro: "Abra uma tela do SISREG III"
```
Causas possíveis:
1. URL incorreta (copie da barra de endereço)
2. Extensão precisa recarregar
3. Você não está no domínio .saude.am.gov.br

Solução:
  → Recarregar extensão (chrome://extensions)
  → Verificar URL na barra
  → Testar em https://sisregiii.saude.am.gov.br/
```

---

### ❌ Erro: "A tela atual não respondeu"
```
Causas possíveis:
1. Content-script não foi injetado
2. Página carregou antes da extensão
3. Frame diferente (iframe)

Soluções:
  → F12 → Abas → Console
  → Verificar se vê mensagens de erro
  → Recarregar página (Ctrl+R ou Cmd+R)
  → Recarregar extensão (chrome://extensions)
```

---

### ❌ Campos vazios ou poucos campos capturados
```
Causas possíveis:
1. Campos ainda estão carregando (JavaScript dinâmico)
2. Seletores CSS não correspondem à estrutura HTML
3. Padrões regex não casam com rótulos

Soluções:
  → Aguarde 2-3 segundos antes de capturar
  → Abra F12 → Inspecione elementos da página
  → Cole código de diagnóstico (Passo 3 acima)
```

---

## 📊 Verificação de Funcionamento

### ✅ **Funcionando Corretamente**
- ✓ Ícone da extensão ativa (colorido, não desabilitado)
- ✓ Sidepanel abre ao clicar
- ✓ Botão "Capturar" responsivo
- ✓ Mensagem: "X campos capturados"
- ✓ JSON preenchido no textarea
- ✓ Botão "Copiar" habilitado

### ❌ **Não Funcionando**
- ✗ Ícone desabilitado/cinza
- ✗ Sidepanel não abre
- ✗ Erro: "A tela atual não respondeu"
- ✗ Textarea vazio
- ✗ Botão "Copiar" desabilitado

---

## 🔄 Recarregar Tudo (Reset Completo)

Se nada funcionar:

```bash
# 1. No seu repositório:
cd /workspaces/RegulacaoAM/extensao-sisreg

# 2. Remova cache:
rm -rf ~/.cache/google-chrome/Default/Service\ Worker

# 3. Recarregar Chrome completamente:
#    - chrome://extensions/
#    - Remover "Órbita Conector SISREG"
#    - Carregar extensão novamente
#    - chrome://extensions/ → Carregar extensão → /workspaces/RegulacaoAM/extensao-sisreg
```

---

## 📞 Informações para Debug

Quando reportar erro, colete:

```javascript
// Cole no Console do sidepanel (F12):
console.log({
  navegador: navigator.userAgent,
  extensaoVersao: chrome.runtime.getManifest().version,
  urlAtual: window.location.href,
  horaCaptura: new Date().toISOString()
});
```

---

## ✨ Próximos Passos

1. **Recarregar extensão** (chrome://extensions → ⟲)
2. **Ir para SISREG III** (https://sisregiii.saude.am.gov.br/)
3. **Abrir solicitação** de oftalmologia
4. **Clicar em "Capturar campos permitidos"**
5. **Copiar JSON e testar no app** (http://localhost:3000)

---

## 📚 Documentação Relacionada

- [GUIA_INTEGRACAO_SISREGIII.md](GUIA_INTEGRACAO_SISREGIII.md) - Setup completo
- [README.md](README.md) - Começar aqui
- [ANALISE_COMPLETA_INTEGRADA.md](ANALISE_COMPLETA_INTEGRADA.md) - Arquitetura

