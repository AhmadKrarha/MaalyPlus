/* ══════════════════════════════════════════════════════════════════════════
   محرّك درجة مالي بلس — البطاقات · v4 (آب 2026)

   القاعدة الحاكمة: المعيار الذي لا مدخلة منشورة له **لا يأخذ درجة**، ولا
   يُستبدل غيابه برقم — لا صفراً ولا وسيطاً ولا افتراضاً. يُستبعد وزنه من
   المقام وتُوسم الدرجة «جزئية» بعدد المعايير المحتسبة.

   ما سبق v4 كان يفعل العكس: سعر الفائدة غير المنشور يُستبدل بـ2.0% —
   وهي أعلى من أعلى سعر منشور في السوق (1.99%) — فتُعاقَب البطاقة على
   غياب رقم بأسوأ من أسوأ منافس حقيقي. ثلاث عشرة بطاقة سجّلت صفراً بهذا
   السبب وحده، وأكثرها إسلامية لا تنشر نسبة لأن بنيتها ليست نسبة أصلاً.

   نسخة واحدة يستعملها الجميع (قائمة البطاقات، صفحة التفاصيل، فحص
   التشغيل) — النسخ الثلاث المتطابقة يدوياً كانت تنحرف بلا حارس.
   ══════════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var W = { rate: 0.30, fee: 0.25, features: 0.25, access: 0.20 };

  // أقل من نصف الوزن مُحتسباً ⇒ لا تُنشر درجة إطلاقاً.
  var MIN_COVERAGE = 0.50;

  /* الرصيد المرجعي المُفصح عنه: 500 د.أ محمولة شهراً واحداً.
     محور الكلفة يقيس **دينارات في الشهر على هذا الرصيد**، لا نسبةً مجرّدة —
     وبهذا تدخل كل البنى المقياس نفسه بلا تحيّز:
       نسبة فائدة أو ربح مرابحة  ⟶  500 × النسبة
       رسم إدارة شهري ثابت       ⟶  الرسم كما هو

     لماذا مرساة بالدينار لا «نسبة من سقف البطاقة»: النسبة من السقف تقلب
     الترتيب. بطاقة زين كاش العالمية (40 د.أ على سقف 5000) تبدو الأرخص عند
     استغلال 50% من سقفها (1.60%) والأغلى عند رصيد ثابت 250 د.أ (16%).
     أي مقياس ينقلب بتغيّر مرساته لا يصلح للترتيب. الرصيد الموحّد يزيل هذا. */
  var BENCH_BALANCE = 500;

  // حدّا الدرجة النهائية — مُفصح عنهما في المنهجية.
  var CLAMP_LO = 30, CLAMP_HI = 97;

  function num(v) {
    if (v === null || v === undefined || v === '' || v === 'None') return null;
    var n = parseFloat(String(v).replace('%', '').trim());
    return isNaN(n) ? null : n;
  }

  /* الكلفة الشهرية بالدينار على الرصيد المرجعي، بأحد ثلاثة أحوال:
       rate — نسبة منشورة: فائدة تقليدية أو ربح مرابحة. المحور واحد لأن كلتيهما
              كلفةُ حملِ رصيدٍ شهراً؛ الاختلاف في المسمّى والعقد لا في القياس.
       flat — رسم إدارة شهري ثابت (بنية متوافقة مع الشريعة بلا نسبة).
       null — غير منشورة، أو لا تنطبق (حسم شهري يُسدَّد كاملاً / غير ائتمانية) */
  function rateOf(c) {
    if (!c || c.type !== 'credit') return null;
    if (c.credit_mechanism === 'charge') return null;
    var pub = num(c.interest_rate_monthly);
    // النسبة المنشورة: فائدة تقليدية أو ربح مرابحة — المحور واحد لأن كلتيهما
    // كلفة شهرية على الرصيد المحمول. التسمية تختلف، والقياس لا يختلف.
    if (pub !== null) {
      return { v: BENCH_BALANCE * pub / 100, kind: 'rate', pct: pub,
               term: (c.sharia_compliant || c.is_islamic) ? 'ربح مرابحة' : 'فائدة' };
    }
    // رسم إدارة شهري ثابت (بنية متوافقة مع الشريعة بلا نسبة): الرسم نفسه هو
    // الكلفة الشهرية، ولا يتغيّر بالرصيد — ولذلك يُقارَن كما هو.
    var f = num(c.monthly_fee_jod), L = num(c.credit_limit_jod);
    if (c.rate_basis === 'flat_monthly_fee' && f !== null) {
      return { v: f, kind: 'flat', fee: f, limit: L,
               term: (c.sharia_compliant || c.is_islamic) ? 'رسم إدارة (بنية مرابحة)' : 'رسم إدارة ثابت' };
    }
    return null;
  }

  function feeOf(c) { return c ? num(c.annual_fee_jod) : null; }
  function salOf(c) { return c ? num(c.minimum_salary_jod) : null; }

  /* المزايا: غياب الميزة **حقيقة منشورة** لا نقص بيانات — بطاقة بلا كاش باك
     نعلم أنها بلا كاش باك. لذلك يُحتسب هذا المحور دائماً، وهو الفرق الوحيد
     المشروع عن المحاور الثلاثة الأخرى. */
  function featOf(c) {
    var rwd = String((c && c.rewards) || 'none').toLowerCase(), f = 40;
    if (rwd === 'cashback') f += 20;
    else if (rwd === 'miles') f += 15;
    else if (rwd === 'points') f += 12;
    if (c.travel_benefits) f += 12;
    if (c.welcome_offer && ['لا يوجد', 'none', 'null'].indexOf(String(c.welcome_offer).toLowerCase()) < 0) f += 10;
    if (Array.isArray(c.networks) && c.networks.length > 1) f += 8;
    return Math.min(f, 100);
  }

  // المدى يُبنى من القيم المنشورة وحدها — قيمة مفقودة لا تدخل التطبيع أصلاً.
  function span(vals) {
    var v = [], i;
    for (i = 0; i < vals.length; i++) if (vals[i] !== null) v.push(vals[i]);
    return v.length ? { mn: Math.min.apply(null, v), mx: Math.max.apply(null, v) } : null;
  }

  /* ثلاث حالات للمحور، ولا رابع:
       رقم    — محتسب
       NA     — لا ينطبق على هذه الفئة (لا فئة بطاقات الخصم تنشر راتباً أدنى،
                فالمحور غير موجود لها — وهذا ليس نقص بيانات)
       null   — فجوة بيانات: الفئة تنشر هذا المعيار وهذه البطاقة لا تنشره
     الحالتان الأخيرتان تُخرجان الوزن من المقام، لكن «جزئية» تُوسم بالثانية
     وحدها — لأن وسم منتج بالنقص لأن محوراً لا يخصّه أصلاً تضليل معاكس. */
  var NA = 'n/a';

  function norm(v, s, higher) {
    if (!s) return NA;              // لا قيمة منشورة في الفئة كلها ⇒ المحور غير قائم
    if (v === null) return null;    // الفئة تنشره وهذه لا ⇒ فجوة
    if (s.mx === s.mn) return 50;
    var n = (v - s.mn) / (s.mx - s.mn);
    return (higher ? n : 1 - n) * 100;
  }

  function rateLabel(c, r) {
    if (r && r.kind === 'flat') {
      var eq = (r.fee / BENCH_BALANCE * 100).toFixed(2);
      return r.term + ' ' + r.fee + ' د.أ شهرياً — ثابت لا يتغيّر بالرصيد؛ أي ما يعادل ' +
             eq + '% على الرصيد المرجعي ' + BENCH_BALANCE + ' د.أ' +
             (r.limit ? ' (سقف البطاقة ' + r.limit + ' د.أ)' : '');
    }
    if (r) {
      return r.term + ' ' + r.pct.toFixed(2) + '% شهرياً — أي ' +
             (r.v).toFixed(2) + ' د.أ على الرصيد المرجعي ' + BENCH_BALANCE + ' د.أ';
    }
    if (!c || c.type !== 'credit') return 'لا ينطبق — ليست بطاقة ائتمانية';
    if (c.credit_mechanism === 'charge') return 'لا ينطبق — تُسدَّد كاملة كل شهر فلا كلفة تمويل';
    return 'غير منشورة';
  }

  function score(cards) {
    var byType = {}, ctx = {};
    cards.forEach(function (c) { var t = c.type || 'other'; (byType[t] = byType[t] || []).push(c); });
    Object.keys(byType).forEach(function (t) {
      var g = byType[t];
      ctx[t] = {
        rate: span(g.map(function (c) { var r = rateOf(c); return r ? r.v : null; })),
        fee:  span(g.map(feeOf)),
        sal:  span(g.map(salOf))
      };
    });

    return cards.map(function (c) {
      var X = ctx[c.type || 'other'];
      var r = rateOf(c), fee = feeOf(c), sal = salOf(c);
      var a = {
        // الفائدة لا تنطبق أصلاً على غير الائتمانية وعلى الحسم الشهري
        rate:     (c.type !== 'credit' || c.credit_mechanism === 'charge') ? NA : norm(r ? r.v : null, X.rate, false),
        fee:      norm(fee, X.fee, false),
        features: featOf(c),
        access:   norm(sal, X.sal, false)
      };
      var sum = 0, den = 0, counted = 0, applicable = 0, gaps = [];
      Object.keys(W).forEach(function (k) {
        if (a[k] === NA) return;                       // خارج المقام وخارج حساب النقص
        applicable++;
        if (a[k] === null) { gaps.push(k); return; }   // فجوة: خارج المقام، وتُوسم
        sum += a[k] * W[k]; den += W[k]; counted++;
      });
      var total = den >= MIN_COVERAGE
        ? Math.max(CLAMP_LO, Math.min(CLAMP_HI, Math.round(sum / den)))
        : null;
      var out = function (x) { return (x === NA || x === null) ? null : Math.round(x); };

      return {
        score: total,
        breakdown: { rate: out(a.rate), fee: out(a.fee), features: out(a.features), access: out(a.access) },
        // سبب غياب كل محور صراحةً — «لا ينطبق» شيء و«غير منشور» شيء آخر
        status: { rate: a.rate === NA ? 'na' : a.rate === null ? 'missing' : 'scored',
                  fee:  a.fee  === NA ? 'na' : a.fee  === null ? 'missing' : 'scored',
                  features: 'scored',
                  access: a.access === NA ? 'na' : a.access === null ? 'missing' : 'scored' },
        // القيمة الخام بجانب كل درجة — يجعل أي خطأ مستحيل الإخفاء على القارئ
        inputs: {
          rate:     rateLabel(c, r),
          fee:      fee === null ? 'غير منشورة' : fee + ' د.أ سنوياً',
          features: 'من المكافآت والمزايا المنشورة',
          access:   a.access === NA ? 'لا ينطبق — لا تشترط هذه الفئة راتباً أدنى'
                    : sal === null ? 'غير منشور' : sal + ' د.أ حداً أدنى للراتب'
        },
        coverage: { counted: counted, applicable: applicable, of: 4,
                    weight: Math.round(den * 100), gaps: gaps, partial: gaps.length > 0 },
        rate_kind: r ? r.kind : null
      };
    });
  }

  var API = { score: score, W: W, BENCH_BALANCE: BENCH_BALANCE, MIN_COVERAGE: MIN_COVERAGE,
              CLAMP_LO: CLAMP_LO, CLAMP_HI: CLAMP_HI,
              num: num, rateOf: rateOf, feeOf: feeOf, salOf: salOf, featOf: featOf, rateLabel: rateLabel };

  root.MP_CARD_ENGINE = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
