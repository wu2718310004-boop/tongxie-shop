// ============================================
// 本地 API 服务器（零依赖，仅用 Node.js 内置模块）
// 模拟 Cloudflare Workers 环境，用于本地开发验证
// 部署时替换为 workers/src/index.js
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const { checkAuth } = require('./auth');

const PORT = process.env.PORT || 8787;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ============================================
// 工具函数
// ============================================

function jsonResponse(data, status) {
  const body = JSON.stringify(data);
  return {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body
  };
}

function sendResponse(res, { status, headers, body }) {
  const allHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    ...headers
  };
  res.writeHead(status, allHeaders);
  res.end(body);
}

function getBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function parseJSON(req) {
  const buf = await getBody(req);
  if (!buf.length) return {};
  return JSON.parse(buf.toString('utf-8'));
}

// ============================================
// Multipart 解析（仅用于文件上传，不依赖第三方库）
// ============================================

function parseMultipart(buffer, boundary) {
  const boundaryBuf = Buffer.from('--' + boundary);
  const endBoundary = Buffer.from('--' + boundary + '--');
  const crlfcrlf = Buffer.from('\r\n\r\n');
  const parts = [];

  let pos = buffer.indexOf(boundaryBuf);
  while (pos !== -1) {
    if (buffer.slice(pos, pos + endBoundary.length).equals(endBoundary)) break;

    const headerStart = pos + boundaryBuf.length + 2;
    const headerEnd = buffer.indexOf(crlfcrlf, headerStart);
    if (headerEnd === -1) break;

    const headersStr = buffer.slice(headerStart, headerEnd).toString('utf-8');
    const bodyStart = headerEnd + 4;
    const nextBoundary = buffer.indexOf(boundaryBuf, bodyStart);
    const bodyEnd = nextBoundary !== -1 ? nextBoundary - 2 : buffer.length;
    const body = buffer.slice(bodyStart, bodyEnd);

    const nameMatch = headersStr.match(/name="([^"]+)"/);
    const filenameMatch = headersStr.match(/filename="([^"]+)"/);
    const typeMatch = headersStr.match(/Content-Type:\s*(\S+)/i);

    parts.push({
      name: nameMatch ? nameMatch[1] : '',
      filename: filenameMatch ? filenameMatch[1] : null,
      contentType: typeMatch ? typeMatch[1].trim() : 'text/plain',
      data: body
    });

    pos = nextBoundary;
  }
  return parts;
}

// ============================================
// 路由处理
// ============================================

function getRouteParams(pathname) {
  // /api/products/123 → { id: 123 }
  const productsMatch = pathname.match(/^\/api\/products\/(\d+)$/);
  if (productsMatch) return { type: 'productById', id: parseInt(productsMatch[1]) };

  // /images/filename.jpg → { filename: 'filename.jpg' }
  const imagesMatch = pathname.match(/^\/images\/([^/]+)$/);
  if (imagesMatch) return { type: 'image', filename: imagesMatch[1] };

  return { type: pathname };
}

async function handleRequest(req) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const method = req.method.toUpperCase();
  const route = getRouteParams(pathname);

  // ===== CORS 预检 =====
  if (method === 'OPTIONS') {
    return jsonResponse({ ok: true }, 204);
  }

  // ===== 管理后台页面 =====
  if (method === 'GET' && pathname === '/admin') {
    const htmlPath = path.join(__dirname, '..', 'admin', 'index.html');
    try {
      const html = fs.readFileSync(htmlPath, 'utf-8');
      return { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html };
    } catch (e) {
      return jsonResponse({ success: false, error: '管理页面未找到' }, 404);
    }
  }

  // ===== 登录验证 =====
  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseJSON(req);
    if (body.password === ADMIN_PASSWORD) {
      return jsonResponse({ success: true, data: { ok: true } });
    }
    return jsonResponse({ success: false, error: '密码错误' }, 401);
  }

  // ===== 商品列表 =====
  if (method === 'GET' && pathname === '/api/products') {
    const category = url.searchParams.get('category');
    const products = db.getAllProducts(category || null);
    return jsonResponse({ success: true, data: products });
  }

  // ===== 单个商品 =====
  if (method === 'GET' && route.type === 'productById') {
    const product = db.getProductById(route.id);
    if (!product) {
      return jsonResponse({ success: false, error: '商品不存在' }, 404);
    }
    return jsonResponse({ success: true, data: product });
  }

  // ===== 添加商品 =====
  if (method === 'POST' && pathname === '/api/products') {
    if (!checkAuth(req)) {
      return jsonResponse({ success: false, error: '需要管理员密码' }, 401);
    }
    const body = await parseJSON(req);
    if (!body.name || !body.category) {
      return jsonResponse({ success: false, error: '商品名称和分类不能为空' }, 400);
    }
    const product = db.createProduct(body);
    return jsonResponse({ success: true, data: product }, 201);
  }

  // ===== 更新商品 =====
  if (method === 'PUT' && route.type === 'productById') {
    if (!checkAuth(req)) {
      return jsonResponse({ success: false, error: '需要管理员密码' }, 401);
    }
    const body = await parseJSON(req);
    const product = db.updateProduct(route.id, body);
    if (!product) {
      return jsonResponse({ success: false, error: '商品不存在' }, 404);
    }
    return jsonResponse({ success: true, data: product });
  }

  // ===== 下架/删除商品 =====
  if (method === 'DELETE' && route.type === 'productById') {
    if (!checkAuth(req)) {
      return jsonResponse({ success: false, error: '需要管理员密码' }, 401);
    }
    const ok = db.deleteProduct(route.id);
    if (!ok) {
      return jsonResponse({ success: false, error: '商品不存在' }, 404);
    }
    return jsonResponse({ success: true, data: { deleted: true } });
  }

  // ===== 图片上传 =====
  if (method === 'POST' && pathname === '/api/upload') {
    if (!checkAuth(req)) {
      return jsonResponse({ success: false, error: '需要管理员密码' }, 401);
    }
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return jsonResponse({ success: false, error: '需要 multipart/form-data' }, 400);
    }

    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      return jsonResponse({ success: false, error: '缺少 boundary' }, 400);
    }

    const boundary = boundaryMatch[1].replace(/^"|"$/g, '');
    const buf = await getBody(req);
    const parts = parseMultipart(buf, boundary);
    const filePart = parts.find(p => p.filename);

    if (!filePart) {
      return jsonResponse({ success: false, error: '未找到上传文件' }, 400);
    }

    // 验证文件类型
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(filePart.contentType)) {
      return jsonResponse({ success: false, error: '仅支持 JPG/PNG/WebP 格式' }, 400);
    }

    // 验证文件大小（本地限制 2MB，部署 R2 后可调整）
    const MAX_SIZE = 2 * 1024 * 1024;
    if (filePart.data.length > MAX_SIZE) {
      return jsonResponse({ success: false, error: '图片大小不能超过 2MB' }, 400);
    }

    // 保存文件
    const ext = filePart.contentType === 'image/jpeg' ? 'jpg'
      : filePart.contentType === 'image/png' ? 'png' : 'webp';
    const filename = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    const uploadsDir = path.join(__dirname, 'data', 'images');
    fs.writeFileSync(path.join(uploadsDir, filename), filePart.data);

    return jsonResponse({
      success: true,
      data: { url: '/images/' + filename, filename: filePart.filename, size: filePart.data.length }
    });
  }

  // ===== 图片访问 =====
  if (method === 'GET' && route.type === 'image') {
    const imgPath = path.join(__dirname, 'data', 'images', route.filename);
    // 安全检查：防止路径穿越
    if (route.filename.includes('..') || route.filename.includes('/') || route.filename.includes('\\')) {
      return { status: 404, headers: {}, body: 'Not Found' };
    }
    try {
      const data = fs.readFileSync(imgPath);
      const ext = path.extname(route.filename).toLowerCase();
      const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
        : ext === '.png' ? 'image/png'
        : ext === '.webp' ? 'image/webp'
        : 'application/octet-stream';
      return {
        status: 200,
        headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=86400', 'Content-Length': String(data.length) },
        body: data
      };
    } catch (e) {
      return { status: 404, headers: {}, body: 'Not Found' };
    }
  }

  // ===== 404 =====
  return jsonResponse({ success: false, error: 'Not found' }, 404);
}

// ============================================
// 启动服务器
// ============================================

const server = http.createServer(async (req, res) => {
  try {
    const result = await handleRequest(req);
    // body 可能是字符串或 Buffer
    if (Buffer.isBuffer(result.body)) {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
        ...result.headers
      };
      res.writeHead(result.status, headers);
      res.end(result.body);
    } else {
      sendResponse(res, result);
    }
  } catch (e) {
    console.error('Server error:', e);
    sendResponse(res, jsonResponse({ success: false, error: '服务器内部错误' }, 500));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  👟 迎鑫童鞋 API 服务已启动（本地 Mock）`);
  console.log(`  ────────────────────────────────────`);
  console.log(`  API 地址:    http://localhost:${PORT}/api`);
  console.log(`  管理后台:    http://localhost:${PORT}/admin`);
  console.log(`  默认密码:    ${ADMIN_PASSWORD}`);
  console.log(`  ────────────────────────────────────`);
  console.log(`  提示: 部署 Cloudflare 后替换为 workers/src/index.js\n`);
});
