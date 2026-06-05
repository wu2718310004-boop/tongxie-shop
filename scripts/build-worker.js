// ============================================
// 构建脚本：生成单文件 _worker.js（Pages Advanced Mode）
// 用法：node scripts/build-worker.js
// 输出：_worker.js（项目根目录）
// ============================================

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// 1. Read admin HTML
const adminHtmlSrc = fs.readFileSync(path.join(ROOT, 'workers', 'src', 'admin-html.js'), 'utf-8');
const htmlMatch = adminHtmlSrc.match(/`([\s\S]*)`/);
const adminHTML = htmlMatch ? htmlMatch[1] : '';
console.log('Admin HTML: ' + adminHTML.length + ' bytes');

// 2. Read source modules
const dbCode = fs.readFileSync(path.join(ROOT, 'workers', 'src', 'db.js'), 'utf-8');
const authCode = fs.readFileSync(path.join(ROOT, 'workers', 'src', 'auth.js'), 'utf-8');
const uploadCode = fs.readFileSync(path.join(ROOT, 'workers', 'src', 'upload.js'), 'utf-8');

// Strip import/export statements
const dbClean = dbCode.replace(/^export \{[\s\S]*?\};$/m, '// db functions bundled inline');
const authClean = authCode.replace(/^export \{ checkAuth \};$/m, '// checkAuth bundled inline');
let uploadClean = uploadCode
  .replace(/import.*from.*;/g, '// bundled inline')
  .replace(/^export \{[\s\S]*?\};$/m, '// upload functions bundled inline');

// 3. Assemble the worker
const worker = `// ============================================
// 迎鑫童鞋 — Pages Advanced Mode Worker
// 路由: /api/* /admin /images/* → Worker 处理
//       其他请求 → env.ASSETS.fetch() → Pages 静态文件
// ============================================

const ADMIN_HTML = \`${adminHTML}\`;

// ============================================
// D1 数据库查询
// ============================================

${dbClean}

// ============================================
// 管理密码验证
// ============================================

${authClean}

// ============================================
// 图片上传 + 返回
// ============================================

${uploadClean}

// ============================================
// API 路由
// ============================================

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

async function parseJSON(request) {
  try { return await request.json(); } catch (e) { return {}; }
}

function parseRoute(pathname) {
  var m = pathname.match(/^\\/api\\/products\\/(\\d+)$/);
  if (m) return { type: 'productById', id: parseInt(m[1]) };
  m = pathname.match(/^\\/images\\/([^/]+)$/);
  if (m) return { type: 'image', filename: m[1] };
  return { type: pathname };
}

async function handleAPI(request, env, url, pathname) {
  var method = request.method.toUpperCase();
  var route = parseRoute(pathname);

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
      }
    });
  }

  if (method === 'GET' && pathname === '/admin') {
    return new Response(ADMIN_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    var body = await parseJSON(request);
    if (body.password && body.password === env.ADMIN_PASSWORD) return json({ success: true, data: { ok: true } });
    return json({ success: false, error: '密码错误' }, 401);
  }

  if (method === 'POST' && pathname === '/api/upload') { return handleUpload(request, env); }
  if (method === 'GET' && route.type === 'image') { return serveImage(env, pathname); }

  if (method === 'GET' && pathname === '/api/products') {
    var category = url.searchParams.get('category');
    return json({ success: true, data: await getAllProducts(env, category) });
  }

  if (method === 'GET' && route.type === 'productById') {
    var product = await getProductById(env, route.id);
    if (!product) return json({ success: false, error: '商品不存在' }, 404);
    return json({ success: true, data: product });
  }

  if (method === 'POST' && pathname === '/api/products') {
    if (!checkAuth(request, env)) return json({ success: false, error: '需要管理员密码' }, 401);
    var data = await parseJSON(request);
    if (!data.name || !data.category) return json({ success: false, error: '商品名称和分类不能为空' }, 400);
    return json({ success: true, data: await createProduct(env, data) }, 201);
  }

  if (method === 'PUT' && route.type === 'productById') {
    if (!checkAuth(request, env)) return json({ success: false, error: '需要管理员密码' }, 401);
    var updateData = await parseJSON(request);
    var updated = await updateProduct(env, route.id, updateData);
    if (!updated) return json({ success: false, error: '商品不存在' }, 404);
    return json({ success: true, data: updated });
  }

  if (method === 'DELETE' && route.type === 'productById') {
    if (!checkAuth(request, env)) return json({ success: false, error: '需要管理员密码' }, 401);
    var deleted = await deleteProduct(env, route.id);
    if (!deleted) return json({ success: false, error: '商品不存在' }, 404);
    return json({ success: true, data: { deleted: true } });
  }

  return json({ success: false, error: 'Not found' }, 404);
}

// ============================================
// Pages Advanced Mode 入口
// ============================================

export default {
  async fetch(request, env, ctx) {
    var url = new URL(request.url);
    var pathname = url.pathname;

    if (pathname === '/admin' || pathname.startsWith('/api/') || pathname.startsWith('/images/')) {
      try {
        return await handleAPI(request, env, url, pathname);
      } catch (e) {
        return json({ success: false, error: '服务器内部错误' }, 500);
      }
    }

    // 其他所有请求 → Pages 静态文件
    return env.ASSETS.fetch(request);
  }
};
`;

const outPath = path.join(ROOT, '_worker.js');
fs.writeFileSync(outPath, worker, 'utf-8');
console.log('Generated: _worker.js (' + worker.length + ' bytes)');
