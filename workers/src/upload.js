// ============================================
// 图片上传 + 返回
// 存 D1 base64（后续可替换为 R2）
// ============================================

import { checkAuth } from './auth.js';
import { saveImage, getImage } from './db.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 500 * 1024; // 500KB（D1 cell ~1MB，base64膨胀后约685KB）

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleUpload(request, env) {
  if (!checkAuth(request, env)) {
    return json({ success: false, error: '需要管理员密码' }, 401);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return json({ success: false, error: '未找到上传文件' }, 400);
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return json({ success: false, error: '仅支持 JPG/PNG/WebP 格式' }, 400);
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return json({
        success: false,
        error: '图片太大（最大 500KB），请压缩或重拍。可以截图用微信发给自己，微信会自动压缩。'
      }, 400);
    }

    // 读取文件内容并转 base64
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 手动 base64 编码（避免 btoa 的 stack overflow 问题）
    let base64 = '';
    const chunk = 8192;
    for (let i = 0; i < uint8Array.length; i += chunk) {
      const slice = uint8Array.subarray(i, i + chunk);
      base64 += String.fromCharCode.apply(null, slice);
    }
    base64 = btoa(base64);

    // 生成文件名
    const ext = file.type === 'image/jpeg' ? 'jpg'
      : file.type === 'image/png' ? 'png' : 'webp';
    const filename = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;

    await saveImage(env, filename, file.name, file.type, base64, file.size);

    return json({
      success: true,
      data: {
        url: '/images/' + filename,
        filename: file.name,
        size: file.size
      }
    });

  } catch (e) {
    return json({ success: false, error: '上传失败：' + (e.message || '未知错误') }, 500);
  }
}

async function serveImage(env, pathname) {
  const filename = pathname.replace('/images/', '');
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const img = await getImage(env, filename);
    if (!img) return new Response('Not Found', { status: 404 });

    const binary = Uint8Array.from(atob(img.data), c => c.charCodeAt(0));
    return new Response(binary, {
      headers: {
        'Content-Type': img.mime_type,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': String(binary.length),
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    return new Response('Not Found', { status: 404 });
  }
}

export { handleUpload, serveImage };
