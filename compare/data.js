// data.js - بيانات محدّثة مع حقول تفصيلية للمقارنة
const ALL_CARDS_DATA = [
    {
        id: "INVESTBANK_PRIME_SIGNATURE",
        bank_ar: "INVESTBANK",
        logo: "../images/banks/investbank.png",
        product_name: "PRIME Signature",
        annual_fee_jod: 150,
        interest_rate: "1.50%",
        minimum_salary_jod: 2000,
        rewards: "cashback",
        lounge_access: "6 زيارات (LoungeKey)",
        is_islamic: false,
        foreign_transaction_fee: "2.75%",
        travel_insurance: "تأمين سفر شامل",
        rewards_summary: "كاش باك ثابت 2%",
        pros: ["كاش باك 2% ثابت على كل المشتريات", "تأمين سفر شامل", "مقبولة عالمياً"],
        cons: ["رسوم سنوية مرتفعة", "متطلب راتب عالي"],
        apply_url: "https://www.investbank.jo/ar/cards/prime-credit-card/",
        rewards_structure: {
            type: "cashback",
            default_rate: 0.02,
            categories: {
                general: 0.02,
                dining: 0.02,
                gas: 0.02,
                online: 0.02
            }
        }
    },
    {
        id: "ARAB_BANK_YOUTH_DEBIT",
        bank_ar: "البنك العربي",
        logo: "../images/banks/arab_bank.png",
        product_name: "فيزا شباب (خصم مباشر)",
        annual_fee_jod: 0,
        interest_rate: "0% (خصم مباشر)",
        minimum_salary_jod: 0,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نقاط عربي بوينتس",
        pros: [
            "مجانية تماماً",
            "إصدار فوري عبر الفروع/التطبيق",
            "عروض حصرية وخصومات للشباب",
            "برنامج عربي بوينتس",
            "كشف حساب إلكتروني",
            "لا يشترط تحويل راتب"
        ],
        cons: [
            "محدودة برصيد الحساب",
            "العمر 18-25 سنة فقط",
            "لا يوجد دخول لصالات المطار"
        ],
        apply_url: "https://www.arabbank.jo/ar/personal-banking/cards/debit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.01,
                gas: 0.01,
                online: 0.01
            }
        }
    },
    {
        id: "ARAB_BANK_VISA_CLASSIC",
        bank_ar: "البنك العربي",
        logo: "../images/banks/arab_bank.png",
        product_name: "فيزا كلاسيك ائتمانية",
        annual_fee_jod: 30,
        interest_rate: "1.65%",
        minimum_salary_jod: 300,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نقاط عربي بوينتس (1 نقطة/دينار)",
        pros: [
            "45 يوم سماح للمشتريات بدون فائدة",
            "حد ائتماني 1000-5000 د.أ",
            "حماية الشراء",
            "كشف حساب إلكتروني",
            "برنامج عربي بوينتس",
            "سحب نقدي حتى 100%"
        ],
        cons: [
            "رسوم سنوية 30 د.أ",
            "لا يوجد دخول لصالات المطار",
            "متطلب دخل 300 د.أ"
        ],
        apply_url: "https://www.arabbank.jo/ar/personal-banking/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.012,
                gas: 0.01,
                online: 0.012
            }
        }
    },
    {
        id: "ARAB_BANK_VISA_GOLD",
        bank_ar: "البنك العربي",
        logo: "../images/banks/arab_bank.png",
        product_name: "فيزا جولد ائتمانية",
        annual_fee_jod: 50,
        interest_rate: "1.65%",
        minimum_salary_jod: 700,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تأمين سفر أساسي",
        rewards_summary: "نقاط عربي بوينتس (حتى 3× النقاط)",
        pros: [
            "حد ائتماني حتى 20,000 د.أ",
            "تقسيط 0% بفروع ومتاجر مختارة",
            "حتى 5 بطاقات فرعية للعائلة",
            "تأمين سفر وحماية من الاحتيال",
            "أولوية خدمة عملاء",
            "نقاط أعلى حتى 3× الكلاسيك"
        ],
        cons: [
            "رسوم سنوية 50 د.أ",
            "متطلب دخل 700 د.أ+",
            "لا يوجد دخول لصالات المطار"
        ],
        apply_url: "https://www.arabbank.jo/ar/personal-banking/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.015,
            categories: {
                general: 0.015,
                dining: 0.02,
                gas: 0.015,
                online: 0.02
            }
        }
    },
    {
        id: "ARAB_BANK_TITANIUM",
        bank_ar: "البنك العربي",
        logo: "../images/banks/arab_bank.png",
        product_name: "تيتانيوم ماستر كارد",
        annual_fee_jod: 50,
        interest_rate: "1.65%",
        minimum_salary_jod: 700,
        rewards: "cashback",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تأمين سفر",
        rewards_summary: "كاش باك + نقاط عربي بوينتس",
        pros: [
            "حد ائتماني شخصي مرتفع",
            "فائدة منافسة وتقسيط مرن",
            "حماية مضاعفة عبر شريحة ذكية",
            "كاش باك وعروض موسمية",
            "لا يشترط تحويل راتب",
            "برنامج الحماية الائتمانية"
        ],
        cons: [
            "رسوم سنوية 50 د.أ",
            "متطلب دخل جيد",
            "لا يوجد دخول لصالات المطار"
        ],
        apply_url: "https://www.arabbank.jo/ar/personal-banking/cards/credit-cards",
        rewards_structure: {
            type: "cashback",
            default_rate: 0.015,
            categories: {
                general: 0.015,
                dining: 0.02,
                gas: 0.015,
                online: 0.02
            }
        }
    },
    {
        id: "ARAB_BANK_VISA_SIGNATURE",
        bank_ar: "البنك العربي",
        logo: "../images/banks/arab_bank.png",
        product_name: "Visa Signature/Platinum",
        annual_fee_jod: 200,
        interest_rate: "1.65%",
        minimum_salary_jod: 3000,
        rewards: "travel",
        lounge_access: "12 زيارة (LoungeKey)",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تأمين سفر متعدد الرحلات",
        rewards_summary: "نقاط عربي بوينتس (أسرع تراكم)",
        pros: [
            "حد ائتماني حتى 30,000 د.أ أو أكثر",
            "دخول صالات مطارات عالمية (12 زيارة)",
            "تأمين سفر متعدد الرحلات",
            "خدمة الكونسيرج",
            "حماية بطاقات خاصة وتصميم فاخر",
            "أسرع تراكم نقاط وأعلى مكافآت"
        ],
        cons: [
            "أعلى رسوم سنوية (200 د.أ)",
            "متطلب راتب مرتفع جداً (3000 د.أ+)"
        ],
        apply_url: "https://www.arabbank.jo/ar/personal-banking/cards/credit-cards/visa-signature",
        rewards_structure: {
            type: "points",
            default_rate: 0.02,
            categories: {
                general: 0.02,
                dining: 0.025,
                gas: 0.02,
                online: 0.025
            }
        }
    },
    {
        id: "ARAB_BANK_VIRTUAL",
        bank_ar: "البنك العربي",
        logo: "../images/banks/arab_bank.png",
        product_name: "بطاقة افتراضية (عربي موبايل)",
        annual_fee_jod: 0,
        interest_rate: "0% (افتراضية)",
        minimum_salary_jod: 0,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نقاط عربي بوينتس",
        pros: [
            "مجانية تماماً",
            "إصدار فوري من التطبيق",
            "للاستخدام أونلاين فقط",
            "تحكم كامل: إيقاف وتغيير سقف الشراء",
            "كشف إلكتروني",
            "برنامج عربي بوينتس"
        ],
        cons: [
            "للاستخدام الإلكتروني فقط",
            "محدودة برصيد الحساب",
            "يتطلب حساب نشط وعربي موبايل"
        ],
        apply_url: "https://www.arabbank.jo/ar/personal-banking/digital-banking",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.01,
                gas: 0.01,
                online: 0.012
            }
        }
    },
    {
        id: "IIAB_GOLD",
        bank_ar: "البنك العربي الإسلامي الدولي",
        logo: "../images/banks/iiab.png",
        product_name: "البطاقة الذهبية",
        annual_fee_jod: 50,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 800,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نقاط ولاء أساسية",
        pros: ["متوافقة مع الشريعة الإسلامية", "حد ائتمان مرتفع قد يصل إلى 50,000 دينار", "مقبولة عالمياً", "بطاقات للتابعين"],
        cons: ["تتطلب تحويل راتب أو إثبات دخل", "رسوم سنوية 50 د.أ", "لا يوجد دخول لصالات المطار"],
        apply_url: "https://www.iiabank.com.jo/ar/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.006,
            categories: {
                general: 0.006,
                dining: 0.007,
                gas: 0.006,
                online: 0.007
            }
        }
    },
    {
        id: "IIAB_VISA_DEBIT",
        bank_ar: "البنك العربي الإسلامي الدولي",
        logo: "../images/banks/iiab.png",
        product_name: "فيزا Debit",
        annual_fee_jod: 10,
        interest_rate: "0% (خصم مباشر)",
        minimum_salary_jod: 0,
        rewards: "low_interest",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "لا يوجد",
        pros: ["متوافقة مع الشريعة الإسلامية", "حماية CHIP & PIN", "معاملات محلية وعالمية", "لا يتطلب حد أدنى للراتب", "خصم مباشر من الحساب"],
        cons: ["رسوم إصدار واستبدال", "محدودة برصيد الحساب", "لا يوجد برنامج مكافآت"],
        apply_url: "https://www.iiabank.com.jo/ar/debit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0,
            categories: {
                general: 0,
                dining: 0,
                gas: 0,
                online: 0
            }
        }
    },
    {
        id: "IIAB_VISA_INSTALLMENT",
        bank_ar: "البنك العربي الإسلامي الدولي",
        logo: "../images/banks/iiab.png",
        product_name: "فيزا مقسطة",
        annual_fee_jod: 35,
        interest_rate: "0% (بدون أرباح)",
        minimum_salary_jod: 500,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "تقسيط مرن شرعي",
        pros: ["متوافقة مع الشريعة الإسلامية", "بدون أرباح أو عمولات إضافية للمبالغ المقسطة", "حد ائتماني حتى 1000 دينار", "شريحة ذكية وحماية", "استخدام عالمي"],
        cons: ["رسوم سنوية 35 د.أ", "يتطلب تحويل راتب", "حد ائتماني محدود", "لا يوجد مزايا سفر"],
        apply_url: "https://www.iiabank.com.jo/ar/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.005,
            categories: {
                general: 0.005,
                dining: 0.006,
                gas: 0.005,
                online: 0.007
            }
        }
    },
    {
        id: "IIAB_INTERNET_INSTALLMENT",
        bank_ar: "البنك العربي الإسلامي الدولي",
        logo: "../images/banks/iiab.png",
        product_name: "انترنت مقسطة",
        annual_fee_jod: 25,
        interest_rate: "0% (بدون أرباح)",
        minimum_salary_jod: 500,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "0% (بطاقة دولارية)",
        travel_insurance: "لا يوجد",
        rewards_summary: "تقسيط إلكتروني آمن بالدولار",
        pros: ["متوافقة مع الشريعة الإسلامية", "بالدولار الأمريكي حتى 750 دولار", "آمنة للتسوق الإلكتروني 3D Secure", "بدون أرباح أو عمولات إضافية", "حماية OTP"],
        cons: ["رسوم سنوية منخفضة (25 د.أ)", "للاستخدام الإلكتروني فقط", "يتطلب تحويل راتب", "حد ائتماني محدود"],
        apply_url: "https://www.iiabank.com.jo/ar/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.005,
            categories: {
                general: 0.005,
                dining: 0.005,
                gas: 0.005,
                online: 0.008
            }
        }
    },
    {
        id: "IIAB_JAALAH",
        bank_ar: "البنك العربي الإسلامي الدولي",
        logo: "../images/banks/iiab.png",
        product_name: "جعالة (تقسيط لدى التجار)",
        annual_fee_jod: 0,
        interest_rate: "0% (بدون أرباح)",
        minimum_salary_jod: 400,
        rewards: "low_interest",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "لا ينطبق",
        travel_insurance: "لا يوجد",
        rewards_summary: "تقسيط حتى 24 شهر بدون أرباح",
        pros: ["متوافقة مع الشريعة الإسلامية", "تقسيط يصل إلى 24 شهر", "بدون أرباح أو فوائد تقسيط", "لدى شبكة تجار معتمدة", "مرونة في القبول"],
        cons: ["لجنة تقسيط عند التاجر", "رسوم إصدار", "محدودة بالتجار المعتمدين فقط", "يتطلب موافقة التاجر"],
        apply_url: "https://www.iiabank.com.jo/ar/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0,
            categories: {
                general: 0,
                dining: 0,
                gas: 0,
                online: 0
            }
        }
    },
    {
        id: "BOJ_WORLD_MASTERCARD",
        bank_ar: "بنك الأردن",
        logo: "../images/banks/boj.png",
        product_name: "وورلد ماستركارد",
        annual_fee_jod: 150,
        interest_rate: "1.65%",
        minimum_salary_jod: 2000,
        rewards: "travel",
        lounge_access: "دخول مجاني لصالات المطارات عبر MasterCard Travel Pass",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تأمين سفر شامل (إلغاء، فقدان، تأخير)",
        rewards_summary: "نقاط مكافآت + خصومات حصرية",
        pros: [
            "دخول مجاني لصالات المطارات حول العالم",
            "تأمين سفر شامل متعدد الأنواع",
            "مركز اتصال خاص 24/7",
            "برنامج مكافآت قابل للاستبدال عبر التطبيق"
        ],
        cons: [
            "رسوم سنوية مرتفعة",
            "متطلب راتب عالي",
            "رسوم على الزيارات الإضافية للمطار"
        ],
        apply_url: "https://www.bankofjordan.com/ar/personal-banking/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.015,
                gas: 0.01,
                online: 0.01
            }
        }
    },
    {
        id: "BOJ_VISA_PLATINUM",
        bank_ar: "بنك الأردن",
        logo: "../images/banks/boj.png",
        product_name: "فيزا البلاتينية",
        annual_fee_jod: 100,
        interest_rate: "1.70%",
        minimum_salary_jod: 1200,
        rewards: "travel",
        lounge_access: "6 زيارات سنوياً لأكثر من 25 صالة مطار",
        is_islamic: false,
        foreign_transaction_fee: "2.75%",
        travel_insurance: "حماية المشتريات وتأمين السفر",
        rewards_summary: "نقاط + خصومات Visa Luxury Hotel Collection",
        pros: [
            "6 دخولات مجانية لصالات المطار سنوياً",
            "خصومات حصرية على الفنادق الفاخرة",
            "حماية المشتريات وتأمين السفر",
            "برنامج مكافآت يمكن استخدامه عبر التطبيق"
        ],
        cons: [
            "رسوم إضافية للزيارات الإضافية (32 دولار)",
            "عدد زيارات المطار محدود مقارنة بالوورلد"
        ],
        apply_url: "https://www.bankofjordan.com/ar/personal-banking/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.008,
            categories: {
                general: 0.008,
                dining: 0.012,
                gas: 0.008,
                online: 0.01
            }
        }
    },
    {
        id: "BOJ_VISA_GOLD",
        bank_ar: "بنك الأردن",
        logo: "../images/banks/boj.png",
        product_name: "فيزا الذهبية",
        annual_fee_jod: 50,
        interest_rate: "1.75%",
        minimum_salary_jod: 600,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "لا يوجد",
        rewards_summary: "برنامج مكافآت ونقاط قابلة للاستبدال",
        pros: [
            "فترة سماح حتى 55 يوماً",
            "مرونة في السداد والتحكم بالقسط",
            "برنامج مكافآت واستبدال فوري للنقاط",
            "خصومات وعروض متنوعة"
        ],
        cons: [
            "لا يوجد دخول لصالات المطار",
            "لا يوجد تأمين سفر",
            "رسوم المعاملات الدولية مرتفعة نسبياً"
        ],
        apply_url: "https://www.bankofjordan.com/ar/personal-banking/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.006,
            categories: {
                general: 0.006,
                dining: 0.008,
                gas: 0.006,
                online: 0.008
            }
        }
    },
    {
        id: "BOJ_VISA_CLASSIC",
        bank_ar: "بنك الأردن",
        logo: "../images/banks/boj.png",
        product_name: "فيزا كلاسيك (الفضية)",
        annual_fee_jod: 0,
        interest_rate: "1.80%",
        minimum_salary_jod: 350,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "لا يوجد",
        rewards_summary: "برنامج مكافآت وخصومات أساسي",
        pros: [
            "مجانية للسنة الأولى",
            "متطلب راتب منخفض جداً",
            "فترة سماح حتى 55 يوماً",
            "إصدار بطاقات تابعة مجاناً",
            "دفع آمن عبر OTP"
        ],
        cons: [
            "لا يوجد مزايا سفر",
            "برنامج مكافآت محدود",
            "رسوم سنوية بعد السنة الأولى"
        ],
        apply_url: "https://www.bankofjordan.com/ar/personal-banking/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.004,
            categories: {
                general: 0.004,
                dining: 0.005,
                gas: 0.004,
                online: 0.005
            }
        }
    },
    {
        id: "CAPITAL_BANK_VISA_PLATINUM",
        bank_ar: "كابيتال بنك",
        logo: "../images/banks/capital_bank.png",
        product_name: "فيزا بلاتينيوم الائتمانية",
        annual_fee_jod: 75,
        interest_rate: "1.70%",
        minimum_salary_jod: 700,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "2.75%",
        travel_insurance: "حماية عند السفر والتسوق",
        rewards_summary: "برنامج Capital Rewards",
        pros: [
            "برنامج مكافآت Capital Rewards",
            "حماية عند السفر والتسوق",
            "تقسيط بفوائد مخفضة حتى 36 شهر",
            "سحب نقدي حتى 100% من الحد الائتماني",
            "خدمة الدفع اللاتلامسي"
        ],
        cons: [
            "لا يوجد دخول لصالات المطار",
            "رسوم سنوية متوسطة"
        ],
        apply_url: "https://www.capitalbank.jo/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.008,
            categories: {
                general: 0.008,
                dining: 0.01,
                gas: 0.008,
                online: 0.012
            }
        }
    },
    {
        id: "CAPITAL_BANK_VISA_SIGNATURE",
        bank_ar: "كابيتال بنك",
        logo: "../images/banks/capital_bank.png",
        product_name: "فيزا Signature الائتمانية",
        annual_fee_jod: 150,
        interest_rate: "1.60%",
        minimum_salary_jod: 2000,
        rewards: "travel",
        lounge_access: "عدة زيارات مجانية سنوياً لصالات المطارات العالمية",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تأمين سفر متميز",
        rewards_summary: "برنامج كبار الشخصيات Capital Rewards",
        pros: [
            "برنامج كبار الشخصيات Capital Rewards",
            "تأمين سفر متميز",
            "دخول صالات مطارات عالمية",
            "خدمة المساعدة الدولية",
            "فترة سماح للسداد",
            "تقسيط مرن"
        ],
        cons: [
            "رسوم سنوية مرتفعة",
            "متطلب راتب عالي"
        ],
        apply_url: "https://www.capitalbank.jo/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.012,
            categories: {
                general: 0.012,
                dining: 0.015,
                gas: 0.012,
                online: 0.015
            }
        }
    },
    {
        id: "CAPITAL_BANK_VISA_INFINITE",
        bank_ar: "كابيتال بنك",
        logo: "../images/banks/capital_bank.png",
        product_name: "فيزا Infinite الائتمانية",
        annual_fee_jod: 250,
        interest_rate: "1.50%",
        minimum_salary_jod: 3500,
        rewards: "travel",
        lounge_access: "دخول غير محدود لصالات المطارات الدولية الرئيسية",
        is_islamic: false,
        foreign_transaction_fee: "2.25%",
        travel_insurance: "أفضل برامج تأمين السفر",
        rewards_summary: "برامج ولاء ومزايا عالمية حصرية",
        pros: [
            "حد ائتماني مرتفع جداً",
            "برامج ولاء ومزايا عالمية حصرية",
            "دخول غير محدود لصالات المطارات",
            "أفضل برامج تأمين السفر",
            "خدمة عملاء خاصة VIP",
            "الدفع اللاتلامسي"
        ],
        cons: [
            "أعلى رسوم سنوية في الفئة",
            "متطلب راتب مرتفع جداً"
        ],
        apply_url: "https://www.capitalbank.jo/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.015,
            categories: {
                general: 0.015,
                dining: 0.02,
                gas: 0.015,
                online: 0.02
            }
        }
    },
    {
        id: "CAPITAL_BANK_VISA_INFINITE_FOREIGN",
        bank_ar: "كابيتال بنك",
        logo: "../images/banks/capital_bank.png",
        product_name: "فيزا Infinite للعملات الأجنبية",
        annual_fee_jod: 250,
        interest_rate: "1.50%",
        minimum_salary_jod: 3500,
        rewards: "travel",
        lounge_access: "دخول غير محدود لصالات المطارات الدولية",
        is_islamic: false,
        foreign_transaction_fee: "0% (لا توجد رسوم صرف للعملات الرئيسية)",
        travel_insurance: "تأمين سفر شامل",
        rewards_summary: "برامج ولاء وعروض حصرية للمسافرين",
        pros: [
            "مدفوعات بالعملات الرئيسية دون عمولة صرف (USD, EUR, GBP, AED, SAR)",
            "برامج ولاء/عروض حصرية",
            "أمان عالي وخدمة عملاء مخصصة",
            "قبول عالمي بدون رسوم إضافية",
            "مثالية للمسافرين ورجال الأعمال"
        ],
        cons: [
            "رسوم سنوية مرتفعة جداً",
            "متطلب راتب عالي جداً",
            "مناسبة فقط لكثيري السفر"
        ],
        apply_url: "https://www.capitalbank.jo/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.015,
            categories: {
                general: 0.015,
                dining: 0.02,
                gas: 0.015,
                online: 0.02
            }
        }
    },
    {
        id: "CAE_STANDARD",
        bank_ar: "بنك القاهرة عمان",
        logo: "../images/banks/CAB.PNG",
        product_name: "فيزا/ماستركارد Standard",
        annual_fee_jod: 25,
        interest_rate: "1.50%",
        minimum_salary_jod: 400,
        rewards: "points",
        lounge_access: "دخول صالات مطار (حسب العروض)",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "حماية أساسية",
        rewards_summary: "برنامج مكافآت وخصومات",
        pros: [
            "الإصدار الأول معفى من الرسوم",
            "رسوم سنوية منخفضة (25 د.أ)",
            "برنامج مكافآت متنوع",
            "خصومات مع شركاء البنك",
            "تقسيط المشتريات بعروض خاصة"
        ],
        cons: [
            "نسبة فائدة شهرية 1.5%",
            "رسوم سحب نقدي 3% أو 3 د.أ",
            "متطلب راتب أساسي"
        ],
        apply_url: "https://www.cae.jo/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.006,
            categories: {
                general: 0.006,
                dining: 0.008,
                gas: 0.006,
                online: 0.008
            }
        }
    },
    {
        id: "CAE_PLATINUM",
        bank_ar: "بنك القاهرة عمان",
        logo: "../images/banks/CAB.PNG",
        product_name: "فيزا/ماستركارد Platinum",
        annual_fee_jod: 50,
        interest_rate: "1.50%",
        minimum_salary_jod: 800,
        rewards: "travel",
        lounge_access: "دخول صالات مطار عالمية",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "تأمين سفر شامل",
        rewards_summary: "مكافآت أعلى وعروض سفر متميزة",
        pros: [
            "الإصدار الأول معفى من الرسوم",
            "مكافآت أعلى من البطاقة العادية",
            "عروض سفر وتأمين شامل",
            "دخول صالات مطار عالمية",
            "تقسيط بعروض خاصة"
        ],
        cons: [
            "نسبة فائدة شهرية 1.5%",
            "رسوم سحب نقدي 3% أو 5 د.أ",
            "رسوم سنوية 50 د.أ"
        ],
        apply_url: "https://www.cae.jo/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.012,
                gas: 0.01,
                online: 0.012
            }
        }
    },
    {
        id: "CAE_WORLD",
        bank_ar: "بنك القاهرة عمان",
        logo: "../images/banks/CAB.PNG",
        product_name: "ماستركارد World",
        annual_fee_jod: 75,
        interest_rate: "1.50%",
        minimum_salary_jod: 1500,
        rewards: "travel",
        lounge_access: "دخول صالات مطار عالمية مميزة",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "تأمين سفر متميز",
        rewards_summary: "امتيازات سفر وصالات مطار وباقة خاصة",
        pros: [
            "الإصدار الأول معفى من الرسوم",
            "امتيازات سفر حصرية",
            "دخول صالات مطار عالمية مميزة",
            "باقة مزايا خاصة",
            "تأمين سفر متميز"
        ],
        cons: [
            "نسبة فائدة شهرية 1.5%",
            "رسوم سحب نقدي 3% أو 5 د.أ",
            "رسوم سنوية 75 د.أ",
            "متطلب راتب متوسط إلى عالي"
        ],
        apply_url: "https://www.cae.jo/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.012,
            categories: {
                general: 0.012,
                dining: 0.015,
                gas: 0.012,
                online: 0.015
            }
        }
    },
    {
        id: "CAE_WORLD_ELITE",
        bank_ar: "بنك القاهرة عمان",
        logo: "../images/banks/CAB.PNG",
        product_name: "ماستركارد World Elite",
        annual_fee_jod: 120,
        interest_rate: "1.50%",
        minimum_salary_jod: 2500,
        rewards: "travel",
        lounge_access: "صالات مطارات النخبة وعروض حصرية",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "أفضل تأمين سفر شامل",
        rewards_summary: "صالات مطارات وعروض النخبة",
        pros: [
            "الإصدار الأول معفى من الرسوم",
            "بطاقة النخبة للعملاء المميزين",
            "صالات مطارات VIP حصرية",
            "عروض ومزايا النخبة العالمية",
            "أفضل تأمين سفر شامل"
        ],
        cons: [
            "نسبة فائدة شهرية 1.5%",
            "رسوم سحب نقدي 3% أو 5 د.أ",
            "أعلى رسوم سنوية (120 د.أ)",
            "متطلب راتب عالي"
        ],
        apply_url: "https://www.cae.jo/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.015,
            categories: {
                general: 0.015,
                dining: 0.02,
                gas: 0.015,
                online: 0.02
            }
        }
    },
    {
        id: "SAFWA_MURABAHA_CLASSIC",
        bank_ar: "بنك صفوة الإسلامي",
        logo: "../images/banks/safwa_islamic_bank.png",
        product_name: "بطاقة المرابحة الإلكترونية Classic",
        annual_fee_jod: 0,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 400,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نظام نقاط ولاء + تقسيط شرعي",
        pros: [
            "معفى من الرسوم السنة الأولى",
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "تقسيط دون أرباح مع بعض التجار",
            "نظام نقاط ولاء",
            "دعم Apple Pay و 3D Secure",
            "تحكم إلكتروني كامل عبر التطبيق"
        ],
        cons: [
            "لا يوجد دخول لصالات المطار",
            "لا يوجد تأمين سفر",
            "برنامج مكافآت أساسي"
        ],
        apply_url: "https://www.safwabank.com/en/product/credit-card/",
        rewards_structure: {
            type: "points",
            default_rate: 0.007,
            categories: {
                general: 0.007,
                dining: 0.009,
                gas: 0.007,
                online: 0.009
            }
        }
    },
    {
        id: "SAFWA_MURABAHA_TITANIUM",
        bank_ar: "بنك صفوة الإسلامي",
        logo: "../images/banks/safwa_islamic_bank.png",
        product_name: "بطاقة المرابحة الإلكترونية Titanium",
        annual_fee_jod: 80,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 1200,
        rewards: "travel",
        lounge_access: "دخول صالات VIP لـ 10 مطارات عربية",
        is_islamic: true,
        foreign_transaction_fee: "2.25%",
        travel_insurance: "تأمين سفر أساسي",
        rewards_summary: "نقاط ولاء + مزايا سفر عربية",
        pros: [
            "معفى من الرسوم السنة الأولى",
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "جميع ميزات Classic + دخول صالات VIP لـ 10 مطارات عربية",
            "عروض فنادق وسفر حصرية",
            "خصومات عالمية",
            "تأمين سفر",
            "تقسيط شرعي"
        ],
        cons: [
            "رسوم سنوية 80 د.أ بعد السنة الأولى",
            "دخول المطارات محدود في المنطقة العربية",
            "متطلب راتب متوسط"
        ],
        apply_url: "https://www.safwabank.com/en/product/credit-card/",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.013,
                gas: 0.01,
                online: 0.013
            }
        }
    },
    {
        id: "SAFWA_MURABAHA_WORLD",
        bank_ar: "بنك صفوة الإسلامي",
        logo: "../images/banks/safwa_islamic_bank.png",
        product_name: "بطاقة المرابحة الإلكترونية World",
        annual_fee_jod: 150,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 2000,
        rewards: "travel",
        lounge_access: "دخول 1200 صالة مطار في 135 دولة",
        is_islamic: true,
        foreign_transaction_fee: "2.25%",
        travel_insurance: "تأمين سفر موسع شامل",
        rewards_summary: "نقاط Safwa Rewards + مزايا عالمية",
        pros: [
            "معفى من الرسوم السنة الأولى",
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "كل ميزات Titanium + دخول 1200 صالة مطار في 135 دولة",
            "تأمين سفر موسع شامل",
            "عروض عالمية حصرية",
            "خدمات نخبوية وتخفيضات مميزة",
            "برنامج نقاط Safwa Rewards الكامل"
        ],
        cons: [
            "رسوم سنوية مرتفعة (150 د.أ)",
            "متطلب راتب عالي",
            "مناسبة للمسافرين الدائمين فقط"
        ],
        apply_url: "https://www.safwabank.com/en/product/credit-card/",
        rewards_structure: {
            type: "points",
            default_rate: 0.012,
            categories: {
                general: 0.012,
                dining: 0.015,
                gas: 0.012,
                online: 0.015
            }
        }
    },
    {
        id: "ETIHAD_VISA_GOLD",
        bank_ar: "بنك الاتحاد",
        logo: "../images/banks/bank_al_etihad.png",
        product_name: "فيزا الذهبية الائتمانية",
        annual_fee_jod: 0,
        interest_rate: "1.50%",
        minimum_salary_jod: 450,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نقاط ولاء + عروض يومية",
        pros: [
            "بدون رسوم سنوية",
            "مرونة في الدفع",
            "عروض سفر وخصومات يومية",
            "دفع إلكتروني آمن",
            "كشف حساب إلكتروني",
            "نظام نقاط ولاء"
        ],
        cons: [
            "لا يوجد دخول لصالات المطار",
            "لا يوجد تأمين سفر",
            "نسبة فائدة 1.5% شهرياً"
        ],
        apply_url: "https://www.bankaletihad.com/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.006,
            categories: {
                general: 0.006,
                dining: 0.008,
                gas: 0.006,
                online: 0.008
            }
        }
    },
    {
        id: "ETIHAD_VISA_PLATINUM",
        bank_ar: "بنك الاتحاد",
        logo: "../images/banks/bank_al_etihad.png",
        product_name: "فيزا البلاتينية الائتمانية",
        annual_fee_jod: 50,
        interest_rate: "1.50%",
        minimum_salary_jod: 900,
        rewards: "travel",
        lounge_access: "دخول صالات مطارات مختارة",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "حماية سفر إضافية",
        rewards_summary: "نقاط ولاء + مزايا سفر",
        pros: [
            "دخول صالات مطارات مختارة",
            "عروض مطاعم حصرية",
            "حماية سفر إضافية",
            "كشف حساب دوري",
            "نظام نقاط ولاء متطور",
            "خصومات يومية"
        ],
        cons: [
            "رسوم سنوية 50 د.أ",
            "نسبة فائدة 1.5% شهرياً",
            "دخول المطارات محدود"
        ],
        apply_url: "https://www.bankaletihad.com/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.008,
            categories: {
                general: 0.008,
                dining: 0.011,
                gas: 0.008,
                online: 0.011
            }
        }
    },
    {
        id: "ETIHAD_VISA_SIGNATURE",
        bank_ar: "بنك الاتحاد",
        logo: "../images/banks/bank_al_etihad.png",
        product_name: "فيزا سيغنتشر الائتمانية",
        annual_fee_jod: 70,
        interest_rate: "1.50%",
        minimum_salary_jod: 1800,
        rewards: "travel",
        lounge_access: "دخول صالات مطارات عالمية",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تغطية تأمينية سفرية شاملة",
        rewards_summary: "خدمات كونسيرج + تجربة سفر فاخرة",
        pros: [
            "تجربة سفر سلسة ومميزة",
            "خدمات كونسيرج 24/7",
            "تغطية تأمينية سفرية شاملة",
            "خدمة عملاء خاصة",
            "نقاط ولاء مضاعفة",
            "دخول صالات مطارات عالمية"
        ],
        cons: [
            "رسوم سنوية 70 د.أ",
            "نسبة فائدة 1.5% شهرياً",
            "متطلب راتب متوسط إلى عالي"
        ],
        apply_url: "https://www.bankaletihad.com/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.013,
                gas: 0.01,
                online: 0.013
            }
        }
    },
    {
        id: "ETIHAD_VISA_INFINITE",
        bank_ar: "بنك الاتحاد",
        logo: "../images/banks/bank_al_etihad.png",
        product_name: "فيزا إنفينيت الائتمانية",
        annual_fee_jod: 100,
        interest_rate: "1.50%",
        minimum_salary_jod: 2800,
        rewards: "travel",
        lounge_access: "دخول غير محدود لصالات المطارات العالمية",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تأمين سفر VIP شامل",
        rewards_summary: "خدمات VIP + مساعد شخصي",
        pros: [
            "دخول غير محدود لصالات المطارات العالمية",
            "مساعد شخصي مخصص",
            "خدمات VIP حصرية",
            "عروض سفر قوية ومميزة",
            "تأمين سفر شامل VIP",
            "أعلى نقاط ولاء"
        ],
        cons: [
            "رسوم سنوية مرتفعة (100 د.أ)",
            "نسبة فائدة 1.5% شهرياً",
            "متطلب راتب عالي جداً"
        ],
        apply_url: "https://www.bankaletihad.com/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.013,
            categories: {
                general: 0.013,
                dining: 0.017,
                gas: 0.013,
                online: 0.017
            }
        }
    },
    {
        id: "ETIHAD_VISA_FOREIGN_CURRENCY",
        bank_ar: "بنك الاتحاد",
        logo: "../images/banks/bank_al_etihad.png",
        product_name: "فيزا بالعملة الأجنبية",
        annual_fee_jod: 150,
        interest_rate: "1.50%",
        minimum_salary_jod: 2200,
        rewards: "travel",
        lounge_access: "دخول صالات مطارات عالمية",
        is_islamic: false,
        foreign_transaction_fee: "0% (للعملات المدعومة)",
        travel_insurance: "تأمين سفر دولي",
        rewards_summary: "دفع بالعملات الأجنبية بدون رسوم",
        pros: [
            "الدفع بالدولار/اليورو/الإسترليني بدون فرق عملة",
            "مثالية للسفر الدولي المتكرر",
            "مثالية للمتسوقين أونلاين عالمياً",
            "تأمين سفر دولي",
            "نقاط ولاء مميزة",
            "تجنب رسوم صرف العملات"
        ],
        cons: [
            "أعلى رسوم سنوية (150 د.أ)",
            "نسبة فائدة 1.5% شهرياً",
            "مناسبة فقط للمسافرين والمتسوقين دولياً"
        ],
        apply_url: "https://www.bankaletihad.com/ar/personal/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.012,
            categories: {
                general: 0.012,
                dining: 0.015,
                gas: 0.012,
                online: 0.018
            }
        }
    },
    {
        id: "ALRAJHI_CLASSIC",
        bank_ar: "بنك الراجحي",
        logo: "../images/banks/alrajhi_bank.png",
        product_name: "بطاقة كلاسيك الائتمانية",
        annual_fee_jod: 0,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 350,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نقاط ولاء أساسية",
        pros: [
            "بدون رسوم سنوية",
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "إصدار فوري",
            "مخصصة للمشتريات اليومية والأونلاين",
            "دفع لاتلامسي NFC",
            "حد ائتمان 250-999 د.أ"
        ],
        cons: [
            "لا يوجد دخول لصالات المطار",
            "لا يوجد تأمين سفر",
            "حد ائتمان محدود",
            "برنامج مكافآت أساسي"
        ],
        apply_url: "https://www.alrajhibank.com.jo/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.005,
            categories: {
                general: 0.005,
                dining: 0.006,
                gas: 0.005,
                online: 0.007
            }
        }
    },
    {
        id: "ALRAJHI_GOLD",
        bank_ar: "بنك الراجحي",
        logo: "../images/banks/alrajhi_bank.png",
        product_name: "بطاقة جولد الائتمانية",
        annual_fee_jod: 35,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 700,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نقاط ولاء محسّنة",
        pros: [
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "مشتريات محلية وعالمية",
            "حد ائتمان 1000-2000 د.أ",
            "مرونة أكثر من الكلاسيك",
            "إصدار فوري",
            "دفع لاتلامسي NFC"
        ],
        cons: [
            "رسوم سنوية 35 د.أ",
            "لا يوجد دخول لصالات المطار",
            "لا يوجد تأمين سفر"
        ],
        apply_url: "https://www.alrajhibank.com.jo/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.007,
            categories: {
                general: 0.007,
                dining: 0.009,
                gas: 0.007,
                online: 0.009
            }
        }
    },
    {
        id: "ALRAJHI_PLATINUM",
        bank_ar: "بنك الراجحي",
        logo: "../images/banks/alrajhi_bank.png",
        product_name: "بطاقة بلاتينيوم الائتمانية",
        annual_fee_jod: 80,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 1500,
        rewards: "travel",
        lounge_access: "امتيازات محدودة حسب العروض",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "حماية أساسية",
        rewards_summary: "امتيازات برستيج + نقاط مضاعفة",
        pros: [
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "حد ائتمان 2000-4999 د.أ",
            "امتيازات برستيج",
            "حماية وتأمين أعلى",
            "إصدار فوري",
            "نقاط ولاء مضاعفة"
        ],
        cons: [
            "رسوم سنوية مرتفعة (80 د.أ)",
            "دخول صالات المطار محدود",
            "متطلب راتب متوسط إلى عالي"
        ],
        apply_url: "https://www.alrajhibank.com.jo/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.012,
                gas: 0.01,
                online: 0.012
            }
        }
    },
    {
        id: "ALRAJHI_INSTALLMENT",
        bank_ar: "بنك الراجحي",
        logo: "../images/banks/alrajhi_bank.png",
        product_name: "بطاقة قسط الائتمانية",
        annual_fee_jod: 25,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 700,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "تقسيط مرن شرعي",
        pros: [
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "موجهة للتقسيط الشرعي",
            "حد ائتمان 1000 د.أ",
            "مشتريات أونلاين",
            "إصدار فوري",
            "تقسيط بدون فوائد"
        ],
        cons: [
            "رسوم سنوية 25 د.أ",
            "حد ائتمان محدود",
            "لا يوجد مزايا سفر"
        ],
        apply_url: "https://www.alrajhibank.com.jo/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.006,
            categories: {
                general: 0.006,
                dining: 0.007,
                gas: 0.006,
                online: 0.008
            }
        }
    },
    {
        id: "ALRAJHI_CLASSIC_FLEXIBLE",
        bank_ar: "بنك الراجحي",
        logo: "../images/banks/alrajhi_bank.png",
        product_name: "بطاقة كلاسيك المرنة",
        annual_fee_jod: 0,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 350,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "مرابحة دورية + سداد مرن",
        pros: [
            "بدون رسوم سنوية",
            "متوافقة مع الشريعة الإسلامية (مرابحة دورية)",
            "خدمة السداد المرن",
            "قسط شهري منخفض",
            "حد ائتمان 250-999 د.أ",
            "إصدار فوري"
        ],
        cons: [
            "لا يوجد دخول لصالات المطار",
            "لا يوجد تأمين سفر",
            "حد ائتمان محدود"
        ],
        apply_url: "https://www.alrajhibank.com.jo/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.005,
            categories: {
                general: 0.005,
                dining: 0.006,
                gas: 0.005,
                online: 0.007
            }
        }
    },
    {
        id: "ALRAJHI_GOLD_FLEXIBLE",
        bank_ar: "بنك الراجحي",
        logo: "../images/banks/alrajhi_bank.png",
        product_name: "بطاقة جولد المرنة",
        annual_fee_jod: 35,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 700,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "لا يوجد",
        rewards_summary: "مرابحة وتقسيط مرن",
        pros: [
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "تسهيلات إضافية",
            "شراء عبر الإنترنت",
            "حد ائتمان 1000-2000 د.أ",
            "تقسيط مرن",
            "إصدار فوري"
        ],
        cons: [
            "رسوم سنوية 35 د.أ",
            "لا يوجد دخول لصالات المطار",
            "لا يوجد تأمين سفر"
        ],
        apply_url: "https://www.alrajhibank.com.jo/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.007,
            categories: {
                general: 0.007,
                dining: 0.009,
                gas: 0.007,
                online: 0.009
            }
        }
    },
    {
        id: "ALRAJHI_PLATINUM_FLEXIBLE",
        bank_ar: "بنك الراجحي",
        logo: "../images/banks/alrajhi_bank.png",
        product_name: "بطاقة بلاتينيوم المرنة",
        annual_fee_jod: 100,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 2500,
        rewards: "travel",
        lounge_access: "امتيازات محدودة",
        is_islamic: true,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "حماية محسنة",
        rewards_summary: "مرابحة/تقسيط بمرونة عالية",
        pros: [
            "متوافقة مع الشريعة الإسلامية (مرابحة)",
            "مصممة للنخبة",
            "حد ائتمان 5000 د.أ+",
            "تقسيط بمرونة عالية",
            "امتيازات سفر",
            "إصدار فوري"
        ],
        cons: [
            "رسوم سنوية مرتفعة (100 د.أ)",
            "متطلب راتب عالي",
            "دخول صالات المطار محدود"
        ],
        apply_url: "https://www.alrajhibank.com.jo/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.012,
            categories: {
                general: 0.012,
                dining: 0.015,
                gas: 0.012,
                online: 0.015
            }
        }
    },
    {
        id: "ALRAJHI_INFINITE_FLEXIBLE",
        bank_ar: "بنك الراجحي",
        logo: "../images/banks/alrajhi_bank.png",
        product_name: "بطاقة إنفينيت المرنة",
        annual_fee_jod: 200,
        interest_rate: "0% (مرابحة)",
        minimum_salary_jod: 4500,
        rewards: "travel",
        lounge_access: "دخول صالات مطارات عالمية",
        is_islamic: true,
        foreign_transaction_fee: "2.25%",
        travel_insurance: "تأمين سفر VIP شامل",
        rewards_summary: "مرابحة متقدمة للنخبة",
        pros: [
            "متوافقة مع الشريعة الإسلامية (مرابحة متقدمة)",
            "حد ائتمان مرتفع جداً (25000 د.أ+)",
            "لأصحاب الدخل العالي ونخبة السفر",
            "مشتريات وسفر VIP",
            "دخول صالات مطارات عالمية",
            "تأمين سفر شامل"
        ],
        cons: [
            "أعلى رسوم سنوية (200 د.أ)",
            "متطلب راتب مرتفع جداً",
            "مناسبة فقط للنخبة والمسافرين الدائمين"
        ],
        apply_url: "https://www.alrajhibank.com.jo/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.015,
            categories: {
                general: 0.015,
                dining: 0.02,
                gas: 0.015,
                online: 0.02
            }
        }
    },
    {
        id: "HOUSING_VISA_INFINITE_JOD",
        bank_ar: "بنك الإسكان للتجارة والتمويل (HBTF)",
        logo: "../images/banks/housing_bank.png",
        product_name: "Visa Infinite (دينار)",
        annual_fee_jod: 150,
        interest_rate: "1.60%",
        minimum_salary_jod: 3000,
        rewards: "travel",
        lounge_access: "دخول صالات مطارات عالمية",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تأمين سفر شامل",
        rewards_summary: "نقاط كوينز + مزايا فاخرة",
        pros: [
            "دخول صالات مطارات عالمية",
            "تأمين سفر شامل",
            "نقاط كوينز Coinz",
            "خصومات فاخرة عالمية",
            "حماية متكاملة",
            "حد ائتماني مرتفع"
        ],
        cons: [
            "رسوم سنوية مرتفعة (150 د.أ)",
            "متطلب دخل/رصيد عالي جداً",
            "نسبة فائدة 1.6% شهرياً"
        ],
        apply_url: "https://www.hbtf.com/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.012,
            categories: {
                general: 0.012,
                dining: 0.015,
                gas: 0.012,
                online: 0.015
            }
        }
    },
    {
        id: "HOUSING_VISA_INFINITE_USD",
        bank_ar: "بنك الإسكان للتجارة والتمويل (HBTF)",
        logo: "../images/banks/housing_bank.png",
        product_name: "Visa Infinite (دولار)",
        annual_fee_jod: 150,
        interest_rate: "1.60%",
        minimum_salary_jod: 3000,
        rewards: "travel",
        lounge_access: "دخول صالات مطارات عالمية",
        is_islamic: false,
        foreign_transaction_fee: "0% (بطاقة دولارية)",
        travel_insurance: "تأمين سفر شامل دولي",
        rewards_summary: "نقاط كوينز + مزايا دولية",
        pros: [
            "بطاقة بالدولار الأمريكي",
            "دخول صالات مطارات عالمية",
            "تأمين سفر شامل",
            "مزايا دولية حصرية",
            "مثالية للمسافرين دولياً",
            "بدون رسوم صرف عملة"
        ],
        cons: [
            "رسوم سنوية مرتفعة (150 د.أ)",
            "صالحة للاستخدام الدولي فقط",
            "متطلب دخل عالي جداً"
        ],
        apply_url: "https://www.hbtf.com/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.012,
            categories: {
                general: 0.012,
                dining: 0.015,
                gas: 0.012,
                online: 0.018
            }
        }
    },
    {
        id: "HOUSING_VISA_PLATINUM",
        bank_ar: "بنك الإسكان للتجارة والتمويل (HBTF)",
        logo: "../images/banks/housing_bank.png",
        product_name: "Visa Platinum",
        annual_fee_jod: 100,
        interest_rate: "1.65%",
        minimum_salary_jod: 1500,
        rewards: "travel",
        lounge_access: "6 زيارات صالة مطار/سنة",
        is_islamic: false,
        foreign_transaction_fee: "2.75%",
        travel_insurance: "حماية سفر أساسية",
        rewards_summary: "نقاط كوينز + امتيازات",
        pros: [
            "حد ائتماني أعلى من العادية",
            "6 زيارات مجانية لصالات المطار سنوياً",
            "حماية وتأمين",
            "خصومات مميزة",
            "نقاط كوينز Coinz",
            "امتيازات إضافية"
        ],
        cons: [
            "رسوم سنوية مرتفعة (100 د.أ)",
            "دخول محدود لصالات المطار",
            "متطلب دخل عالي"
        ],
        apply_url: "https://www.hbtf.com/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.009,
            categories: {
                general: 0.009,
                dining: 0.011,
                gas: 0.009,
                online: 0.011
            }
        }
    },
    {
        id: "HOUSING_VISA_SIGNATURE",
        bank_ar: "بنك الإسكان للتجارة والتمويل (HBTF)",
        logo: "../images/banks/housing_bank.png",
        product_name: "Visa Signature",
        annual_fee_jod: 120,
        interest_rate: "1.62%",
        minimum_salary_jod: 2200,
        rewards: "travel",
        lounge_access: "12 زيارة صالة مطار/سنة",
        is_islamic: false,
        foreign_transaction_fee: "2.5%",
        travel_insurance: "تأمين سفر متقدم",
        rewards_summary: "نقاط كوينز + مزايا سفر",
        pros: [
            "حد ائتماني أعلى",
            "12 زيارة مجانية لصالات المطار سنوياً",
            "مزايا سفر حصرية",
            "خصومات عالمية",
            "حماية متقدمة",
            "نقاط كوينز Coinz"
        ],
        cons: [
            "رسوم سنوية مرتفعة (120 د.أ)",
            "متطلب دخل عالي",
            "نسبة فائدة 1.62% شهرياً"
        ],
        apply_url: "https://www.hbtf.com/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.01,
            categories: {
                general: 0.01,
                dining: 0.013,
                gas: 0.01,
                online: 0.013
            }
        }
    },
    {
        id: "HOUSING_VISA_CLASSIC",
        bank_ar: "بنك الإسكان للتجارة والتمويل (HBTF)",
        logo: "../images/banks/housing_bank.png",
        product_name: "فيزا كلاسيك",
        annual_fee_jod: 25,
        interest_rate: "1.70%",
        minimum_salary_jod: 400,
        rewards: "points",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "لا يوجد",
        rewards_summary: "نقاط كوينز أساسية",
        pros: [
            "رسوم سنوية منخفضة (25 د.أ)",
            "حد ائتماني متجدد",
            "حماية أساسية",
            "نقاط كوينز Coinz",
            "إمكان السحب النقدي",
            "متطلب راتب منخفض"
        ],
        cons: [
            "لا يوجد دخول لصالات المطار",
            "لا يوجد تأمين سفر",
            "مزايا أقل من البطاقات الأعلى",
            "نسبة فائدة 1.7% شهرياً"
        ],
        apply_url: "https://www.hbtf.com/ar/cards/credit-cards",
        rewards_structure: {
            type: "points",
            default_rate: 0.005,
            categories: {
                general: 0.005,
                dining: 0.006,
                gas: 0.007,
                online: 0.006
            }
        }
    },
    {
        id: "REFLECT_VISA_PLATINUM",
        bank_ar: "ريفلكت",
        logo: "../images/banks/reflect.png",
        product_name: "ريفلكت فيزا بلاتينيوم",
        annual_fee_jod: 0,
        interest_rate: "1.75%",
        minimum_salary_jod: 300,
        rewards: "cashback",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "لا يوجد",
        rewards_summary: "3% كاش باك فوري حتى 35 د.أ شهرياً",
        pros: [
            "مجانية السنة الأولى",
            "3% كاش باك فوري على كل عملية",
            "تقسيط حتى 24 شهر بفائدة 0% من متاجر مختارة",
            "تحكم كامل من التطبيق",
            "إصدار فوري وتوصيل للمنزل",
            "إيقاف أو تعديل سقف البطاقة بنفسك"
        ],
        cons: [
            "رسوم سنوية 25 د.أ بعد السنة الأولى",
            "فائدة تأخير 1.75% + 5 د.أ",
            "عمولة سحب نقدي 4%",
            "كاش باك محدود بـ 35 د.أ شهرياً"
        ],
        apply_url: "https://reflect.jo/",
        rewards_structure: {
            type: "cashback",
            default_rate: 0.03,
            categories: {
                general: 0.03,
                dining: 0.03,
                gas: 0.03,
                online: 0.03
            }
        }
    },
    {
        id: "REFLECT_DEBIT",
        bank_ar: "ريفلكت",
        logo: "../images/banks/reflect.png",
        product_name: "ريفلكت Debit",
        annual_fee_jod: 0,
        interest_rate: "0% (خصم مباشر)",
        minimum_salary_jod: 0,
        rewards: "low_interest",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "لا يوجد",
        rewards_summary: "لا يوجد",
        pros: [
            "إصدار أول مجاني",
            "سحب مجاني من البنك العربي",
            "إدارة من التطبيق",
            "دعم فوري",
            "تحويل فوري",
            "لا تشترط تحويل راتب"
        ],
        cons: [
            "إعادة إصدار: 2 د.أ (الثانية)، 5 د.أ (الثالثة)",
            "محدودة برصيد الحساب",
            "لا يوجد برنامج مكافآت",
            "عمولة عملات أجنبية 3%"
        ],
        apply_url: "https://reflect.jo/",
        rewards_structure: {
            type: "points",
            default_rate: 0,
            categories: {
                general: 0,
                dining: 0,
                gas: 0,
                online: 0
            }
        }
    },
    {
        id: "REFLECT_VIRTUAL",
        bank_ar: "ريفلكت",
        logo: "../images/banks/reflect.png",
        product_name: "ريفلكت افتراضية",
        annual_fee_jod: 0,
        interest_rate: "0% (افتراضية)",
        minimum_salary_jod: 0,
        rewards: "low_interest",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "3%",
        travel_insurance: "لا يوجد",
        rewards_summary: "لا يوجد",
        pros: [
            "مجانية تماماً",
            "تسوق آمن إلكتروني",
            "التحكم من التطبيق",
            "ربط مباشر بالحساب الرئيسي",
            "إصدار فوري",
            "مثالية للتسوق أونلاين"
        ],
        cons: [
            "للاستخدام الإلكتروني فقط",
            "عمولة عملات أجنبية 3%",
            "لا يوجد برنامج مكافآت",
            "محدودة برصيد الحساب"
        ],
        apply_url: "https://reflect.jo/",
        rewards_structure: {
            type: "points",
            default_rate: 0,
            categories: {
                general: 0,
                dining: 0,
                gas: 0,
                online: 0
            }
        }
    },
    {
        id: "BLINK_YELLOW_SUN",
        bank_ar: "بلينك",
        logo: "../images/banks/blink.png",
        product_name: "Yellow Sun",
        annual_fee_jod: 0,
        interest_rate: "0% (خصم مباشر)",
        minimum_salary_jod: 0,
        rewards: "cashback",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "0%",
        travel_insurance: "لا يوجد",
        rewards_summary: "كاش باك حتى 4% + فائدة حتى 5% سنوياً",
        pros: [
            "مجانية تماماً",
            "تصدر فورياً (افتراضية)",
            "توصيل مجاناً",
            "سحب من جميع صرافات كابيتال مجاناً",
            "إدارة فورية من التطبيق",
            "كاش باك حتى 4%",
            "فائدة على الرصيد حتى 5% سنوياً",
            "فتح حساب في 15 دقيقة بدون أوراق"
        ],
        cons: [
            "محدودة برصيد الحساب",
            "للأردنيين فقط حالياً",
            "العمر 18+"
        ],
        apply_url: "https://blink.jo/",
        rewards_structure: {
            type: "cashback",
            default_rate: 0.02,
            categories: {
                general: 0.02,
                dining: 0.03,
                gas: 0.02,
                online: 0.04
            }
        }
    },
    {
        id: "BLINK_RED_CREDIT",
        bank_ar: "بلينك",
        logo: "../images/banks/blink.png",
        product_name: "Blink الحمراء (ائتمانية)",
        annual_fee_jod: 0,
        interest_rate: "1.50%",
        minimum_salary_jod: 0,
        rewards: "cashback",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "0%",
        travel_insurance: "لا يوجد",
        rewards_summary: "2% كاش باك + تقسيط 0% حتى 12 شهر",
        pros: [
            "مجانية لأول سنة",
            "تصدر فورياً",
            "حد ائتماني حتى 1000 د.أ",
            "بدون تحويل راتب أو كفالة",
            "سحب نقدي",
            "إدارة فورية من التطبيق",
            "تقسيط حتى 12 شهر بفائدة 0%",
            "كاش باك 2%",
            "فتح حساب في 15 دقيقة - هوية فقط"
        ],
        cons: [
            "رسوم سنوية 15 د.أ بعد السنة الأولى",
            "فائدة تأخير 1.5% + 5 د.أ",
            "سحب نقدي: 3% + 1 د.أ",
            "السقف من 200-1000 د.أ"
        ],
        apply_url: "https://blink.jo/",
        rewards_structure: {
            type: "cashback",
            default_rate: 0.02,
            categories: {
                general: 0.02,
                dining: 0.02,
                gas: 0.02,
                online: 0.02
            }
        }
    },
    {
        id: "BLINK_VIRTUAL",
        bank_ar: "بلينك",
        logo: "../images/banks/blink.png",
        product_name: "Blink Virtual (افتراضية)",
        annual_fee_jod: 0,
        interest_rate: "0% (افتراضية)",
        minimum_salary_jod: 0,
        rewards: "low_interest",
        lounge_access: "لا يوجد",
        is_islamic: false,
        foreign_transaction_fee: "0%",
        travel_insurance: "لا يوجد",
        rewards_summary: "لا يوجد",
        pros: [
            "مجانية للجميع",
            "للشراء أونلاين والسحب",
            "تصدر فورياً",
            "بدون رسوم معاملات داخل الأردن",
            "فتح الحساب في 15 دقيقة",
            "بدون أي أوراق أو طوابير",
            "تحويل بالاسم أو رقم الهاتف (CliQ)"
        ],
        cons: [
            "للاستخدام الإلكتروني فقط",
            "مُرتبط بالحساب الجاري",
            "محدودة برصيد الحساب"
        ],
        apply_url: "https://blink.jo/",
        rewards_structure: {
            type: "points",
            default_rate: 0,
            categories: {
                general: 0,
                dining: 0,
                gas: 0,
                online: 0
            }
        }
    }
];