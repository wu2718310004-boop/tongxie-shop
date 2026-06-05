// ============================================
// 管理密码验证
// 对应本地 server/auth.js
// ============================================

function checkAuth(request, env) {
  const password = request.headers.get('X-Admin-Password') || '';
  return password === env.ADMIN_PASSWORD && password !== '';
}

export { checkAuth };
