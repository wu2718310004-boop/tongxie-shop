// ============================================
// D1 数据库查询封装
// 对应本地 server/db.js 的接口
// ============================================

// 将 D1 行（snake_case）转为 JS 对象（camelCase + JSON 数组解析）
function rowToProduct(row) {
  if (!row) return null;
  // D1 返回的字段名保持原样，不需转换
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    style: row.style,
    price: row.price,
    sizes: safeParseJSON(row.sizes, []),
    ageRange: row.age_range || '',
    colors: safeParseJSON(row.colors, []),
    material: row.material || '',
    images: safeParseJSON(row.images, []),
    description: row.description || '',
    featured: !!row.featured,
    inStock: !!row.in_stock,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function safeParseJSON(str, fallback) {
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? val : fallback;
  } catch (e) {
    return fallback;
  }
}

// 将 JS 对象转为 D1 字段（camelCase → snake_case，JSON 序列化数组）
function productToRow(p) {
  return {
    name: p.name || '',
    category: p.category || '男童',
    style: p.style || '运动鞋',
    price: Number(p.price) || 0,
    sizes: JSON.stringify(p.sizes || []),
    age_range: p.ageRange || '',
    colors: JSON.stringify(p.colors || []),
    material: p.material || '',
    images: JSON.stringify(p.images || []),
    description: p.description || '',
    featured: p.featured ? 1 : 0,
    in_stock: p.inStock !== false ? 1 : 0,
    updated_at: new Date().toISOString().split('T')[0]
  };
}

// ============================================
// 商品 CRUD
// ============================================

async function getAllProducts(env, category) {
  let sql = 'SELECT * FROM products';
  let params = [];
  if (category && category !== '全部') {
    sql += ' WHERE category = ?1';
    params.push(category);
  }
  sql += ' ORDER BY in_stock DESC, id DESC';
  const result = await env.DB.prepare(sql).bind(...params).all();
  return result.results.map(rowToProduct);
}

async function getProductById(env, id) {
  const result = await env.DB.prepare('SELECT * FROM products WHERE id = ?1')
    .bind(id).first();
  return rowToProduct(result || null);
}

async function createProduct(env, data) {
  const row = productToRow(data);
  const now = new Date().toISOString().split('T')[0];
  const result = await env.DB.prepare(
    `INSERT INTO products (name, category, style, price, sizes, age_range, colors, material, images, description, featured, in_stock, created_at, updated_at)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)`
  ).bind(
    row.name, row.category, row.style, row.price,
    row.sizes, row.age_range, row.colors, row.material,
    row.images, row.description, row.featured, row.in_stock,
    now, now
  ).run();
  return getProductById(env, result.meta.last_row_id);
}

async function updateProduct(env, id, data) {
  const existing = await getProductById(env, id);
  if (!existing) return null;

  // 只更新提供的字段
  const merged = { ...existing, ...data };
  const row = productToRow(merged);
  await env.DB.prepare(
    `UPDATE products SET
       name=?1, category=?2, style=?3, price=?4, sizes=?5, age_range=?6,
       colors=?7, material=?8, images=?9, description=?10, featured=?11,
       in_stock=?12, updated_at=?13
     WHERE id=?14`
  ).bind(
    row.name, row.category, row.style, row.price,
    row.sizes, row.age_range, row.colors, row.material,
    row.images, row.description, row.featured, row.in_stock,
    row.updated_at, id
  ).run();
  return getProductById(env, id);
}

async function deleteProduct(env, id) {
  const existing = await getProductById(env, id);
  if (!existing) return false;
  await env.DB.prepare('DELETE FROM products WHERE id = ?1').bind(id).run();
  return true;
}

// ============================================
// 图片存储 (D1 base64)
// ============================================

async function saveImage(env, filename, originalName, mimeType, base64Data, size) {
  const result = await env.DB.prepare(
    `INSERT OR REPLACE INTO images (filename, original_name, mime_type, data, size)
     VALUES (?1, ?2, ?3, ?4, ?5)`
  ).bind(filename, originalName, mimeType, base64Data, size).run();
  return result.meta.last_row_id;
}

async function getImage(env, filename) {
  const result = await env.DB.prepare(
    'SELECT filename, mime_type, data, size FROM images WHERE filename = ?1'
  ).bind(filename).first();
  return result || null;
}

export {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  saveImage, getImage
};
