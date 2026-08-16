const { verifyToken, findUserById } = require('../services/authService');

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header (Bearer <token>),
 * verifies it, and attaches the user to req.user.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرّح — يرجى تسجيل الدخول'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = findUserById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'جلسة غير صالحة — يرجى تسجيل الدخول مجدداً'
      });
    }

    req.user = { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً'
    });
  }
}

/**
 * Role-based authorization middleware.
 * Must be used AFTER requireAuth.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'ليس لديك صلاحية للوصول إلى هذا المورد'
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
