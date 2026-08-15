#!/usr/bin/env node

/**
 * Servidor estático para Órbita Regulação
 * Serve arquivos com headers CORS e segurança configurados
 * 
 * Uso: node server.js [porta]
 * Exemplo: node server.js 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.argv[2] || 3000;
const SISREGIII_ORIGIN = 'https://sisregiii.saude.gov.br';

// Tipos MIME
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Headers de segurança padrão
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://api.fontshare.com data:; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://sisregiii.saude.gov.br; " +
    "frame-ancestors 'self' https://sisregiii.saude.gov.br; " +
    "base-uri 'self'; " +
    "form-action 'self'"
};

// Headers CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': SISREGIII_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '3600'
};

// Configuração de cache
const CACHE_CONFIG = {
  '.html': { maxAge: 3600, revalidate: true },      // 1 hora
  '.js': { maxAge: 604800, immutable: true },       // 7 dias
  '.css': { maxAge: 604800, immutable: true },      // 7 dias
  '.svg': { maxAge: 604800, immutable: true },      // 7 dias
  '.png': { maxAge: 2592000, immutable: true },     // 30 dias
  '.jpg': { maxAge: 2592000, immutable: true },     // 30 dias
  '.woff2': { maxAge: 31536000, immutable: true },  // 1 ano
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const config = CACHE_CONFIG[ext];
  if (!config) return 'no-cache';
  
  let header = `public, max-age=${config.maxAge}`;
  if (config.revalidate) header += ', must-revalidate';
  if (config.immutable) header += ', immutable';
  return header;
}

function shouldCompress(contentType) {
  return /^(text|application\/javascript|application\/json)/.test(contentType);
}

function gzipIfNeeded(req, res, buffer, contentType) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (shouldCompress(contentType) && acceptEncoding.includes('gzip')) {
    const zlib = require('zlib');
    zlib.gzip(buffer, (err, compressed) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', compressed.length);
      res.end(compressed);
    });
  } else {
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}

function handleRequest(req, res) {
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  // Remove leading slash
  if (pathname.startsWith('/')) {
    pathname = pathname.slice(1);
  }
  
  // Padrão de segurança: recusar arquivos sensíveis
  if (/\.(env|lock|git|htaccess)$/.test(pathname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  // SPA: redirecionar para index.html
  let filePath = path.join(__dirname, pathname);
  let stat;
  
  try {
    stat = fs.statSync(filePath);
  } catch (e) {
    // Arquivo não existe, servir index.html para SPA
    filePath = path.join(__dirname, 'index.html');
    stat = fs.statSync(filePath);
  }
  
  // Se é diretório, procurar index.html
  if (stat.isDirectory()) {
    filePath = path.join(filePath, 'index.html');
    stat = fs.statSync(filePath);
  }
  
  // Ler arquivo
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    const contentType = getContentType(filePath);
    const cacheControl = getCacheControl(filePath);
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // Preparar headers
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'Vary': 'Accept-Encoding',
      ...SECURITY_HEADERS,
      ...CORS_HEADERS
    };
    
    // Verificar se deve comprimir
    if (shouldCompress(contentType) && acceptEncoding.includes('gzip')) {
      const zlib = require('zlib');
      zlib.gzip(data, (err, compressed) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        headers['Content-Encoding'] = 'gzip';
        headers['Content-Length'] = compressed.length;
        res.writeHead(200, headers);
        res.end(compressed);
      });
    } else {
      headers['Content-Length'] = data.length;
      res.writeHead(200, headers);
      res.end(data);
    }
  });
}

// Criar servidor
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`\n🚀 Órbita Regulação rodando em http://localhost:${PORT}\n`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  console.log(`🔒 CORS configurado para: ${SISREGIII_ORIGIN}`);
  console.log(`⏹️  Para parar: Ctrl+C\n`);
});

// Tratamento de erro
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Erro: Porta ${PORT} já está em uso`);
    console.log(`Tente: node server.js ${PORT + 1}`);
  } else {
    console.error('❌ Erro no servidor:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado');
    process.exit(0);
  });
});
