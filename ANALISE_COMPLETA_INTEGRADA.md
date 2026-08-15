# Órbita Regulação — Análise Integrada (Aplicação + Extensão)

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SISREG III (Amazonas)                     │
│                https://sisregiii.saude.gov.br               │
└────────────────┬──────────────────────────────┬─────────────┘
                 │                              │
                 │ (Content Script)            │
                 │                              │
        ┌────────▼──────────┐         ┌────────▼────────────┐
        │  Extensão Chrome  │         │   Órbita Regulação  │
        │ (Conector SISREG) │         │   (App React+Vite)  │
        │  v0.1.0 - MVP     │         │   em iframe/aba     │
        └────────┬──────────┘         └────────┬────────────┘
                 │                              │
                 └──────────────┬───────────────┘
                                │
                        postMessage (IPC)
                                │
                    ┌───────────▼───────────┐
                    │  Regulador (Usuário)  │
                    │  revisando campos do  │
                    │  SISREG no Órbita     │
                    └───────────────────────┘
```

---

## 🔍 Componentes do Sistema

### 1. Extensão Chrome — Órbita Conector SISREG
**Localização**: `extensao-sisreg/`  
**Propósito**: Extração controlada de dados do SISREG III

#### Arquivos
- `manifest.json` → Configuração Manifest V3
- `service-worker.js` → Service worker (3 linhas)
- `content-script.js` → Extração de campos (81 linhas)
- `sidepanel.html/js` → UI do painel lateral
- `styles.css` → Estilos

#### Fluxo de Operação
1. **Ativação**: Usuário clica no ícone da extensão
2. **Detecção**: Content script valida se está em `https://sisregiii.saude.gov.br/*`
3. **Captura**: Busca campos com regex (veja `REGRAS[]`)
4. **Filtragem**: Remove campos bloqueados (CPF, nome, telefone, etc.)
5. **Exportação**: Pacote JSON com metadata
6. **Cópia**: Usuário copia JSON para usar no Órbita

#### Restrições de Segurança ✅
- ✓ Somente leitura de campos
- ✓ Bloqueia: CNS, CPF, telefone, filiação, nascimento, endereço
- ✓ Narrativa clínica desabilitada por padrão
- ✓ Sem captura de credenciais
- ✓ Sem autorizar/devolver/negar/cancelar/agendar

#### Versão Adaptador
```javascript
VERSAO_ADAPTADOR = "sisreg-3.4-observacional-0.1"
// Compatível com SISREG versão 3.4 (observado em ago/2026)
```

#### Campos Capturados (REGRAS)
```
codigoSolicitacao, cnesSolicitante, cnesExecutante, codigoUnificado,
codigoInterno, descricaoProcedimento, cid, classificacaoRisco,
situacao, dataSolicitacao, avSemOD, avSemOE, avComOD, avComOE,
pioOD, pioOE, justificativaClinica (opcional)
```

#### Permissões Solicitadas
```json
{
  "permissions": ["activeTab", "sidePanel", "scripting"],
  "host_permissions": ["https://sisregiii.saude.gov.br/*"]
}
```

---

### 2. Aplicação React — Órbita Regulação
**Localização**: `/`  
**Propósito**: Interface de análise e apoio à regulação oftalmológica

#### Arquivos
- `index.html` → Template Vite (346 linhas)
- `assets/index-CfhdQq5-.css` → Estilos compilados (72 KB)
- `assets/index-Dcrh6tH4.js` → React minificado (420 KB)
- `favicon.svg` → Logo

#### Build Info
- **Framework**: React
- **Bundler**: Vite
- **Status**: Produção (minificado/otimizado)
- **Tamanho Total**: ~500 KB comprimido

#### Função no Fluxo
1. **Recebe JSON** da extensão (usuário cola)
2. **Processa campos** (validação, formatação)
3. **Oferece interface** para análise regulatória
4. **Emite decisão** (autorização, devolução, negativa, etc.)

---

## 🔗 Integração entre Componentes

### Fluxo de Dados
```
1. SISREG (Estado de Solicitação)
           ↓ [Content Script captura com regex]
2. Extensão extrai JSON
           ↓ [Usuário copia manualmente]
3. Usuário cola em Órbita Regulação
           ↓ [React processa]
4. Regulador revisa + toma decisão
           ↓ [postMessage opcional]
5. Órbita notifica sisregiii (future)
```

### Comunicação Possível (Não Implementada Ainda)
```javascript
// De Órbita Regulação → Extensão SISREG
window.parent.postMessage({
  type: 'ORBITA_DECISION',
  payload: {
    codigoSolicitacao: '...',
    decisao: 'autorizado|devolvido|negado',
    motivo: '...',
    timestamp: '...'
  }
}, 'https://sisregiii.saude.gov.br');
```

---

## ⚠️ Problemas Identificados & Ajustes

### CRÍTICOS

#### 1. ❌ Extensão limitada a localhost
**Problema**: `manifest.json` tem `host_permissions: ["https://sisregiii.saude.gov.br/*"]`  
**Status**: Funciona só em produção; precisa ajuste para desenvolvimento

**Solução**:
```json
// Em desenvolvimento:
"host_permissions": [
  "https://sisregiii.saude.gov.br/*",
  "http://localhost/*",
  "http://127.0.0.1/*"
]
```

#### 2. ❌ Fluxo manual de cópia/cola
**Problema**: Usuário copia JSON e cola manualmente  
**Status**: Funciona mas é propenso a erros

**Solução** (Melhorias Futuras):
- Implementar `postMessage` direto da extensão para Órbita
- Usar `chrome.runtime.sendMessage()` entre content-script ↔ sidepanel ↔ Órbita iframe

#### 3. ❌ Sem validação de integridade
**Problema**: JSON copiado manualmente pode ser alterado  
**Status**: Risco de segurança

**Solução**:
```javascript
// Adicionar assinatura HMAC-SHA256 no JSON da extensão
{
  "pacote": { /* dados */ },
  "assinatura": "sha256_hash",
  "chavePublica": "base64_encoded"
}
```

### IMPORTANTES

#### 4. ⚠️ Extensão registrada só em `sisregiii.saude.gov.br`
**Problema**: Não funciona se domínio mudar (ex: novo servidor)  
**Status**: MVP fixo em URLs específicas

**Solução**:
- Usar `*://sisregiii.saude.gov.br/*` (protocol-agnostic)
- Adicionar manifesto dinâmico para diferentes ambientes

#### 5. ⚠️ Versão adaptador acoplada ao SISREG v3.4
**Problema**: Se SISREG mudar layout, regras não encontram mais campos  
**Status**: Precisa revalidação após atualização do SISREG

**Solução**:
- Sistema de auto-detecção de versão
- Mapeamento de versões → regras em banco de dados

#### 6. ⚠️ Sem tratamento de múltiplas abas
**Problema**: Extensão captura só da aba ativa  
**Status**: Funciona para MVP

**Solução**:
```javascript
// Adicionar fila de captura para múltiplas solicitações
const fila = [];
chrome.tabs.onActivated.addListener((tabId) => {
  processarFila(tabId);
});
```

---

## 📋 Checklist de Ajustes & Preparação para Deploy

### ANTES DE HOMOLOGAÇÃO

#### Extensão Chrome
- [ ] Testar em `https://sisregiii.saude.gov.br` (domínio real)
- [ ] Validar captura de todos os 16 campos em SISREG v3.4
- [ ] Testar bloqueio de campos sensíveis (CPF, nome, etc.)
- [ ] Verificar espaço de armazenamento (localStorage)
- [ ] Implementar logging (console + background)
- [ ] Testar em Chrome, Edge e Brave
- [ ] Criar versão com certificado de desenvolvedor

#### Aplicação React
- [ ] Integrar parsing do JSON da extensão
- [ ] Implementar validação de campos
- [ ] Criar interface de revisão de dados
- [ ] Adicionar decisão final (autorizar/devolver/negar)
- [ ] Testar responsividade em mobile
- [ ] Performance Lighthouse > 80

#### Integração
- [ ] Comunicação postMessage entre Órbita → Extensão
- [ ] Documentar fluxo para o regulador
- [ ] Criar guia de instalação da extensão
- [ ] Teste de segurança (CORS, CSP)

### DEPLOYMENT PRODUÇÃO

#### Servidor Web
- [ ] Certificado SSL/TLS válido
- [ ] Headers de segurança (HSTS, CSP, X-Frame-Options)
- [ ] CORS configurado para sisregiii.saude.gov.br
- [ ] Backup diário de logs
- [ ] Monitoramento de uptime (99.9%)

#### Publicação Extensão
- [ ] Build minificado e otimizado
- [ ] Submissão na Chrome Web Store (futuro)
- [ ] Assinatura digital do pacote .crx
- [ ] Versionamento semântico (0.2.0, 0.3.0...)

#### Conformidade
- [ ] LGPD compliance review
- [ ] Auditoria de segurança extterna
- [ ] Testes de carga (100+ usuários simultâneos)
- [ ] Disaster recovery plan

---

## 🚀 Próximas Etapas (Roadmap)

### Fase 1: MVP Atual (Agora)
- ✅ Extensão funcional com captura básica
- ✅ App React para análise
- ⏳ **Ajuste**: Remover script Perplexity do HTML
- ⏳ **Ajuste**: Adicionar validação de pacote JSON

### Fase 2: Comunicação Direta (Próximas 2-3 semanas)
- 🔄 postMessage direto: Extensão → Órbita iframe
- 🔄 Remover fluxo manual copy/paste
- 🔄 Adicionar hash de integridade

### Fase 3: Homologação (Próximo mês)
- 📋 Testes em ambiente de QA
- 📋 Validação de segurança completa
- 📋 Documentação técnica final

### Fase 4: Produção (2-3 meses)
- 🌍 Deploy em sisregiii.saude.gov.br
- 🌍 Publicação na Chrome Web Store
- 🌍 Suporte ao usuário final

---

## 📝 Observações Técnicas

### Compatibilidade de Versões
```
Extensão v0.1.0 → Compatível com SISREG v3.4
App React → Agnóstico de versão (aceita qualquer JSON)
Chrome/Edge → Manifest V3 (exigido em 2024+)
```

### Armazenamento de Dados
```
Extensão: Nenhum armazenamento local (stateless)
App React: SessionStorage para rascunhos
Chrome: Service worker + Storage API (futuro)
```

### Rate Limiting (Futuro)
```javascript
// Adicionar proteção contra abuso
const RATE_LIMIT = 10; // capturas por minuto
const WINDOW_TIMEOUT = 60000;
let capturesNeste Minuto = 0;
```

---

## 🔐 Matriz de Segurança

| Componente | Autenticação | Autorização | Criptografia | Auditoria |
|-----------|--------------|-------------|--------------|-----------|
| Extensão | Browser Identity | Padrão Chrome | HTTPS | ❌ Logs locais |
| App React | SSO futuro | RBAC proposto | TLS | ❌ Analytics |
| Comunicação | Origem validada | postMessage | HTTPS | ❌ Rastreamento |

**Recomendação**: Adicionar telemetria segura (Sentry/LogRocket) em ambos os componentes.

---

## 📞 Integração com SisRegIII

### Pré-requisitos no SisRegIII
- [ ] Whitelist de CORS para domínio do Órbita
- [ ] Policy de iframe permissivo (X-Frame-Options)
- [ ] Documentação de API (se houver)

### URLs de Integração
```
Extensão: chrome-extension://ID-GERADO/sidepanel.html
App: https://seu-dominio.com.br/orbita-regulacao/
SISREG: https://sisregiii.saude.gov.br/
```

---

## 🎯 Status Final

| Item | Status | Prioridade |
|------|--------|-----------|
| Análise Técnica | ✅ Completa | Alta |
| HTML Limpo | ✅ Feito | Alta |
| Extensão Testada | ❌ Pendente | Alta |
| Integração iframe | ⚠️ Parcial | Média |
| Deploy | ⏳ Planejado | Média |
| Segurança | ⚠️ Review pendente | Alta |

---

**Data de Análise**: 2026-08-15  
**Status Geral**: 🟡 Pronto para Testes Iniciais  
**Próximo Marco**: Teste integrado em ambiente local (1 semana)

---

## 📋 Anexos

### A. Estrutura de Pastas
```
/workspaces/RegulacaoAM/
├── index.html (AJUSTADO)
├── favicon.svg
├── assets/
│   ├── index-CfhdQq5-.css
│   └── index-Dcrh6tH4.js
├── extensao-sisreg/
│   ├── manifest.json
│   ├── service-worker.js
│   ├── content-script.js
│   ├── sidepanel.html
│   ├── sidepanel.js
│   ├── styles.css
│   └── README.md
└── ANALISE_E_AJUSTES.md (este arquivo)
```

### B. Variáveis de Ambiente (Futuro)
```env
VITE_SISREGIII_ORIGIN=https://sisregiii.saude.gov.br
VITE_API_ENDPOINT=https://api.sisregiii.saude.gov.br
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEVTOOLS=false
```

### C. Comandos Úteis
```bash
# Testar extensão localmente
chrome://extensions → Carregar sem compactação → /extensao-sisreg

# Servir app React
npm install
npm run dev

# Build para produção
npm run build

# Deploy
rsync -av --delete dist/ usuario@servidor:/var/www/orbita-regulacao/
```
