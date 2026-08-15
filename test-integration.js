#!/usr/bin/env node

/**
 * Script de testes de integração para Órbita Regulação
 * Valida comunicação entre extensão, app React e SISREG III
 * 
 * Uso: node test-integration.js [modo]
 * Modos: all, extension, app, sisreg, security
 */

const http = require('http');
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const TESTS = [];
let passCount = 0;
let failCount = 0;

// Utilitários
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition, testName, errorMsg = '') {
  if (condition) {
    log(`  ✓ ${testName}`, 'green');
    passCount++;
  } else {
    log(`  ✗ ${testName} ${errorMsg ? '- ' + errorMsg : ''}`, 'red');
    failCount++;
  }
}

function makeRequest(method, path, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'Órbita-Test/0.1.0',
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ===== TESTES DE SEGURANÇA =====

async function testSecurityHeaders() {
  log('\n🔐 Testes de Segurança (Headers HTTP)', 'blue');
  
  try {
    const response = await makeRequest('GET', '/');
    const headers = response.headers;

    assert(
      headers['x-content-type-options'] === 'nosniff',
      'X-Content-Type-Options: nosniff'
    );

    assert(
      headers['x-frame-options']?.includes('SAME'),
      'X-Frame-Options: SAMEORIGIN'
    );

    assert(
      headers['content-security-policy']?.length > 0,
      'Content-Security-Policy presente'
    );

    assert(
      headers['access-control-allow-origin']?.includes('sisregiii'),
      'CORS habilitado para sisregiii'
    );

    assert(
      headers['cache-control']?.includes('public'),
      'Cache-Control configurado'
    );

  } catch (err) {
    log(`  ✗ Erro ao testar headers: ${err.message}`, 'red');
    failCount++;
  }
}

// ===== TESTES DE ARQUIVO =====

async function testFileServing() {
  log('\n📁 Testes de Servimento de Arquivos', 'blue');

  const files = [
    { path: '/index.html', expected: 'html' },
    { path: '/favicon.svg', expected: 'svg' },
    { path: '/assets/index-CfhdQq5-.css', expected: 'css' }
  ];

  for (const file of files) {
    try {
      const response = await makeRequest('GET', file.path);
      assert(
        response.status === 200,
        `GET ${file.path} retorna 200`
      );
      assert(
        response.headers['content-type'].includes(file.expected),
        `Content-Type correto para ${file.path}`
      );
    } catch (err) {
      log(`  ✗ Erro ao testar ${file.path}: ${err.message}`, 'red');
      failCount++;
    }
  }
}

// ===== TESTES DE ROTAS SPA =====

async function testSPARoutes() {
  log('\n🚀 Testes de Rotas SPA', 'blue');

  const routes = [
    '/solicitacao/123',
    '/regulador',
    '/analise/456'
  ];

  for (const route of routes) {
    try {
      const response = await makeRequest('GET', route);
      assert(
        response.status === 200 && response.body.includes('<!doctype html'),
        `Rota ${route} redireciona para index.html`
      );
    } catch (err) {
      log(`  ✗ Erro ao testar ${route}: ${err.message}`, 'red');
      failCount++;
    }
  }
}

// ===== TESTES DE COMPRESSÃO =====

async function testCompression() {
  log('\n⚙️  Testes de Compressão', 'blue');

  try {
    const response = await makeRequest('GET', '/assets/index-Dcrh6tH4.js', {
      headers: { 'Accept-Encoding': 'gzip' }
    });

    // Nota: A compressão pode estar ativa dependendo da configuração
    const isCompressed = response.headers['content-encoding'] === 'gzip';
    log(`  ℹ️  Compressão GZIP: ${isCompressed ? 'ativa' : 'inativa'}`, 'gray');
    
    assert(
      response.status === 200,
      'JS Bundle retorna 200'
    );

  } catch (err) {
    log(`  ✗ Erro ao testar compressão: ${err.message}`, 'red');
    failCount++;
  }
}

// ===== TESTES DE EXTENSÃO =====

function testExtensionStructure() {
  log('\n🔌 Validação da Estrutura da Extensão', 'blue');

  const fs = require('fs');
  const files = [
    'extensao-sisreg/manifest.json',
    'extensao-sisreg/service-worker.js',
    'extensao-sisreg/content-script.js',
    'extensao-sisreg/sidepanel.html',
    'extensao-sisreg/sidepanel.js',
    'extensao-sisreg/styles.css'
  ];

  for (const file of files) {
    try {
      const exists = fs.existsSync(file);
      assert(exists, `Arquivo ${file} existe`);
    } catch (err) {
      log(`  ✗ Erro ao verificar ${file}: ${err.message}`, 'red');
      failCount++;
    }
  }

  // Validar manifest.json
  try {
    const manifestContent = fs.readFileSync('extensao-sisreg/manifest.json', 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    assert(manifest.manifest_version === 3, 'Manifest V3 (obrigatório)');
    assert(manifest.name.includes('Órbita'), 'Nome correto');
    assert(manifest.host_permissions?.length > 0, 'Host permissions definidas');
    
  } catch (err) {
    log(`  ✗ Erro ao validar manifest: ${err.message}`, 'red');
    failCount++;
  }
}

// ===== TESTES DE COBERTURA DA SOLICITAÇÃO =====

function testExtractionCoverage() {
  log('\n🩺 Validação de cobertura da solicitação', 'blue');

  const fs = require('fs');
  const script = fs.readFileSync('extensao-sisreg/content-script.js', 'utf8');
  const html = fs.readFileSync('index.html', 'utf8');

  const requiredRules = [
    'nomePaciente',
    'municipio',
    'origemSolicitacao',
    'medicoSolicitante',
    'procedimento',
    'status'
  ];

  for (const rule of requiredRules) {
    assert(script.includes(`"${rule}"`), `Regra ${rule} presente no adaptador`);
  }

  assert(html.includes('Dados completos da solicitação'), 'UI mostra bloco de dados completos da solicitação');
  assert(html.includes('solicitacaoCompleta'), 'App expõe o pacote completo para revisão');
}

// ===== TESTES DE DOCUMENTAÇÃO =====

function testDocumentation() {
  log('\n📚 Validação de Documentação', 'blue');

  const fs = require('fs');
  const docs = [
    'ANALISE_E_AJUSTES.md',
    'ANALISE_COMPLETA_INTEGRADA.md',
    'GUIA_INTEGRACAO_SISREGIII.md',
    'README.md'
  ];

  for (const doc of docs) {
    try {
      const exists = fs.existsSync(doc);
      if (exists) {
        log(`  ✓ ${doc} existe`, 'green');
        passCount++;
      } else {
        log(`  ℹ️  ${doc} não encontrado (opcional)`, 'gray');
      }
    } catch (err) {
      log(`  ✗ Erro ao verificar ${doc}: ${err.message}`, 'red');
      failCount++;
    }
  }
}

// ===== EXECUTAR TESTES =====

async function runTests(mode = 'all') {
  log('\n════════════════════════════════════════════════════════', 'blue');
  log('   TESTES DE INTEGRAÇÃO - ÓRBITA REGULAÇÃO', 'blue');
  log('════════════════════════════════════════════════════════\n', 'blue');

  try {
    if (mode === 'all' || mode === 'security') {
      await testSecurityHeaders();
    }

    if (mode === 'all' || mode === 'app') {
      await testFileServing();
      await testSPARoutes();
      await testCompression();
    }

    if (mode === 'all' || mode === 'extension') {
      testExtensionStructure();
      testExtractionCoverage();
    }

    testDocumentation();

  } catch (err) {
    log(`\n❌ Erro crítico: ${err.message}`, 'red');
    process.exit(1);
  }

  // Resumo
  log('\n════════════════════════════════════════════════════════\n', 'blue');
  log(`✓ Passou: ${passCount}`, 'green');
  log(`✗ Falhou: ${failCount}`, failCount > 0 ? 'red' : 'green');
  log(`Total: ${passCount + failCount} testes\n`, 'blue');

  if (failCount > 0) {
    log('⚠️  Alguns testes falharam. Verifique a configuração.', 'yellow');
    process.exit(1);
  } else {
    log('✅ Todos os testes passaram!', 'green');
    process.exit(0);
  }
}

// Verificar se servidor está rodando
http.get('http://localhost:3000/', (res) => {
  const mode = process.argv[2] || 'all';
  runTests(mode);
}).on('error', (err) => {
  log('\n❌ Erro: Servidor não está rodando em http://localhost:3000', 'red');
  log('\nInicie o servidor com: npm start', 'yellow');
  log('Depois execute os testes com: npm test\n', 'yellow');
  process.exit(1);
});
