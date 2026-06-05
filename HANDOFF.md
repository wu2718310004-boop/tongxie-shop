# 迎鑫童鞋 — 项目交接说明

## 线上地址

| 用途 | 地址 |
|------|------|
| **顾客浏览** | https://yingxin-tongxie.pages.dev |
| **管理后台** | https://tongxie-shop-api.2718310004.workers.dev/admin |

两个地址互不影响。Worker 挂了顾客页仍能用静态数据；Pages 重新部署不影响后台。

---

## 架构一览

```
手机/微信打开
    │
    ├── https://yingxin-tongxie.pages.dev     ← Cloudflare Pages (顾客页)
    │       │
    │       └── fetch API ──→ https://tongxie-shop-api.xxx.workers.dev
    │                              │
    │                              ├── /api/products   ← D1 商品数据
    │                              ├── /api/upload     ← D1 base64 存图
    │                              ├── /admin          ← 管理后台页面
    │                              └── /images/*       ← 图片访问
    │
    └── 顾客页 API 不可用时，降级到 data/products.js 静态数据
```

---

## 日常操作

### 妈妈怎么管理商品

1. 手机打开 `https://tongxie-shop-api.2718310004.workers.dev/admin`
2. 输入管理密码 → 登录
3. 点 **＋ 添加商品** → 填表单
4. 上传图片：点"上传图片"→ 选相册或拍照
5. 勾选"首页推荐" = 出现在首页；"上架中" = 顾客可见
6. 点保存 → 顾客页立即可见

### 怎么改店铺信息

编辑 `data/shop.js` → 重新部署 Pages 即可。

---

## 密码管理

- 管理密码通过 Cloudflare Secret 存储：`npx wrangler secret put ADMIN_PASSWORD`
- 密码不在任何代码文件里
- 改密码需在 workers 目录执行命令

---

## 不要做的事

| 禁做 | 原因 |
|------|------|
| 重复运行 `seed.sql` | 会覆盖管理员已修改的商品 |
| 修改 `js/api.js` 的 `API_BASE` | 改了顾客页就读不到 API 数据 |
| 上传超过 10MB 的图片 | 压缩后仍超限会提示，换一张或拍近一点即可 |
| 上传非 JPG/PNG/WebP 图片 | 会被拒绝 |
| 在 wrangler.toml 写管理密码 | 密码应该用 secret 管理 |

---

## 需要修改配置时

### 改管理密码

```bash
cd C:\Users\1ok\tongxie-shop\workers
npx wrangler secret put ADMIN_PASSWORD
# 输入新密码
npx wrangler deploy   # 重新部署生效
```

### 改店铺名称/电话/地址

编辑 `C:\Users\1ok\tongxie-shop\data\shop.js`，然后重新部署 Pages。

### 修改首页推荐逻辑

不需要改代码。管理员在后台上传商品时勾选/取消"首页推荐"即可，顾客页自动更新。

---

## 如果出问题

| 问题 | 排查 |
|------|------|
| 顾客页白屏/乱码 | 检查 Pages 部署状态，重新上传 dist 目录 |
| 后台打不开 | 检查 Worker 是否在运行：`npx wrangler deploy` |
| 后台能打开但 API 500 | 检查 D1 数据库是否存在：`npx wrangler d1 list` |
| 上传图片失败 | 格式需为 JPG/PNG/WebP；若提示"图片太大"说明压缩后仍超限，换一张或拍近一点 |
| 顾客页看不到新商品 | 打开浏览器 DevTools → Network，看 API 请求是否成功 |

---

## 本地开发（如需调试）

```bash
# 前端（端口 3000）
npx serve C:\Users\1ok\tongxie-shop -p 3000

# 本地 API（端口 8787，密码 admin123，仅测试用）
node C:\Users\1ok\tongxie-shop\server\index.js
```

本地 `server/` 是零依赖 Node mock，和线上 Worker 的 API 路由完全一致，方便在不连 Worker 时本地测试。
