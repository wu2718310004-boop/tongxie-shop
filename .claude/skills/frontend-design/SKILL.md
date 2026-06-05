---
name: frontend-design
description: 迎鑫童鞋项目前端设计指南。移动优先的童鞋商城 UI，纯 HTML/CSS/JS，无框架。当需要修改页面样式、组件、布局，或添加新页面时使用。
---

# 迎鑫童鞋 · 前端设计规范

## 设计原则

- **移动优先**：所有页面以手机屏幕（375px）为基准设计，PC 端居中展示（max-width 500px）
- **纯 HTML/CSS/JS**：无 React/Vue 框架，无构建工具，直接编辑源文件
- **微信场景适配**：支持微信内置浏览器、微信分享卡片
- **弱网兜底**：所有 UI 必须在 API 不可用时正常展示（静态数据降级）

## 技术栈

| 层 | 方案 |
|----|------|
| 样式 | 纯 CSS（`css/style.css`），CSS 变量集中管理颜色和尺寸 |
| 图标 | Emoji + Unicode 符号，无图标库依赖 |
| 动效 | CSS transition/animation，避免 JS 动画 |
| 图片 | 产品图通过 API 加载（base64 from D1），UI 装饰无外部图片 |

## 文件职责

```
├── index.html          # 首页：分类入口卡片 + 精选推荐网格
├── list.html           # 商品列表：分类筛选横向滚动 + 商品卡片流式布局
├── detail.html         # 商品详情：图片轮播 + 尺码/颜色选择 + 底部固定操作栏
├── contact.html        # 联系店主：一键拨号 + 复制微信 + 地图导航 + 服务说明
├── admin/index.html    # 管理后台 SPA：登录 + 商品 CRUD 表单
│
├── css/style.css       # 全局样式（所有页面共享）
├── js/api.js           # API 客户端（api() 函数，自动降级）
└── data/shop.js        # 店铺配置（名称、电话、地址等，所有页面引用）
```

## CSS 变量体系

所有颜色和尺寸通过 CSS 变量定义，便于主题切换：

- `--primary`: 品牌主色（暖橙色系）
- `--text-primary` / `--text-secondary` / `--text-muted`: 文字层级
- `--bg-primary` / `--bg-secondary`: 背景层级
- `--radius-sm` / `--radius-md` / `--radius-lg`: 圆角体系
- `--shadow-card`: 卡片阴影

## 组件模式

### 商品卡片
- 图片区域固定宽高比（1:1 或 4:3）
- 价格突出显示（large + bold + primary color）
- 缺货商品降低透明度 + "已下架"标签
- 推荐商品带 "精选" 角标

### 分类筛选
- 横向滚动标签（`overflow-x: auto; white-space: nowrap`）
- 选中态：实色背景 + 白色文字
- 未选中：浅灰背景 + 灰色文字

### 底部固定栏
- `position: sticky; bottom: 0`
- 半透明背景 + 毛玻璃效果（`backdrop-filter: blur()`）
- 包含 CTA 按钮和联系入口

## 页面交互规范

- 所有可点击区域最小 44×44px（移动端触控标准）
- 按钮点击态：`transform: scale(0.96)` + 透明度降低
- 页面切换使用简单跳转，无 SPA 路由
- 表单输入使用原生控件，无自定义组件

## 不要做的事

- **不要引入 JS/CSS 框架** — 保持零依赖，项目不需要 React/Vue/Bootstrap/Tailwind
- **不要使用外部图标库** — 用 Emoji 和 Unicode 就够了
- **不要修改 API_BASE**（`js/api.js`）— 改了顾客页面就读不到数据
- **不要新增页面级别的 CSS** — 所有样式集中放在 `css/style.css`
- **不要使用 Web 字体** — 用系统默认字体栈，减少加载时间
