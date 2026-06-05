// ============================================
// 本地 JSON 文件数据库（模拟 Cloudflare D1）
// 部署时替换为 workers/src/db.js（D1 SQL）
// ============================================

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'products.json');

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeDB(products) {
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

function getAllProducts(category) {
  let list = readDB();
  if (category && category !== '全部') {
    list = list.filter(p => p.category === category);
  }
  list.sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));
  return list;
}

function getProductById(id) {
  const list = readDB();
  return list.find(p => p.id === id) || null;
}

function createProduct(data) {
  const list = readDB();
  const maxId = list.reduce((max, p) => Math.max(max, p.id), 0);
  const now = new Date().toISOString().split('T')[0];
  const product = {
    id: maxId + 1,
    name: data.name || '',
    category: data.category || '男童',
    style: data.style || '运动鞋',
    price: Number(data.price) || 0,
    sizes: data.sizes || [],
    ageRange: data.ageRange || '',
    colors: data.colors || [],
    material: data.material || '',
    images: data.images || [],
    description: data.description || '',
    featured: Boolean(data.featured),
    inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
    createdAt: now,
    updatedAt: now
  };
  list.push(product);
  writeDB(list);
  return product;
}

function updateProduct(id, data) {
  const list = readDB();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString().split('T')[0];
  const existing = list[idx];
  list[idx] = {
    ...existing,
    name: data.name !== undefined ? data.name : existing.name,
    category: data.category !== undefined ? data.category : existing.category,
    style: data.style !== undefined ? data.style : existing.style,
    price: data.price !== undefined ? Number(data.price) : existing.price,
    sizes: data.sizes !== undefined ? data.sizes : existing.sizes,
    ageRange: data.ageRange !== undefined ? data.ageRange : existing.ageRange,
    colors: data.colors !== undefined ? data.colors : existing.colors,
    material: data.material !== undefined ? data.material : existing.material,
    images: data.images !== undefined ? data.images : existing.images,
    description: data.description !== undefined ? data.description : existing.description,
    featured: data.featured !== undefined ? Boolean(data.featured) : existing.featured,
    inStock: data.inStock !== undefined ? Boolean(data.inStock) : existing.inStock,
    updatedAt: now
  };
  writeDB(list);
  return list[idx];
}

function deleteProduct(id) {
  const list = readDB();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  writeDB(list);
  return true;
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
