// ============================================
// 迎鑫童鞋 — Cloudflare Workers 线上后台
// API 路由与 server/index.js 完全一致，前端和管理后台无需改动
// ============================================

import adminHTML from './admin-html.js';
import { checkAuth } from './auth.js';
import { handleUpload, serveImage } from './upload.js';
import {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct
} from './db.js';

const ALL_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...ALL_CORS }
  });
}

async function parseJSON(request) {
  try {
    return await request.json();
  } catch (e) {
    return {};
  }
}

// 路径解析
function parseRoute(pathname) {
  const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
  if (productMatch) return { type: 'productById', id: parseInt(productMatch[1]) };

  const imageMatch = pathname.match(/^\/images\/([^/]+)$/);
  if (imageMatch) return { type: 'image', filename: imageMatch[1] };

  return { type: pathname };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();
    const route = parseRoute(pathname);

    try {
      // CORS 预检
      if (method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: ALL_CORS });
      }

      // ─── 管理后台页面 ───
      if (method === 'GET' && pathname === '/admin') {
        return new Response(adminHTML, {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...ALL_CORS }
        });
      }

      // ─── 登录验证 ───
      if (method === 'POST' && pathname === '/api/auth/login') {
        const body = await parseJSON(request);
        if (body.password && body.password === env.ADMIN_PASSWORD) {
          return json({ success: true, data: { ok: true } });
        }
        return json({ success: false, error: '密码错误' }, 401);
      }

      // ─── 图片上传 ───
      if (method === 'POST' && pathname === '/api/upload') {
        return handleUpload(request, env);
      }

      // ─── 图片访问 ───
      if (method === 'GET' && route.type === 'image') {
        return serveImage(env, pathname);
      }

      // ─── 商品列表 ───
      if (method === 'GET' && pathname === '/api/products') {
        const category = url.searchParams.get('category');
        const products = await getAllProducts(env, category);
        return json({ success: true, data: products });
      }

      // ─── 单个商品 ───
      if (method === 'GET' && route.type === 'productById') {
        const product = await getProductById(env, route.id);
        if (!product) return json({ success: false, error: '商品不存在' }, 404);
        return json({ success: true, data: product });
      }

      // ─── 添加商品 ───
      if (method === 'POST' && pathname === '/api/products') {
        if (!checkAuth(request, env)) {
          return json({ success: false, error: '需要管理员密码' }, 401);
        }
        const body = await parseJSON(request);
        if (!body.name || !body.category) {
          return json({ success: false, error: '商品名称和分类不能为空' }, 400);
        }
        const product = await createProduct(env, body);
        return json({ success: true, data: product }, 201);
      }

      // ─── 更新商品 ───
      if (method === 'PUT' && route.type === 'productById') {
        if (!checkAuth(request, env)) {
          return json({ success: false, error: '需要管理员密码' }, 401);
        }
        const body = await parseJSON(request);
        const product = await updateProduct(env, route.id, body);
        if (!product) return json({ success: false, error: '商品不存在' }, 404);
        return json({ success: true, data: product });
      }

      // ─── 删除商品 ───
      if (method === 'DELETE' && route.type === 'productById') {
        if (!checkAuth(request, env)) {
          return json({ success: false, error: '需要管理员密码' }, 401);
        }
        const ok = await deleteProduct(env, route.id);
        if (!ok) return json({ success: false, error: '商品不存在' }, 404);
        return json({ success: true, data: { deleted: true } });
      }

      // ─── 404 ───
      return json({ success: false, error: 'Not found' }, 404);

    } catch (e) {
      console.error('Worker error:', e.message);
      return json({ success: false, error: '服务器内部错误' }, 500);
    }
  }
};
