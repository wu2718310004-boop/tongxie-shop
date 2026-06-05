# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

迎鑫童鞋 (Yingxin Tongxie) — mobile-first children's shoe e-commerce site. Serverless architecture: Cloudflare Pages (static frontend) + Cloudflare Workers (API/backend) + D1 (SQLite database). Zero hosting cost under free tier limits.

## Live URLs

| Purpose | URL |
|---------|-----|
| Customer pages | `https://yingxin-tongxie.pages.dev` |
| Admin panel | `https://tongxie-shop-api.2718310004.workers.dev/admin` |
| Product API | `https://tongxie-shop-api.2718310004.workers.dev/api/products` |

## Architecture

```
Cloudflare Pages (yingxin-tongxie.pages.dev)
  └── index.html / list.html / detail.html / contact.html
        │
        └── fetch API ──→ Cloudflare Workers (tongxie-shop-api)
                              ├── /api/products       → D1 products table
                              ├── /api/auth/login     → password auth
                              ├── /api/upload         → base64 image to D1 images table
                              ├── /admin              → admin SPA
                              └── /images/:file       → serve images from D1
```

**Degradation pattern**: Frontend fetches API first; on failure, falls back to `data/products.js` static data. Customer pages never break.

**Image storage**: Uploaded images are auto-compressed (max 1200px long edge, target ≤500KB) then stored as base64 in D1 `images` table. No external blob storage.

## Directory Map

```
├── *.html              # Customer-facing pages (pure HTML, no framework)
├── css/style.css       # Global styles
├── js/api.js           # API client with static fallback (★ do NOT change API_BASE)
├── data/
│   ├── shop.js         # Shop config: name, phone, wechat, address
│   └── products.js     # Static product fallback data
├── admin/index.html    # Admin SPA (source of truth for admin UI)
├── workers/            # ★ Production API (deployed to Cloudflare Workers)
│   ├── wrangler.toml   # Worker config with D1 binding
│   └── src/
│       ├── index.js    # Main router (Hono-like manual routing)
│       ├── db.js       # D1 queries
│       ├── auth.js     # Session-based auth (password via wrangler secret)
│       ├── upload.js   # Image upload/compression
│       └── admin-html.js  # Generated: admin/index.html compiled to JS string
├── server/             # Local dev mock API (zero dependencies, port 8787)
├── schema.sql          # D1 table definitions
├── seed.sql            # Initial 8 products (★ run ONCE only — overwrites admin changes)
├── scripts/
│   ├── build-admin.js  # Compiles admin/index.html → workers/src/admin-html.js
│   ├── build-worker.js # Worker build helper
│   └── create-ppt.js   # PPT generation (pptxgenjs)
└── _worker.js          # Root-level worker entry (Pages Functions fallback)
```

## Commands

```bash
# Local dev — frontend (port 3000)
npx serve . -p 3000

# Local dev — mock API (port 8787, default password: admin123)
node server/index.js

# Deploy Worker (from workers/ directory)
cd workers && npx wrangler deploy

# Set/change admin password
cd workers && npx wrangler secret put ADMIN_PASSWORD

# Initialize D1 database (schema only, first time)
npx wrangler d1 execute tongxie-shop-db --file=schema.sql

# Seed initial products (first time only!)
npx wrangler d1 execute tongxie-shop-db --file=seed.sql

# Rebuild admin HTML after editing admin/index.html
node scripts/build-admin.js

# Generate PPT
node scripts/create-ppt.js
```

## Critical Constraints

- **Never rerun `seed.sql`** — it overwrites all admin-edited products in D1
- **Never change `API_BASE` in `js/api.js`** — it points to the live Worker; changing it breaks all customer pages
- **Never write passwords in code** — admin password lives in `wrangler secret put ADMIN_PASSWORD`, never in any file
- **After editing `admin/index.html`**, run `node scripts/build-admin.js` and `cd workers && npx wrangler deploy` — the Worker serves the admin page from a compiled JS string
- **Images**: only JPG/PNG/WebP accepted; upload compression auto-handles size limits

## Database

D1 database `tongxie-shop-db` with two tables:

- **`products`** — id, name, category, style, price, sizes (JSON array string), age_range, colors (JSON array string), material, images (JSON array string), description, featured (0/1), in_stock (0/1), created_at, updated_at
- **`images`** — id, filename (unique), original_name, mime_type, data (base64), size, created_at

`data/products.js` contains the static fallback mirroring the same product structure.
