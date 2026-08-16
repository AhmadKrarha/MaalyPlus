const { z } = require('zod');

/**
 * Normalizes Eastern Arabic numerals (٠-٩) and Extended Arabic-Indic numerals (۰-۹)
 * to standard ASCII digits (0-9). Also handles Arabic decimal separator (٫) and thousands separator (٬).
 * @param {string|any} str
 * @returns {string|any}
 */
function normalizeArabicNumerals(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x0030))
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 0x0030))
    .replace(/٫/g, '.')
    .replace(/٬/g, '');
}

// Helpers to normalize boolean inputs from HTML forms or JSON
function normalizeBoolean(val) {
  if (typeof val === 'string') {
    val = normalizeArabicNumerals(val.trim());
  }
  if (val === true || val === 1 || val === '1' || val === 'true' || val === 'نعم' || val === 'on' || val === 'نعم، أوافق') {
    return 1;
  }
  return 0;
}

// Helpers to coerce numeric strings
function coerceNumber(val) {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'string') {
    val = normalizeArabicNumerals(val.trim());
  }
  const num = Number(val);
  return isNaN(num) ? val : num;
}

// Jordanian/standard governorates list
const GOVERNORATES = [
  'عمّان', 'إربد', 'الزرقاء', 'البلقاء', 'المفرق', 'جرش',
  'عجلون', 'مادبا', 'الكرك', 'الطفيلة', 'معان', 'العقبة',
  'Amman', 'Irbid', 'Zarqa', 'Balqa', 'Mafraq', 'Jerash',
  'Ajloun', 'Madaba', 'Karak', 'Tafilah', 'Maan', 'Aqaba'
];

/**
 * Base schema for contact information
 */
const baseContactSchema = {
  full_name: z.string({
    required_error: 'Full name is required',
    invalid_type_error: 'Full name must be a string'
  }).trim().min(2, { message: 'Full name must be at least 2 characters' }),

  phone: z.preprocess((val) => {
    if (typeof val === 'string') {
      return normalizeArabicNumerals(val.trim());
    }
    return val;
  }, z.string({
    required_error: 'Phone number is required',
    invalid_type_error: 'Phone number must be a string'
  }).trim().refine((val) => {
    // Clean spaces and dashes, count digits
    const digits = val.replace(/\D/g, '');
    return digits.length >= 9;
  }, { message: 'Phone number must contain at least 9 digits' })),

  email: z.string({
    required_error: 'Email address is required',
    invalid_type_error: 'Email must be a string'
  }).trim().email({ message: 'Valid email address is required' }),

  governorate: z.string({
    required_error: 'Governorate is required'
  }).trim().min(1, { message: 'Governorate is required' }),

  notes: z.string().optional().nullable().transform((v) => v || ''),

  consent: z.preprocess((val) => {
    if (typeof val === 'string') {
      return normalizeArabicNumerals(val.trim());
    }
    return val;
  }, z.any().refine((val) => {
    return val === true || val === 1 || val === '1' || val === 'true' || val === 'نعم' || val === 'on' || val === 'نعم، أوافق';
  }, { message: 'Consent to privacy policy and terms is required' })),

  ref: z.string().optional().nullable(),
  est_rate_used: z.any().optional().transform((v) => {
    if (v === undefined || v === null || v === '') return 7.75;
    const normalized = typeof v === 'string' ? normalizeArabicNumerals(v.trim()) : v;
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 7.75 : parsed;
  }),
  'bot-field': z.string().optional()
};

/**
 * Individual Track Schema
 */
const individualLeadSchema = z.object({
  ...baseContactSchema,
  applicant_type: z.enum(['فرد', 'individual'], {
    errorMap: () => ({ message: "applicant_type must be 'فرد' or 'individual'" })
  }),
  ind_product: z.string({
    required_error: 'Financing product is required'
  }).trim().min(1, { message: 'Financing product is required' }),

  ind_amount: z.preprocess(coerceNumber, z.number({
    required_error: 'Financing amount is required',
    invalid_type_error: 'Financing amount must be a number'
  }).positive({ message: 'Financing amount must be greater than zero' })),

  ind_tenor: z.preprocess(coerceNumber, z.number({
    required_error: 'Repayment tenor is required',
    invalid_type_error: 'Repayment tenor must be a number'
  }).positive({ message: 'Repayment tenor must be greater than zero' })),

  ind_income: z.preprocess(coerceNumber, z.number({
    required_error: 'Net monthly income is required',
    invalid_type_error: 'Net monthly income must be a number'
  }).min(0, { message: 'Net monthly income must be 0 or greater' })),

  ind_obligations: z.preprocess(coerceNumber, z.number().min(0).optional().default(0)),
  ind_employment: z.string({
    required_error: 'Employment sector is required'
  }).trim().min(1, { message: 'Employment sector is required' }),

  ind_job_years: z.string().optional().nullable().transform((v) => v || ''),
  ind_transfer: z.string().optional().nullable().transform((v) => v || ''),
  ind_sharia: z.string().optional().nullable().transform((v) => v || 'لا يهمّني')
});

/**
 * Enterprise Track Schema
 */
const enterpriseLeadSchema = z.object({
  ...baseContactSchema,
  applicant_type: z.enum(['منشأة', 'business'], {
    errorMap: () => ({ message: "applicant_type must be 'منشأة' or 'business'" })
  }),
  biz_name: z.string({
    required_error: 'Business name is required',
    invalid_type_error: 'Business name must be a string'
  }).trim().min(2, { message: 'Business name must be at least 2 characters' }),

  biz_legal: z.string().optional().nullable().transform((v) => v || ''),
  biz_sector: z.string({
    required_error: 'Business sector is required'
  }).trim().min(1, { message: 'Business sector is required' }),

  biz_age: z.string().optional().nullable().transform((v) => v || ''),
  biz_employees: z.string().optional().nullable().transform((v) => v || ''),
  biz_revenue: z.string().optional().nullable().transform((v) => v || ''),
  biz_purpose: z.string({
    required_error: 'Financing purpose is required'
  }).trim().min(1, { message: 'Financing purpose is required' }),

  biz_amount: z.preprocess(coerceNumber, z.number({
    required_error: 'Financing amount is required',
    invalid_type_error: 'Financing amount must be a number'
  }).positive({ message: 'Financing amount must be greater than zero' })),

  biz_tenor: z.preprocess(coerceNumber, z.number({
    required_error: 'Repayment tenor is required',
    invalid_type_error: 'Repayment tenor must be a number'
  }).positive({ message: 'Repayment tenor must be greater than zero' })),

  biz_sharia: z.string().optional().nullable().transform((v) => v || 'لا يهمّني'),
  contact_role: z.string().optional().nullable().transform((v) => v || ''),

  // Document checklist flags
  doc_cr: z.any().optional().transform(normalizeBoolean),
  doc_license: z.any().optional().transform(normalizeBoolean),
  doc_financials: z.any().optional().transform(normalizeBoolean),
  doc_bank: z.any().optional().transform(normalizeBoolean),
  doc_tax: z.any().optional().transform(normalizeBoolean),
  doc_collateral: z.any().optional().transform(normalizeBoolean)
});

/**
 * Lead validation middleware
 */
function validateLead(req, res, next) {
  const body = req.body || {};

  // Honeypot spam check
  if (body['bot-field'] && body['bot-field'].trim().length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Bot submission detected'
    });
  }

  // Validate applicant_type presence
  const rawType = body.applicant_type;
  if (!rawType || typeof rawType !== 'string' || !['فرد', 'منشأة', 'individual', 'business'].includes(rawType.trim())) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: [
        { field: 'applicant_type', message: "applicant_type is required and must be 'فرد' (individual) or 'منشأة' (business)" }
      ]
    });
  }

  const type = rawType.trim();
  const isIndividual = type === 'فرد' || type === 'individual';
  const schema = isIndividual ? individualLeadSchema : enterpriseLeadSchema;

  const result = schema.safeParse(body);

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details
    });
  }

  // Standardize applicant_type to Arabic ('فرد' or 'منشأة')
  const standardizedData = {
    ...result.data,
    applicant_type: isIndividual ? 'فرد' : 'منشأة',
    consent: 1
  };

  req.validatedData = standardizedData;
  next();
}

module.exports = {
  validateLead,
  individualLeadSchema,
  enterpriseLeadSchema,
  normalizeBoolean,
  normalizeArabicNumerals,
  coerceNumber,
  GOVERNORATES
};
