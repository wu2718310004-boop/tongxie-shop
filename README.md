# 迎鑫童鞋 — 移动端童鞋商品展示页

> **当前状态：线上正式版（v2）**
>
> 顾客页面 + 管理后台已全部上线，妈妈可通过固定网址管理商品。

---

## 线上地址

| 用途 | 地址 | 说明 |
|------|------|------|
| 顾客页面 | `https://yingxin-tongxie.pages.dev` | 手机/电脑/微信打开，浏览商品 |
| 管理后台 | `https://tongxie-shop-api.2718310004.workers.dev/admin` | 管理员登录，添加/编辑/下架商品 |
| 商品 API | `https://tongxie-shop-api.2718310004.workers.dev/api/products` | 后端接口（前端自动调用） |

---

## 当前架构

```
Cloudflare Pages                          Cloudflare Workers
yingxin-tongxie.pages.dev                 tongxie-shop-api.xxx.workers.dev

index.html ─┐                            /api/products ── D1 (商品SQLite)
list.html   ├── fetch ─────────────────→ /api/auth/login    ↓
detail.html ┘    API优先 / 静态兜底       /api/upload      base64存图
contact.html                             /admin           管理后台
                                         /images/:file   图片访问
```

| 服务 | 用途 | 免费额度 |
|------|------|---------|
| Cloudflare Pages | 托管顾客 HTML/CSS/JS | 无限带宽 |
| Cloudflare Workers | API 路由 + admin 页面 | 10 万请求/天 |
| Cloudflare D1 | 商品数据 + 图片存储 | 5GB / 500 万读+10 万写/天 |
| R2 对象存储 | 暂未使用 | — |

---

## 日常操作

### 妈妈管理商品

1. 手机浏览器打开 `https://tongxie-shop-api.2718310004.workers.dev/admin`
2. 输入管理密码，点登录
3. 点 **＋ 添加商品**，填写名称、分类、价格、尺码等
4. 上架商品勾选"上架中"，下架则取消勾选
5. 保存后，顾客页面自动显示最新商品

### 顾客浏览商品

打开 `https://yingxin-tongxie.pages.dev`：
- 首页：分类入口 + 精选推荐（管理员勾选"首页推荐"的商品）
- 全部商品：分类筛选查看
- 点商品卡片进入详情页：尺码、颜色、材质、描述
- 联系我们：一键拨号、复制微信号、导航到店

### 数据流说明

顾客打开页面时：
1. 优先从 Worker API 获取实时商品数据
2. 如果 API 不可用（网络故障、Worker 暂停等），自动降级到 `data/products.js` 静态数据
3. 顾客不受影响，始终能看到商品

---

## 重要注意事项

| 事项 | 说明 |
|------|------|
| **图片上传** | 管理后台自动压缩手机照片（最长边 1200px，目标 ≤500KB），无需手动处理。如果压缩后仍超限，会提示换一张或拍近一点 |
| **图片格式** | 仅支持 JPG / PNG / WebP |
| **不要重复运行 seed.sql** | `seed.sql` 只在首次初始化时运行一次，重复运行会覆盖管理员修改 |
| **管理密码** | 通过 `wrangler secret put ADMIN_PASSWORD` 设置，不在任何文件里写明文 |
| **不要改 js/api.js 的 API_BASE** | 那一行指向 Worker 地址，改了顾客页就读不到数据 |

---

## 费用

- **0 元/月，不绑卡**。Workers + D1 免费额度远超本店用量。
- 图片目前存 D1 base64（免费）。管理后台上传时自动压缩，妈妈不需要懂图片大小。如果以后需要更高清大图，可以接 R2（需支付宝验证，同样免费 10GB）。

---

## 本地开发

线上版本已部署，本地开发仅用于调试。需要 Node.js：

```bash
# 终端 1：前端
npx serve . -p 3000

# 终端 2：本地 API
node server/index.js     # 端口 8787，默认密码 admin123
```

注意：本地 `server/` 是零依赖 mock，仅供开发测试，线上用的是 `workers/`。

---

## 项目文件结构

```
tongxie-shop/
│
├── index.html              # 顾客首页
├── list.html               # 商品列表
├── detail.html             # 商品详情
├── contact.html            # 联系店主
├── css/style.css           # 全局样式
├── js/api.js               # 前端 API 客户端（★ 线上版，API_BASE 指向 Worker）
│
├── data/
│   ├── shop.js             # 店铺配置
│   └── products.js         # 静态商品数据（API 不可用时兜底）
│
├── admin/
│   └── index.html          # 管理后台 SPA（由 Worker 打包部署）
│
├── workers/                # ★ Cloudflare Workers 线上后台
│   ├── wrangler.toml       # Worker 配置（D1 绑定）
│   ├── package.json
│   └── src/
│       ├── index.js        # Worker 主路由
│       ├── db.js           # D1 数据库查询
│       ├── auth.js         # 密码验证
│       ├── upload.js       # 图片上传/返回
│       └── admin-html.js   # 管理后台（从 admin/index.html 生成）
│
├── server/                 # 本地开发 API（零依赖 Node mock）
│   ├── index.js
│   ├── db.js
│   ├── auth.js
│   └── seed.js
│
├── schema.sql              # D1 建表语句
├── seed.sql                # 初始 8 商品（仅初始化时用一次）
├── scripts/
│   └── build-admin.js      # 构建脚本：admin/index.html → workers/src/admin-html.js
│
└── README.md
```

---

## 修改店铺信息

打开 **`data/shop.js`**，修改后重新部署 Pages 即可生效：

| 字段 | 说明 |
|------|------|
| `name` | 店铺名称 |
| `phone` | 联系电话 |
| `wechat` | 微信号 |
| `address` | 店铺地址 |
| `businessHours` | 营业时间 |
| `slogan` | 店铺标语 |
| `services` | 服务说明 |
