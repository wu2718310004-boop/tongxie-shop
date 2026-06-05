-- 迎鑫童鞋 — D1 数据库表结构
-- 执行：npx wrangler d1 execute tongxie-shop-db --file=schema.sql

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL DEFAULT '男童',
  style       TEXT    NOT NULL DEFAULT '运动鞋',
  price       REAL    NOT NULL DEFAULT 0,
  sizes       TEXT    NOT NULL DEFAULT '[]',
  age_range   TEXT    NOT NULL DEFAULT '',
  colors      TEXT    NOT NULL DEFAULT '[]',
  material    TEXT    NOT NULL DEFAULT '',
  images      TEXT    NOT NULL DEFAULT '[]',
  description TEXT    NOT NULL DEFAULT '',
  featured    INTEGER NOT NULL DEFAULT 0,
  in_stock    INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS images (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  filename      TEXT    NOT NULL UNIQUE,
  original_name TEXT    NOT NULL DEFAULT '',
  mime_type     TEXT    NOT NULL DEFAULT 'image/jpeg',
  data          TEXT    NOT NULL,
  size          INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
