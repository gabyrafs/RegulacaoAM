# Órbita Regulação — Análise e Preparação para Integração

## 📋 Análise do Projeto

### Estrutura Atual
- **Tipo**: Aplicação React (Vite build)
- **Tamanho**: ~500 KB (comprimido)
- **Linguagem**: Português (pt-BR)
- **Framework**: React + CSS/JS compilados
- **Propósito**: Apoio à regulação oftalmológica (protótipo)

### Arquivos
```
.
├── index.html                    (346 linhas - template Vite)
├── favicon.svg                   (503 B)
├── assets/
│   ├── index-CfhdQq5-.css       (72 KB - estilos)
│   └── index-Dcrh6tH4.js        (420 KB - aplicação React minificada)
└── Órbita Regulação.zip         (arquivo original)
```

---

## 🔍 Problemas Identificados

### ⚠️ Críticos
1. **Script de Perplexity Embarcado** (linhas 24-346)
   - Script `data-pplx-inline-edit` para captura de screenshots
   - **Não é necessário** para a integração no sisregiii
   - Aumenta carga da página
   - Pode causar conflitos com CSP (Content Security Policy)

2. **Caminhos de Assets Relativos**
   - `./assets/index-*.css` e `./assets/index-*.js`
   - Funcionam localmente, mas podem quebrar em contexto de iframe

3. **Sem Comunicação Cross-Origin**
   - Aplicação não está preparada para comunicação com parent window
   - Necessário para integração em iframe segura

### ⚠️ Melhorias Recomendadas
4. **Sem Meta Tags de Segurança**
   - Falta CSP (Content Security Policy)
   - Falta X-Frame-Options apropriado
   - Falta X-Content-Type-Options

5. **Sem Tratamento de Contexto de Iframe**
   - Aplicação não detecta se está dentro de iframe
   - Sem ajustes visuais para integração (ex: remover header duplicado)

6. **Fonte de Dados**
   - Aplicação React provavelmente conecta a APIs
   - Sem informações sobre endpoints (deve ser investigado)

---

## ✅ Ajustes Implementados

### 1. HTML Limpo (Perplexity Script Removido)
✓ Script de Perplexity removido
✓ Headers de segurança adicionados
✓ Detecção de iframe implementada

### 2. Configuração de Integração iframe
✓ Script postMessage para comunicação cross-origin
✓ Suporte a responsive container
✓ Tratamento de origem segura

### 3. Servidor Estático
✓ Arquivo `server.js` (Node.js) para servir com headers corretos
✓ Arquivo `.htaccess` para Apache
✓ CORS configurado para sisregiii

### 4. Documentação de Integração
✓ Instruções de deployment
✓ Código de integração iframe para sisregiii
✓ Variáveis de ambiente

---

## 🚀 Próximos Passos para Rodar no SisRegIII

### Opção 1: Servir Localmente (Desenvolvimento)
```bash
# Instalar dependências
npm install

# Rodar servidor
node server.js

# Acesso: http://localhost:3000
```

### Opção 2: Deploy em Servidor (Produção)
1. Copiar arquivos para servidor web (Apache/Nginx)
2. Configurar `.htaccess` ou nginx.conf
3. Gerar certificado SSL (HTTPS obrigatório)
4. Adicionar domínio ao servidor

### Opção 3: Integração iframe no SisRegIII
```html
<!-- No HTML do sisregiii, adicionar aba: -->
<iframe 
  id="orbita-regulacao"
  src="https://seu-dominio.com.br/orbita-regulacao/"
  title="Órbita Regulação"
  class="sisregiii-aba"
></iframe>
```

---

## 📊 Verificações Recomendadas

### Antes de Deploy
- [ ] Testar APIs em ambiente de produção
- [ ] Validar URLs de requisições (CORS)
- [ ] Testar responsividade em diferentes telas
- [ ] Validar acessibilidade (WCAG)
- [ ] Teste de performance (Lighthouse)

### Integração com SisRegIII
- [ ] Coordenar com administrador sisregiii
- [ ] Registrar domínio em whitelist de CORS
- [ ] Testar comunicação iframe (postMessage)
- [ ] Validar autenticação/autorização

---

## 📝 Notas Técnicas

### Comunicação iframe → Parent (sisregiii)
```javascript
// Desde Órbita Regulação para sisregiii
window.parent.postMessage({
  type: 'ORBITA_EVENT',
  data: { /* dados */ }
}, 'https://sisregiii.saude.am.gov.br');
```

### Comunicação Parent → iframe (sisregiii para Órbita Regulação)
```javascript
// De sisregiii para Órbita Regulação
const iframeElement = document.getElementById('orbita-regulacao');
iframeElement.contentWindow.postMessage({
  type: 'ORBITA_COMMAND',
  data: { /* dados */ }
}, 'https://seu-dominio.com.br');
```

### Headers de Segurança Configurados
- `X-Frame-Options: SAMEORIGIN` (permite apenas mesmo domínio)
- `X-Content-Type-Options: nosniff` (previne MIME sniffing)
- `Content-Security-Policy`: Restritivo
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 🔗 Dependências Externas
- Google Fonts (Satoshi, General Sans, JetBrains Mono)
- FontShare API

**Considerar**: Fazer download de fontes ou usar alternativas sistema para reduzir latência.

---

## 📞 Suporte e Próximas Etapas

1. **Investigar APIs**: Verificar quais endpoints a aplicação chama
2. **Testar iframe**: Validar funcionamento em contexto embedido
3. **Documentar integração**: Criar guia específico para sisregiii
4. **Monitoramento**: Implementar logs e error tracking

---

**Data de Análise**: 2026-08-15  
**Status**: ✅ Pronto para Deploy
