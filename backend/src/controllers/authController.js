const authService = require('../services/authService');

/**
 * POST /api/auth/login
 */
async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.validatedData || req.body;
    const result = authService.authenticateUser(email, password);

    if (result.error) {
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/register
 */
async function registerHandler(req, res, next) {
  try {
    const { email, password, full_name } = req.validatedData || req.body;
    const result = authService.createUser({ email, password, full_name, role: 'user' });

    if (result.error) {
      return res.status(409).json({
        success: false,
        error: result.error
      });
    }

    // Auto-login after registration
    const loginResult = authService.authenticateUser(email, password);

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        user: loginResult.user,
        token: loginResult.token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me — returns the current user's profile
 */
async function meHandler(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { loginHandler, registerHandler, meHandler };
