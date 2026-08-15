# 🚀 Guia: Executar Órbita Regulação no Seu Notebook

## ✅ Pré-requisitos

### 1. Verificar Node.js e npm

Abra o terminal/prompt e verifique se tem Node.js instalado:

```bash
node --version
npm --version
```

**Resultado esperado:**
```
v18.0.0 (ou superior)
9.0.0 (ou superior)
```

### Se NÃO tiver Node.js instalado:

**Windows/Mac/Linux:**
Baixe em: https://nodejs.org/ (versão LTS recomendada)

Após instalar, verifique novamente:
```bash
node --version
npm --version
```

---

## 📥 Passo 1: Clonar o Repositório

Abra o terminal e execute:

```bash
git clone https://github.com/gabyrafs/RegulacaoAM.git
cd RegulacaoAM
```

**Se NÃO tiver Git instalado:**
- Windows: https://git-scm.com/download/win
- Mac: `brew install git`
- Linux: `sudo apt install git`

---

## 📦 Passo 2: Instalar Dependências

No terminal (dentro da pasta RegulacaoAM), execute:

```bash
npm install
```

**O que acontece:**
- Baixa e instala todas as dependências do projeto
- Cria pasta `node_modules/`
- Demora ~1-2 minutos na primeira vez

---

## 🎮 Passo 3: Iniciar o Servidor

Execute:

```bash
npm start
```

**Resultado esperado:**
```
🚀 Órbita Regulação rodando em http://localhost:3000

📍 Acesse: http://localhost:3000
🔒 CORS configurado para: https://sisregiii.saude.gov.br
⏹️  Para parar: Ctrl+C
```

---

## 🌐 Passo 4: Acessar no Navegador

Abra seu navegador e acesse:

```
http://localhost:3000
```

**Você deve ver:**
- Página com título "Órbita Regulação"
- Tema de regulação oftalmológica
- Interface responsiva

---

## 🔌 Passo 5: Instalar Extensão Chrome

### 5.1 Abra Chrome/Edge

### 5.2 Vá para extensões
```
chrome://extensions
```

### 5.3 Ative Modo de Desenvolvedor
Canto superior direito → ativar toggle

### 5.4 Carregar extensão sem compactação
```
Clique em "Carregar extensão sem compactação"
```

### 5.5 Selecionar pasta
Navegue até: `RegulacaoAM/extensao-sisreg`

**Você deve ver:**
- Ícone "Órbita Conector" na barra de extensões
- ID da extensão (ex: `abcdefghijklmnop`)

---

## 🧪 Passo 6: Rodar Testes

**Abra outro terminal** (sem fechar o anterior) e execute:

```bash
npm test
```

**Resultado esperado:**
```
✓ Passou: 28
✗ Falhou: 0
Total: 28 testes

✅ Todos os testes passaram!
```

---

## 🧑‍💻 Fluxo Completo de Desenvolvimento

### Terminal 1: Servidor rodando
```bash
npm start
# Deixe rodando - não feche!
```

### Terminal 2: Trabalhar no projeto
```bash
# Editar arquivos, rodar testes, etc.
npm test
```

### Parar o servidor (quando necessário)
```bash
# No terminal onde npm start está rodando:
Ctrl+C
```

---

## 🔗 Testar Integração com SISREG

### 1. Servidor local rodando
```bash
npm start
```

### 2. Abrir sisregiii.saude.gov.br
```
https://sisregiii.saude.gov.br
```

### 3. Autenticar-se
Usar credenciais institucionais

### 4. Clicar no ícone da extensão
Barra de ferramentas → Órbita Conector

### 5. Capturar dados
Clique em "Capturar campos permitidos"

### 6. Copiar e testar
Copie o JSON e cole em http://localhost:3000

---

## 🆘 Troubleshooting

### ❌ "Porta 3000 já está em uso"

**Solução 1:** Fechar o que está usando a porta
```bash
# Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

**Solução 2:** Usar outra porta
```bash
npm start 3001
```

### ❌ "npm: comando não encontrado"

Node.js não está instalado. Ver "Pré-requisitos" acima.

### ❌ "Extensão não funciona"

1. Verificar se está em `https://sisregiii.saude.gov.br`
2. Recarregar página (F5)
3. Verificar console (F12 → Console)
4. Reinstalar extensão

### ❌ "Erro ao acessar http://localhost:3000"

1. Verificar se servidor está rodando (`npm start`)
2. Verificar se não tem firewall bloqueando
3. Tentar `http://127.0.0.1:3000`

### ❌ "CORS error"

Normal em desenvolvimento. Continua funcionando para sisregiii (domínio específico).

---

## 📚 Arquivos Importantes

```
RegulacaoAM/
├── README.md ........................ Documentação principal
├── DEPLOYMENT_STATUS.md ........... Status do deployment
├── GUIA_INTEGRACAO_SISREGIII.md .. Integração no sisregiii
├── ANALISE_COMPLETA_INTEGRADA.md . Análise técnica
└── package.json ................... Dependências do projeto
```

---

## 🎯 Próximos Passos

### Após rodar com sucesso:

1. **Explorar a aplicação**
   - Teste diferentes telas
   - Verifique responsividade (F12)

2. **Instalar extensão Chrome**
   - Siga "Passo 5" acima
   - Teste em sisregiii.saude.gov.br

3. **Rodar testes**
   - `npm test` em outro terminal
   - Valide que tudo está funcionando

4. **Ler documentação**
   - [README.md](README.md) para overview
   - [GUIA_INTEGRACAO_SISREGIII.md](GUIA_INTEGRACAO_SISREGIII.md) para integração

---

## ⌨️ Comandos Rápidos

```bash
# Clonar e entrar na pasta
git clone https://github.com/gabyrafs/RegulacaoAM.git && cd RegulacaoAM

# Instalar dependências
npm install

# Iniciar servidor (porta 3000)
npm start

# Iniciar servidor (porta 3001)
npm start 3001

# Rodar testes
npm test

# Parar servidor
Ctrl+C
```

---

## 🖥️ Sistemas Operacionais

### Windows
- ✅ Totalmente suportado
- Use PowerShell ou CMD
- [Instalar Node.js](https://nodejs.org/)

### Mac
- ✅ Totalmente suportado
- Use Terminal.app
- `brew install node` (via Homebrew)

### Linux (Ubuntu/Debian)
- ✅ Totalmente suportado
- `sudo apt install nodejs npm`
- Use qualquer terminal

---

## 📊 Especificações Mínimas

| Item | Requerido |
|------|-----------|
| Node.js | v18+ |
| npm | v9+ |
| RAM | 512 MB |
| Disk | 500 MB |
| Conexão | 100 Kbps |
| Navegador | Chrome/Edge/Firefox |

---

## 🎉 Tudo Pronto!

Após seguir os passos acima, seu sistema estará 100% funcional localmente!

**Acesso:** http://localhost:3000

---

**Dúvidas?** Ver [ANALISE_E_AJUSTES.md](ANALISE_E_AJUSTES.md) ou [README.md](README.md)

**Data**: 2026-08-15  
**Status**: Guia Completo ✅
