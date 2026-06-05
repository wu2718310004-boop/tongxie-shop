// ============================================
// 将 data/products.js 的静态数据导入本地 JSON 数据库
// 每次运行会完全覆盖 server/data/products.json
// ============================================

const fs = require('fs');
const path = require('path');

// 读取静态 products.js 并提取 PRODUCTS 数组
const productsJsPath = path.join(__dirname, '..', 'data', 'products.js');
const content = fs.readFileSync(productsJsPath, 'utf-8');

// 简单提取：匹配 const PRODUCTS = [...];
const match = content.match(/const PRODUCTS = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('无法从 products.js 中提取 PRODUCTS 数组');
  process.exit(1);
}

const products = eval('(' + match[1] + ')');

// 添加 updatedAt 字段（静态数据没有）
const now = new Date().toISOString().split('T')[0];
const enriched = products.map(p => ({ ...p, updatedAt: p.updatedAt || p.createdAt || now }));

const outPath = path.join(__dirname, 'data', 'products.json');
fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2), 'utf-8');
console.log(`已从 products.js 导入 ${enriched.length} 个商品到 server/data/products.json`);
