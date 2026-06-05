// ============================================
// 管理密码验证（本地 mock）
// 部署时替换为 workers/src/auth.js（env.ADMIN_PASSWORD）
// ============================================

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function checkAuth(req) {
  const password = req.headers['x-admin-password'];
  return password === ADMIN_PASSWORD;
}

module.exports = { checkAuth, ADMIN_PASSWORD };
