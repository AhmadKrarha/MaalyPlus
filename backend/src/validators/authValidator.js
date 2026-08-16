const { z } = require('zod');

const loginSchema = z.object({
  email: z.string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string()
    .min(1, 'كلمة المرور مطلوبة')
});

const registerSchema = z.object({
  email: z.string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  full_name: z.string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً')
});

function validateLogin(req, res, next) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صالحة',
        details: errors
      });
    }
    req.validatedData = result.data;
    next();
  } catch (err) {
    next(err);
  }
}

function validateRegister(req, res, next) {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صالحة',
        details: errors
      });
    }
    req.validatedData = result.data;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { validateLogin, validateRegister };
