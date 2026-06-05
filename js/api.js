// ============================================
// 前端 API 客户端 — API 优先 + 静态数据兜底
// 部署 Cloudflare 后只需修改 API_BASE
// ============================================

var API_BASE = '';

// 将 API 返回的图片路径补全为绝对路径
function fixImages(product) {
  if (!product || !product.images || !product.images.length) return product;
  product.images = product.images.map(function(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return API_BASE + url;
  });
  return product;
}

function fixAllImages(list) {
  list.forEach(function(p) { fixImages(p); });
  return list;
}

function getProducts(category) {
  return fetch(API_BASE + '/api/products' + (category && category !== '全部' ? '?category=' + encodeURIComponent(category) : ''))
    .then(function(r) {
      if (!r.ok) throw new Error('status ' + r.status);
      return r.json();
    })
    .then(function(json) {
      if (json.success) return fixAllImages(json.data);
      throw new Error(json.error);
    })
    .catch(function(e) {
      console.warn('[api] 无法连接 API，使用静态数据:', e.message);
      var list = window.PRODUCTS || [];
      if (category && category !== '全部') {
        list = list.filter(function(p) { return p.category === category; });
      }
      list = list.slice().sort(function(a, b) { return (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0); });
      return list;
    });
}

function getProduct(id) {
  return fetch(API_BASE + '/api/products/' + id)
    .then(function(r) {
      if (!r.ok) throw new Error('status ' + r.status);
      return r.json();
    })
    .then(function(json) {
      if (json.success) return fixImages(json.data);
      throw new Error(json.error);
    })
    .catch(function(e) {
      console.warn('[api] 无法连接 API，使用静态数据:', e.message);
      return (window.PRODUCTS || []).find(function(p) { return p.id === id; }) || null;
    });
}
