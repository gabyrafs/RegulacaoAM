# Órbita Regulação 🌍

**Apoio à regulação oftalmológica com integração ao SISREG III do Amazonas**

[![Status](https://img.shields.io/badge/status-MVP%20Piloto-yellow)]()
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)]()
[![Chrome/Edge](https://img.shields.io/badge/Chrome/Edge-Manifest%20V3-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📋 Visão Geral

**Órbita Regulação** é um sistema de apoio à regulação oftalmológica que funciona como:

1. **Extensão Chrome** (`Órbita Conector SISREG`) - Extrai dados do SISREG III de forma segura
2. **Aplicação Web** (`Órbita Regulação`) - Interface de análise para reguladores

### Arquitetura

```
SISREG III ─→ [Extensão Chrome] ─→ [JSON] ─→ [App React] ─→ [Decisão]
   (dados)                                  (análise)       (autorizar/devolver/negar)
```

---

## 🚀 Começar Rápido

### Prerequisitos
- Node.js 18+ e npm 9+
- Chrome ou Edge (com suporte a Manifest V3)
- Acesso a https://sisregiii.saude.gov.br

### Instalação (Desenvolvimento)

```bash
# 1. Clonar repositório
git clone https://github.com/gabyrafs/RegulacaoAM.git
cd RegulacaoAM

# 2. Instalar dependências
npm install

# 3. Iniciar servidor
npm start
# Acesse: http://localhost:3000

# 4. Instalar extensão (Chrome)
# Abra chrome://extensions
# Ative "Modo de desenvolvedor"
# Clique "Carregar extensão sem compactação"
# Selecione pasta: ./extensao-sisreg
```

### Executar Testes

```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Rodar testes
npm test
```

---

## 📁 Estrutura do Projeto

```
.
├── 📄 index.html                    ← App React (template Vite)
├── 📁 assets/
│   ├── index-CfhdQq5-.css          ← Estilos (72 KB)
│   └── index-Dcrh6tH4.js           ← React compilado (420 KB)
│
├── 📁 extensao-sisreg/             ← Extensão Chrome
│   ├── manifest.json               ← Configuração Manifest V3
│   ├── content-script.js           ← Captura de dados
│   ├── service-worker.js           ← Background worker
│   ├── sidepanel.html/js           ← Interface lateral
│   ├── styles.css                  ← Estilos
│   └── README.md                   ← Docs da extensão
│
├── 📄 server.js                    ← Servidor estático (Node.js)
├── 📄 .htaccess                    ← Configuração Apache
├── 📄 package.json                 ← Dependências npm
│
├── 📚 GUIA_INTEGRACAO_SISREGIII.md ← Como integrar no SisRegIII
├── 📚 ANALISE_COMPLETA_INTEGRADA.md ← Análise técnica completa
├── 📚 ANALISE_E_AJUSTES.md         ← Problemas e soluções
└── 📄 README.md                    ← Este arquivo
```

---

## 🔌 Fluxo de Uso

### 1️⃣ Regulador abre SISREG III
```
https://sisregiii.saude.gov.br → [Autenticação] → [Solicitação de Cirurgia]
```

### 2️⃣ Clica no ícone da Extensão
```
🔵 [Ícone Órbita Conector] (canto superior direito)
↓
[Painel Lateral Abre]
```

### 3️⃣ Captura dados da página
```
[Botão: Capturar campos permitidos]
↓
Content Script extrai campos usando REGEX
↓
Filtra dados sensíveis (CPF, nome, etc.)
↓
Gera JSON com metadados
```

### 4️⃣ Copia JSON
```
[Botão: Copiar pacote JSON]
↓
Clipboard: { "origem": "sisreg-extension", "campos": {...}, ... }
```

### 5️⃣ Cola no Órbita Regulação
```
http://localhost:3000 (ou sisregiii.saude.gov.br/orbita)
↓
[Cole aqui o JSON]
↓
App processa e exibe interface de análise
```

### 6️⃣ Regulador toma decisão
```
[Radiobotões: Autorizado | Devolvido | Negado]
[Textarea: Justificativa]
[Botão: Enviar Decisão]
↓
Órbita notifica SISREG (implementação futura)
```

---

## 🔐 Segurança

### Extensão
- ✅ **Somente leitura** de campos
- ✅ **Bloqueia** CNS, CPF, telefone, filiação, nascimento, endereço
- ✅ **Sem captura** de credenciais
- ✅ **Sem autorizar/devolver/negar/cancelar/agendar**
- ✅ **Narrativa clínica** desabilitada por padrão

### App Web
- ✅ **CSP** (Content Security Policy) configurada
- ✅ **CORS** habilitado apenas para sisregiii.saude.gov.br
- ✅ **HTTPS** obrigatório (em produção)
- ✅ **Headers** de segurança presentes (X-Frame-Options, etc.)
- ✅ **Cache HTTP** otimizado

### Comunicação
- ✅ **postMessage** validado por origem
- ✅ **CSRF protection** via token (futuro)
- ✅ **Integridade de dados** via assinatura (futuro)

---

## 🛠️ Configuração do Servidor

### Apache (.htaccess)
```apache
# Arquivo: .htaccess (já incluído)
- Redirecionar HTTP → HTTPS
- CORS para sisregiii.saude.gov.br
- Cache HTTP inteligente
- CSP e headers de segurança
- Compression GZIP
```

### Nginx
Ver [GUIA_INTEGRACAO_SISREGIII.md](GUIA_INTEGRACAO_SISREGIII.md) para nginx.conf

### Node.js
```bash
npm start
# Ou manualmente:
node server.js 3000
```

---

## 📊 Performance

| Métrica | Valor |
|---------|-------|
| Tamanho Total | ~500 KB |
| Tamanho HTML | 12.6 KB |
| Tamanho CSS | 72 KB |
| Tamanho JS | 420 KB |
| Tempo de Captura | < 500ms |
| Campos Capturáveis | 16 campos |

**Scores Recomendados** (Lighthouse):
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## 🧪 Testes

### Testes Automáticos
```bash
npm test
```

Valida:
- Headers de segurança
- Servimento de arquivos
- Rotas SPA
- Compressão
- Estrutura da extensão

### Testes Manuais

1. **Testar Extensão**
   ```bash
   1. Abra chrome://extensions
   2. Carregar extensão
   3. Ir para sisregiii.saude.gov.br
   4. Clique no ícone
   5. Capture campos
   6. Verifique JSON
   ```

2. **Testar Comunicação**
   ```javascript
   // Console do navegador
   window.postMessage({
     type: 'TEST',
     message: 'Hello from parent'
   }, '*');
   ```

3. **Testar CORS**
   ```bash
   curl -i -H "Origin: https://sisregiii.saude.gov.br" \
     http://localhost:3000/
   ```

---

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| [GUIA_INTEGRACAO_SISREGIII.md](GUIA_INTEGRACAO_SISREGIII.md) | Como integrar no SisRegIII |
| [ANALISE_COMPLETA_INTEGRADA.md](ANALISE_COMPLETA_INTEGRADA.md) | Análise técnica completa |
| [ANALISE_E_AJUSTES.md](ANALISE_E_AJUSTES.md) | Problemas e soluções |
| [extensao-sisreg/README.md](extensao-sisreg/README.md) | Docs da extensão |

---

## 🚀 Deployment

### Desenvolvimento
```bash
npm start
# http://localhost:3000
```

### Produção (Apache)
```bash
# 1. Copiar arquivos
sudo cp -r . /var/www/orbita-regulacao/

# 2. Configurar permissões
sudo chown -R www-data:www-data /var/www/orbita-regulacao/

# 3. Habilitar .htaccess no Apache
sudo a2enmod rewrite headers
sudo systemctl restart apache2

# 4. Testar
curl -i https://seu-dominio.com.br/orbita-regulacao/
```

### Produção (Docker)
```bash
docker build -t orbita-regulacao .
docker run -p 80:3000 -p 443:3000 \
  -e NODE_ENV=production \
  orbita-regulacao
```

---

## 🔄 Roadmap

### Fase 1: MVP Atual ✅
- [x] Extensão funcional
- [x] App React
- [x] Documentação
- [x] Testes básicos

### Fase 2: Comunicação Direta (2-3 semanas)
- [ ] postMessage direto entre componentes
- [ ] Remover fluxo copy/paste
- [ ] Hash de integridade

### Fase 3: Homologação (Próximo mês)
- [ ] Testes de QA
- [ ] Auditoria de segurança
- [ ] Documentação final

### Fase 4: Produção (2-3 meses)
- [ ] Deploy em sisregiii.saude.gov.br
- [ ] Publicação na Chrome Web Store
- [ ] Suporte ao usuário

---

## 🐛 Troubleshooting

### "Porta 3000 já está em uso"
```bash
npm start 3001
# ou
lsof -i :3000
kill -9 <PID>
```

### "Extensão não captura campos"
```bash
# Verifique a versão do SISREG
# e compare com REGRAS em content-script.js
# Ver: ANALISE_E_AJUSTES.md
```

### "CORS bloqueado"
```bash
# Verificar headers
curl -v http://localhost:3000/
# Procurar por: Access-Control-Allow-Origin
```

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

**Issues & Discussões**: [GitHub Issues](https://github.com/gabyrafs/RegulacaoAM/issues)

**Email**: seu-email@exemplo.com.br

**SISREG III Suporte**: sisreg@saude.gov.br

---

## 📄 Licença

Este projeto está sob licença MIT - veja [LICENSE](LICENSE) para detalhes.

---

## ⚠️ Status Disclaimer

🟡 **Piloto Técnico** - Não homologado para produção.

Use apenas em equipamento e sessão institucional autorizados. Teste em ambiente de QA antes de deploy.

---

**Desenvolvido com ❤️ para o Amazonas**  
*Última atualização: 2026-08-15*
