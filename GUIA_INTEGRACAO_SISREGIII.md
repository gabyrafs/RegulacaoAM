# 🚀 Guia de Integração no SisRegIII

## 1. Instalação da Extensão Chrome (Homologação Local)

### Passo 1: Preparar Ambiente
```bash
# Clonar repositório
git clone https://github.com/gabyrafs/RegulacaoAM.git
cd RegulacaoAM/extensao-sisreg

# Nenhuma dependência necessária (puro Chrome API)
```

### Passo 2: Carregar Extensão
1. Abra `chrome://extensions` (ou `edge://extensions`)
2. Ative **Modo de Desenvolvedor** (canto superior direito)
3. Clique **Carregar extensão sem compactação**
4. Selecione a pasta `/extensao-sisreg`
5. Anote o **ID da extensão** gerado (ex: `abcdefghijklmnop`)

### Passo 3: Autenticar no SISREG
1. Abra `https://sisregiii.saude.gov.br`
2. Autentique com suas credenciais institucionais
3. Navegue até uma solicitação oftalmológica

### Passo 4: Usar o Conector
1. Clique no ícone da extensão (barra de ferramentas)
2. Painel lateral abre à direita
3. **Desmarque** "Incluir narrativa clínica" (padrão seguro)
4. Clique **Capturar campos permitidos**
5. Revise o JSON gerado
6. Clique **Copiar pacote JSON**

---

## 2. Instalação da Aplicação React (Órbita Regulação)

### Opção A: Desenvolvimento Local
```bash
# Instalar dependências (se houver package.json)
npm install

# Ou servir arquivos estáticos
python3 -m http.server 3000
# ou
npx http-server -p 3000

# Acesso: http://localhost:3000
```

### Opção B: Docker (Recomendado)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

```bash
# Build e run
docker build -t orbita-regulacao .
docker run -p 3000:3000 orbita-regulacao
```

### Opção C: Servidor Apache/Nginx
```bash
# Copiar arquivos
sudo cp -r /workspaces/RegulacaoAM/* /var/www/orbita-regulacao/

# Configurar .htaccess (Apache)
# Ver arquivo: HTACCESS_CONFIG.md
```

---

## 3. Fluxo Completo de Uso

### Cenário: Regulador revisa solicitação no SISREG

```
┌─────────────────────────────────────────────────────────────┐
│ SISREG III - Solicitação #12345                             │
│                                                               │
│ ┌─ Coluna de Dados ────────────────────────────────────────┐
│ │ Código: SOL-2026-08-12345                               │
│ │ CNES Solicitante: 123456                                │
│ │ Procedimento: Cirurgia de Catarata                      │
│ │ CID: H25.0                                              │
│ │ Classificação: Urgência                                 │
│ │ Situação: Pendente análise                              │
│ └─────────────────────────────────────────────────────────┘
│                                                               │
│ 🔵 [Ícone Extensão Órbita]  ← Clique aqui                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Painel Lateral - Órbita Conector SISREG                     │
│                                                               │
│ ✓ Não autoriza, devolve, nega, cancela ou agenda          │
│ ✓ Nenhuma senha é lida ou armazenada                       │
│                                                               │
│ ☐ Incluir narrativa clínica nesta captura                 │
│   (ative somente quando necessário)                         │
│                                                               │
│ [Capturar campos permitidos]                                │
│                                                               │
│ Estado: 16 campos capturados para revisão                   │
│                                                               │
│ JSON Capturado:                                              │
│ {                                                            │
│   "origem": "sisreg-extension",                             │
│   "versao": "0.1.0",                                        │
│   "campos": {                                               │
│     "codigoSolicitacao": "SOL-2026-08-12345",              │
│     "cnesSolicitante": "123456",                           │
│     ...                                                      │
│   },                                                         │
│   "metadados": { ... }                                      │
│ }                                                            │
│                                                               │
│ [Copiar pacote JSON]                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │ Usuário copia JSON para clipboard    │
        └──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Órbita Regulação                                             │
│ (em nova aba ou embed no SISREG)                            │
│                                                               │
│ [Cole aqui o pacote da solicitação]                         │
│ │ {                                                          │
│ │   "origem": "sisreg-extension",                           │
│ │   ...                                                      │
│ │ }                                                          │
│                                                               │
│ ┌─ Análise Oftalmológica ────────────────────────────────┐ │
│ │ Solicitação: SOL-2026-08-12345                        │ │
│ │ Procedimento: Cirurgia de Catarata                    │ │
│ │ Classificação: Urgência                               │ │
│ │                                                         │ │
│ │ [Revisar Documentação] [Consultar Protocolos]        │ │
│ │                                                         │ │
│ │ Decisão:                                               │ │
│ │ ○ Autorizado   ○ Devolvido   ○ Negado               │ │
│ │                                                         │ │
│ │ Justificativa: ___________________________            │ │
│ │                                                         │ │
│ │ [Enviar Decisão]                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
            ┌──────────────────────────────┐
            │ SISREG atualizado com         │
            │ decisão do regulador          │
            └──────────────────────────────┘
```

---

## 4. Implementar Integração no HTML do SisRegIII

### Adicionar iframe ao SisRegIII (Admin)

```html
<!-- No arquivo de template do SISREG, adicione uma nova aba: -->

<div class="tab-content" id="tab-orbita" style="display: none;">
  <iframe 
    id="orbita-frame"
    src="https://seu-dominio.com.br/orbita-regulacao/"
    title="Órbita Regulação - Análise Assistida"
    allow="clipboard-read; clipboard-write"
    sandbox="allow-same-origin allow-scripts allow-forms"
    style="width: 100%; height: 100%; border: none;"
  ></iframe>
</div>

<script>
  // Comunicação entre SISREG ↔ Órbita
  const orbitaFrame = document.getElementById('orbita-frame');
  
  // Quando Órbita está pronto
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://seu-dominio.com.br') return;
    
    if (event.data.type === 'ORBITA_READY') {
      console.log('✓ Órbita Regulação conectado');
      // Enviar contexto do SISREG
      orbitaFrame.contentWindow.postMessage({
        type: 'SISREG_CONTEXT',
        usuario: window.usuarioSISREG,
        permissoes: window.permissoes
      }, 'https://seu-dominio.com.br');
    }
    
    if (event.data.type === 'ORBITA_DECISION') {
      // Processar decisão do regulador
      console.log('Decisão recebida:', event.data.payload);
      // Atualizar SISREG...
    }
  });
</script>
```

---

## 5. Configuração de Segurança (Headers HTTP)

### Apache (.htaccess)
```apache
# .htaccess na raiz do Órbita
<IfModule mod_headers.c>
  # CORS para sisregiii
  Header set Access-Control-Allow-Origin "https://sisregiii.saude.gov.br"
  Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, X-Requested-With"
  
  # Segurança
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com https://api.fontshare.com"
  
  # Cache
  Header set Cache-Control "public, max-age=3600"
  Header set Expires "Thu, 15 Apr 2026 20:00:00 GMT"
</IfModule>

# Redirecionar HTTP → HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### Nginx
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name seu-dominio.com.br;
    
    ssl_certificate /etc/ssl/certs/seu-dominio.crt;
    ssl_certificate_key /etc/ssl/private/seu-dominio.key;
    
    root /var/www/orbita-regulacao;
    index index.html;
    
    # CORS
    add_header 'Access-Control-Allow-Origin' 'https://sisregiii.saude.gov.br' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
    
    # Segurança
    add_header 'X-Content-Type-Options' 'nosniff' always;
    add_header 'X-Frame-Options' 'SAMEORIGIN' always;
    add_header 'Content-Security-Policy' "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com" always;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 6. Variáveis de Ambiente

Criar arquivo `.env.production` na raiz:

```env
# Ambiente
VITE_APP_ENV=production
VITE_APP_NAME=Órbita Regulação

# URLs
VITE_SISREGIII_ORIGIN=https://sisregiii.saude.gov.br
VITE_SISREGIII_API=https://sisregiii.saude.gov.br/api
VITE_ORBITA_ORIGIN=https://seu-dominio.com.br

# Extensão
VITE_EXTENSION_ID=abcdefghijklmnop
VITE_EXTENSION_VERSION=0.1.0

# Logging
VITE_LOG_LEVEL=info
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_KEY=seu-key-aqui

# Feature flags
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_MOCK_DATA=false
VITE_OFFLINE_MODE=false
```

---

## 7. Testes de Integração

### Teste 1: Comunicação Extensão ↔ App
```javascript
// Console do navegador
// 1. Abra SisRegIII
// 2. Clique no ícone da extensão
// 3. Cole no console:

chrome.runtime.sendMessage(
  'ID_DA_EXTENSAO',
  { tipo: 'ORBITA_CAPTURAR', incluirNarrativa: false },
  (resposta) => {
    console.log('✓ Resposta:', resposta);
    console.log('✓ Campos:', Object.keys(resposta.pacote.campos).length);
  }
);
```

### Teste 2: postMessage
```javascript
// Em Órbita Regulação (console)
window.parent.postMessage({
  type: 'TEST_COMMUNICATION',
  message: 'Órbita → SisRegIII'
}, 'https://sisregiii.saude.gov.br');

// Ouvir resposta
window.addEventListener('message', (e) => {
  console.log('✓ Mensagem recebida de:', e.origin, e.data);
});
```

### Teste 3: Segurança CORS
```bash
# Terminal
curl -i -H "Origin: https://sisregiii.saude.gov.br" \
  https://seu-dominio.com.br/orbita-regulacao/

# Procurar por:
# Access-Control-Allow-Origin: https://sisregiii.saude.gov.br
# X-Frame-Options: SAMEORIGIN
```

---

## 8. Troubleshooting

### Problema: "Extensão não captura nenhum campo"
**Causa**: SISREG versão diferente de 3.4  
**Solução**: 
```javascript
// Inspecionar página: F12 → Console
// Executar:
document.querySelectorAll('input, select, textarea').forEach(el => {
  console.log(el.name, el.id, el.textContent?.slice(0, 50));
});
// Comparar com REGRAS em content-script.js
```

### Problema: "CORS bloqueado"
**Causa**: Headers não configurados  
**Solução**:
```bash
# Verificar headers
curl -v https://seu-dominio.com.br/ 2>&1 | grep -i access-control
```

### Problema: "Órbita não carrega no iframe"
**Causa**: X-Frame-Options=DENY  
**Solução**:
```bash
# No servidor do Órbita, garantir:
# X-Frame-Options: SAMEORIGIN (ou ALLOW-FROM sisregiii.saude.gov.br)
```

---

## 9. Checklist de Deploy

- [ ] Certificado SSL válido e atualizado
- [ ] CORS configurado para sisregiii.saude.gov.br
- [ ] Headers de segurança presentes
- [ ] Extensão Chrome carrega campos corretos
- [ ] App React processa JSON sem erros
- [ ] postMessage funciona nos dois sentidos
- [ ] Cache HTTP otimizado
- [ ] Logs centralizados (Sentry/LogRocket)
- [ ] Backup automático configurado
- [ ] Monitoramento de uptime ativo

---

## 10. Contatos & Suporte

**Equipe SisRegIII**:
- Email: sisreg@saude.gov.br
- Telefone: (92) XXXX-XXXX
- Portal: https://sisregiii.saude.gov.br/suporte

**Órbita Regulação (Desenvolvimento)**:
- GitHub: https://github.com/gabyrafs/RegulacaoAM
- Issues: [Relatar problemas]
- Email de Contato: [seu-email@exemplo.com.br]

---

**Versão**: 1.0  
**Data**: 2026-08-15  
**Status**: 🟡 Piloto Técnico
