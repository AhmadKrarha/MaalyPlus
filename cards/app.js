
// ══════════════════════════════════════
// خوارزمية تصنيف مالي بلس v2.0 — البطاقات
// المعايير: فائدة 30% | رسوم 25% | مزايا 25% | راتب 20%
// ══════════════════════════════════════
// نوع الجهة المُصدِرة: «محفظة» = مُصدِر غير مصرفي، البطاقة مرتبطة بمحفظة في التطبيق
// لا بحساب بنكي. العلامات الرقمية التابعة لبنوك (Blink/Reflect/Qawn/ila) تبقى «بنكاً»
// لأن الترخيص والحساب خلفها مصرفيان. السجل بلا الحقل يُعدّ بنكاً (السلوك السابق).
function issuerKind(c) {
    return c && c.issuer_kind === 'wallet' ? 'wallet' : 'bank';
}

/* الدرجة تُحسب في محرّك واحد مشترك (cards/card-engine.js) تستعمله هذه الصفحة
   وصفحة التفاصيل وفحص التشغيل. كانت ثلاث نسخ متطابقة يدوياً، وهو ما سمح
   بانحراف صامت. ما تبقى هنا هو الشارات فقط — لا رياضيات. */
function computeMaalyPlusScores(cards) {
    if (!cards || !cards.length) return cards;
    if (typeof MP_CARD_ENGINE === 'undefined') { console.error('MP_CARD_ENGINE غير محمَّل'); return cards; }
    const R = MP_CARD_ENGINE.score(cards);

    return cards.map((card, i) => {
        const r = R[i];
        const rwd = (card.rewards || 'none').toLowerCase();

        // الشارات تُقرأ من القيمة **المنشورة** لا المُقدَّرة.
        const rawFee = MP_CARD_ENGINE.feeOf(card);
        const rawSal = MP_CARD_ENGINE.salOf(card);
        const tags = [];
        if (rwd === 'cashback' && rawFee === 0)      tags.push({ text: '<svg class="mp-ic"><use href="/images/icons.svg#ic-star"/></svg> الأفضل بدون رسوم + استرداد نقدي', color: '#047857' });
        else if (rwd === 'cashback')                 tags.push({ text: '<svg class="mp-ic"><use href="/images/icons.svg#ic-cash"/></svg> استرداد نقدي',                color: '#047857' });
        else if (rwd === 'miles' || card.travel_benefits) tags.push({ text: '<svg class="mp-ic"><use href="/images/icons.svg#ic-plane"/></svg> الأفضل للسفر',         color: '#1E40AF' });
        else if (rwd === 'points')                   tags.push({ text: '<svg class="mp-ic"><use href="/images/icons.svg#ic-gift"/></svg> نقاط ومكافآت',            color: '#7C3AED' });
        if (card.sharia_compliant)                   tags.push({ text: '<svg class="mp-ic"><use href="/images/icons.svg#ic-crescent"/></svg> متوافقة مع الشريعة', color: '#92400E' });
        else if (rawFee === 0 && tags.length === 0)  tags.push({ text: '🆓 بدون رسوم سنوية',         color: '#0369A1' });
        if (rawSal !== null && rawSal > 0 && rawSal <= 300 && tags.length < 2) tags.push({ text: '<svg class="mp-ic"><use href="/images/icons.svg#ic-grad"/></svg> حدّ راتب أدنى منخفض', color: '#0E7490' });
        // «بدون فائدة» لبطاقات التقسيط الإسلامية بمعدل 0% **منشور** — لا للمجهول
        if (card.credit_mechanism === 'installment' && MP_CARD_ENGINE.num(card.interest_rate_monthly) === 0 && tags.length < 2) tags.push({ text: '<svg class="mp-ic"><use href="/images/icons.svg#ic-sparkle"/></svg> بدون فائدة', color: '#7C3AED' });

        return { ...card, maalyplus_score: r.score, maalyplus_tag: tags[0] || null, maalyplus_tags: tags,
            score_breakdown: r.breakdown, score_status: r.status,
            score_inputs: r.inputs, score_coverage: r.coverage, rate_kind: r.rate_kind };
    });
}

// تحويل تاريخ التحقق (YYYY-MM) إلى نص عربي مقروء
function wrapLatin(s) {
    // لفّ المقاطع اللاتينية (Royal Club, oneworld…) بـ bdi حتى لا يضطرب ترتيبها داخل النص العربي
    if (!s) return s;
    return String(s).replace(/[A-Za-z][A-Za-z0-9 &+'’.\-]*[A-Za-z0-9]|[A-Za-z]/g, m => `<bdi dir="ltr">${m}</bdi>`);
}

function pluralCards(n) {
    if (n === 1) return 'بطاقة واحدة';
    if (n === 2) return 'بطاقتين';
    return n >= 3 && n <= 10 ? `${n} بطاقات` : `${n} بطاقة`;
}

function formatVerifiedDate(d) {
    if (!d) return 'أبريل 2026';
    const months = {
        '01':'يناير','02':'فبراير','03':'مارس','04':'أبريل',
        '05':'مايو','06':'يونيو','07':'يوليو','08':'أغسطس',
        '09':'سبتمبر','10':'أكتوبر','11':'نوفمبر','12':'ديسمبر'
    };
    const m = String(d).match(/^(\d{4})-(\d{2})$/);
    if (!m) return d;
    return (months[m[2]] || m[2]) + ' ' + m[1];
}

function getScoreLabel(score) {
    if (score >= 85) return { text: 'ممتاز',    color: '#047857', bg: '#D1FAE5' };
    if (score >= 72) return { text: 'جيد جداً', color: '#1D4ED8', bg: '#DBEAFE' };
    if (score >= 58) return { text: 'جيد',      color: '#92400E', bg: '#FEF3C7' };
    return              { text: 'مقبول',         color: '#4B5563', bg: '#F3F4F6' };
}

function renderScoreBadge(score) {
    const { text, color, bg } = getScoreLabel(score);
    return `<div title="تقييم مالي بلس لجودة المنتج بمنهجية موحّدة — مستقل عن مدى ملاءمته لوضعك الشخصي" style="display:inline-flex;align-items:center;gap:4px;background:${bg};border-radius:50px;padding:3px 9px;font-size:0.72rem;font-weight:700;color:${color};cursor:help;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="${color}" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        تقييم البطاقة: ${score}/100 — ${text}
    </div>`;
}

// سطر ثقة هادئ: كلمة واحدة + تلميح تفصيلي عند المرور (بدل ثلاث شارات متكررة)
function confidenceWord(card) {
    const c = Number(card.confidence);
    if (c >= 85) return 'بيانات مكتملة';
    if (c >= 70) return 'بيانات جزئية';
    return 'بحاجة تحقق';
}
function confidenceTip(card) {
    const c = Number(card.confidence);
    if (c >= 85) return 'كل الأرقام موثّقة من المصادر الرسمية المنشورة للبنك';
    if (c >= 70) return 'بعض الحقول غير منشورة رسمياً — تحقق من البنك قبل القرار';
    return 'البنك لا ينشر تفاصيل كافية — الأرقام استرشادية، تأكد من الفرع';
}

// درجة ثقة البيانات (§ منهجية التقييم): كاملة / جزئية / بحاجة تحقق — من حقل confidence
function renderConfidenceBadge(card) {
    const c = Number(card.confidence);
    let text, color, bg, tip;
    if (c >= 85)      { text = '✓ البيانات مكتملة';  color = '#047857'; bg = '#ECFDF5'; tip = 'كل الأرقام موثّقة من المصادر الرسمية المنشورة للبنك'; }
    else if (c >= 70) { text = 'بيانات جزئية';    color = '#92400E'; bg = '#FEF3C7'; tip = 'بعض الحقول غير منشورة رسمياً — تحقق من البنك قبل القرار'; }
    else              { text = 'بحاجة تحقق';      color = '#4B5563'; bg = '#F3F4F6'; tip = 'البنك لا ينشر تفاصيل كافية — الأرقام استرشادية، تأكد من الفرع'; }
    return `<span title="${tip}" style="background:${bg};color:${color};padding:2px 8px;border-radius:10px;font-size:.64rem;font-weight:700;cursor:help">${text}</span>`;
}

// ملف المستخدم من الفلاتر الحالية — أساس «مطابقتك٪» (فصل الملاءمة الشخصية عن تقييم المنتج)
function getUserProfile() {
    const val = id => { const el = document.getElementById(id); return el ? el.value : null; };
    const chk = id => { const el = document.getElementById(id); return !!(el && el.checked); };
    const salary = parseInt(val('salaryFilter'), 10);
    const p = {
        salary: isNaN(salary) ? null : salary,
        reward: (val('rewardFilter') && val('rewardFilter') !== 'all') ? val('rewardFilter') : null,
        feeCap: (val('feeFilter') && val('feeFilter') !== 'all') ? parseInt(val('feeFilter'), 10) : null,
        islamic: chk('islamicFilter'),
        lounge: chk('loungeAccessFilter'),
    };
    p.active = p.salary !== null; // الشارة الشخصية تظهر فقط بعد إدخال الراتب — الفلاتر وحدها تعرضها 100% للجميع
    return p;
}

// هل توفر البطاقة دخول صالات؟ (نسخة عامة — نفس منطق جدول المقارنة)
function cardHasLounge(card) {
    const l = String(card.lounge_access_details || '').trim().toLowerCase();
    return !!(l && l !== 'none');
}

// حساب المطابقة الشخصية 0-100 + الأسباب — يقيس ملاءمة البطاقة لمدخلاتك، لا جودتها
function computeMatch(card, p) {
    let earned = 0, possible = 0;
    const why = [];
    if (p.salary !== null) {
        possible += 40;
        const min = card.minimum_salary_jod;
        if (min == null || min === '') { earned += 22; why.push('◦ الحد الأدنى للراتب غير منشور — تحقق من البنك'); }
        else if (p.salary >= Number(min)) {
            const margin = p.salary - Number(min);
            earned += margin >= 200 ? 40 : 32;
            why.push(`✓ راتبك يحقق الحد الأدنى (${min} د.أ)` + (margin >= 200 ? ' بهامش مريح' : ''));
        } else { why.push(`✗ الحد الأدنى (${min} د.أ) أعلى من راتبك`); }
    }
    if (p.reward !== null) {
        possible += 30;
        if (card.rewards === p.reward) { earned += 30; why.push('✓ نوع المكافأة يطابق تفضيلك'); }
        else why.push('✗ نوع المكافأة مختلف عن تفضيلك');
    }
    if (p.feeCap !== null) {
        possible += 20;
        const fee = card.annual_fee_jod;
        if (fee == null || fee === '') { earned += 8; why.push('◦ الرسوم غير منشورة'); }
        else if (Number(fee) <= p.feeCap) { earned += 20; why.push(Number(fee) === 0 ? '✓ بدون رسوم سنوية' : `✓ الرسوم (${fee} د.أ) ضمن حدّك`); }
        else why.push(`✗ الرسوم (${fee} د.أ) فوق حدّك`);
    }
    if (p.islamic) {
        possible += 10;
        if (card.sharia_compliant || card.is_islamic) { earned += 10; why.push('✓ متوافقة مع الشريعة'); }
    }
    if (p.lounge) {
        possible += 15;
        if (cardHasLounge(card)) { earned += 15; why.push('✓ توفر دخول صالات المطارات'); }
        else why.push('✗ لا توفر دخول الصالات');
    }
    if (!possible) return null;
    return { pct: Math.round(earned / possible * 100), why };
}

function renderMatchBadge(card, profile) {
    const m = computeMatch(card, profile);
    if (!m) return '';
    let color, bg;
    if (m.pct >= 75)      { color = '#1E40AF'; bg = '#DBEAFE'; }
    else if (m.pct >= 50) { color = '#1E40AF'; bg = '#EFF6FF'; }
    else                  { color = '#4B5563'; bg = '#F3F4F6'; }
    const tip = 'مطابقة شخصية لمدخلاتك (منفصلة عن تقييم المنتج):\n' + m.why.join('\n');
    return `<div title="${tip.replace(/"/g, '&quot;')}" style="display:inline-flex;align-items:center;gap:4px;background:${bg};border-radius:50px;padding:3px 9px;font-size:0.72rem;font-weight:700;color:${color};cursor:help;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        مطابقتك ${m.pct}%
    </div>`;
}

/**
 * V4.2 - Resilient Version with UI Fixes
 * - Saves comparison list to localStorage.
 * - Adds a details modal for a single-page experience.
 * - Highlights the sorted field on each card for better visual feedback.
 * - Adds checks to prevent script from crashing if modal HTML elements are missing.
 * - Relocated the compare checkbox to the card footer to prevent UI overlap.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. UI Element Selectors
    // =======================================================
    const searchFilterInput = document.getElementById('searchFilter');
    const sortBySelect = document.getElementById('sortBy');
    const bankFilterSelect = document.getElementById('bankFilter');
    const issuerFilterSelect = document.getElementById('issuerFilter');
    const typeFilterSelect = document.getElementById('typeFilter');
    const networkFilterSelect = document.getElementById('networkFilter');
    const salaryFilterInput = document.getElementById('salaryFilter');
    const feeFilterSelect = document.getElementById('feeFilter');
    const rateFilterSelect = document.getElementById('rateFilter');
    const rewardFilterSelect = document.getElementById('rewardFilter');
    const loungeAccessFilterCheckbox = document.getElementById('loungeAccessFilter');
    const islamicFilterCheckbox = document.getElementById('islamicFilter');
    const resetFiltersButton = document.getElementById('resetFilters');
    const cardsGridElement = document.getElementById('cardsGrid');
    const resultsCountElement = document.getElementById('resultsCount');
    const pillsContainer = document.getElementById('pillsContainer');

    const compareFloatContainer = document.getElementById('compareFloatContainer');
    const compareButton = document.getElementById('compareButton');
    const compareCount = document.getElementById('compareCount');
    const compareTooltip = document.getElementById('compareTooltip');

    // -- Modal Selectors --
    const cardModal = document.getElementById('cardModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModal');

    // 2. State Management
    // =======================================================
    let allCards = [];
    let selectedForCompare = JSON.parse(localStorage.getItem('comparisonList')) || [];
    /* قائمة المقارنة تُحفظ بين الزيارات. ظهور «قارن (2/4)» دون أن يضيف المستخدم
       شيئاً في هذه الجلسة يبدو سلوكاً غامضاً — فنقول له صراحةً من أين جاءت. */
    let compareRestored = selectedForCompare.length > 0;
    let topLimit = null; // Set by URL ?top=N — limits results to top N after sorting
    const MAX_COMPARE_ITEMS = 4;
    const PAGE_SIZE = 12;            // عرض تدريجي — تخفيف الازدحام
    let visibleCount = PAGE_SIZE;
    let lastRenderList = [];

    // 3. Initialization
    // =======================================================
    updateCompareButton(); // Update button state on page load
    displaySkeletonLoaders();

    fetch('cards.json?v=20260827')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allCards = computeMaalyPlusScores(data);
            populateBankFilter(allCards);
            applyURLParams(); // Read filters from URL (e.g., when arriving from "من يموّلني" tool)
            buildDiscovery(allCards);
            // وصول برابط عميق (فلاتر/هاش) → افتح مستوى قاعدة البيانات مباشرة
            if (window.location.search.length > 1 || window.location.hash === '#all') showDbLevel(false);
            applyFiltersAndRender();
        })
        .catch(error => {
            console.error('Error fetching cards data:', error);
            cardsGridElement.innerHTML = '<p class="col-span-full text-center text-red-500">حدث خطأ أثناء تحميل بيانات البطاقات.</p>';
        });

    // 4. Event Listeners
    // =======================================================
    const filterElements = [
        searchFilterInput, sortBySelect, bankFilterSelect, issuerFilterSelect, typeFilterSelect,
        networkFilterSelect, salaryFilterInput, feeFilterSelect, rateFilterSelect, rewardFilterSelect,
        loungeAccessFilterCheckbox,
        islamicFilterCheckbox
    ];
    
    filterElements.forEach(el => {
        const eventType = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
        el.addEventListener(eventType, applyFiltersAndRender);
    });
    
    resetFiltersButton.addEventListener('click', resetAllFilters);
    if(compareButton) compareButton.addEventListener('click', ()=>{ try{ if(typeof gtag==='function') gtag('event','card_compared',{count:selectedForCompare.length}); }catch(e){} navigateToComparePage(); });
    
    // -- Modal Listeners (with safety check) --
    if (cardModal && closeModalBtn) {
        closeModalBtn.addEventListener('click', hideCardDetails);
        cardModal.addEventListener('click', (e) => {
            if (e.target === cardModal) { // Close if clicked on the background overlay
                hideCardDetails();
            }
        });
    }


    // --- Functions ---

    function applyFiltersAndRender() {
        let filteredCards = [...allCards];
        // Filtering logic ...
        const searchTerm = searchFilterInput.value.toLowerCase();
        if (searchTerm) filteredCards = filteredCards.filter(c => c.product_name.toLowerCase().includes(searchTerm) || c.bank_ar.toLowerCase().includes(searchTerm));
        if (bankFilterSelect.value !== 'all') filteredCards = filteredCards.filter(c => c.bank_ar === bankFilterSelect.value);
        if (issuerFilterSelect && issuerFilterSelect.value !== 'all') filteredCards = filteredCards.filter(c => issuerKind(c) === issuerFilterSelect.value);
        if (typeFilterSelect.value !== 'all') filteredCards = filteredCards.filter(c => c.type === typeFilterSelect.value);
        if (networkFilterSelect.value !== 'all') filteredCards = filteredCards.filter(c => c.networks && c.networks.includes(networkFilterSelect.value));
        const salary = parseInt(salaryFilterInput.value, 10);
        if (!isNaN(salary)) filteredCards = filteredCards.filter(c => c.minimum_salary_jod === null || c.minimum_salary_jod <= salary);
        if (feeFilterSelect.value !== 'all') {
            switch (feeFilterSelect.value) {
                case '0': filteredCards = filteredCards.filter(c => c.annual_fee_jod === 0); break;
                case '50': filteredCards = filteredCards.filter(c => c.annual_fee_jod < 50); break;
                case '100': filteredCards = filteredCards.filter(c => c.annual_fee_jod <= 100); break;
            }
        }
        if (rewardFilterSelect.value !== 'all') filteredCards = filteredCards.filter(c => c.rewards === rewardFilterSelect.value);
        if (rateFilterSelect.value !== 'all') {
            const threshold = parseFloat(rateFilterSelect.value);
            // Strict parser: returns numeric rate only if the card has one (excludes "Murabaha", "None", null, debit/prepaid).
            const strictRate = (val) => {
                if (val === null || val === undefined) return null;
                const s = String(val).replace('%','').trim();
                if (!s || s.toLowerCase() === 'none' || s.toLowerCase() === 'murabaha') return null;
                const n = parseFloat(s);
                return isNaN(n) ? null : n;
            };
            filteredCards = filteredCards.filter(c => {
                const r = strictRate(c.interest_rate_monthly);
                return r !== null && r <= threshold;
            });
        }
        if (loungeAccessFilterCheckbox.checked) filteredCards = filteredCards.filter(c => c.lounge_access_details);
        if (islamicFilterCheckbox && islamicFilterCheckbox.checked) filteredCards = filteredCards.filter(c => c.sharia_compliant || c.is_islamic);

        sortCards(filteredCards);

        // Track total matching count before "top N" slicing — useful for the banner display
        const totalMatching = filteredCards.length;

        // Apply "top N" limit (used when arriving from "من يموّلني" tool with ?top=3)
        if (topLimit && topLimit > 0 && filteredCards.length > topLimit) {
            filteredCards = filteredCards.slice(0, topLimit);
        }

        updateActiveFilterPills();
        // شارة عدد الفلاتر النشطة على زر «الفلاتر»
        const _fb=document.getElementById('advFiltersBadge');
        if(_fb){ const n=document.getElementById('pillsContainer')?.children.length||0;
                 _fb.style.display=n?'inline-block':'none'; _fb.textContent=n; }
        updateRecommendationBanner(totalMatching);
        visibleCount = PAGE_SIZE;   // أي تغيير فلتر/فرز يعيد الترقيم للصفحة الأولى
        displayCards(filteredCards);
    }

    /* القائمة مُجمَّعة: البنوك ثم المحافظ الرقمية — حتى لا تختلط جهة دفع غير مصرفية
       ببنك في قائمة واحدة طويلة، ويعرف المستخدم أي نوع يختار قبل أن يختار. */
    function populateBankFilter(cards) {
        const groups = [['بنوك', 'bank'], ['محافظ رقمية', 'wallet']];
        groups.forEach(([label, kind]) => {
            const names = [...new Set(cards.filter(c => issuerKind(c) === kind).map(c => c.bank_ar))].sort();
            if (!names.length) return;
            const grp = document.createElement('optgroup');
            grp.label = label;
            names.forEach(bank => {
                const option = document.createElement('option');
                option.value = bank;
                option.textContent = bank;
                grp.appendChild(option);
            });
            bankFilterSelect.appendChild(grp);
        });
    }

    function sortCards(cards) {
        const sortBy = sortBySelect.value;
        switch (sortBy) {
            case 'fee_asc': cards.sort((a, b) => (a.annual_fee_jod ?? Infinity) - (b.annual_fee_jod ?? Infinity)); break;
            case 'fee_desc': cards.sort((a, b) => (b.annual_fee_jod ?? -Infinity) - (a.annual_fee_jod ?? -Infinity)); break;
            case 'salary_asc':
                cards.sort((a, b) => {
                    if (a.minimum_salary_jod === null) return 1;
                    if (b.minimum_salary_jod === null) return -1;
                    return a.minimum_salary_jod - b.minimum_salary_jod;
                });
                break;
            case 'score_desc':
                /* بلا درجة (بياناتها أقل من نصف الوزن) تنزل آخر القائمة ولا تُعامل
                   كصفر — الصفر حكم، وغياب البيانات ليس حكماً. */
                cards.sort((a, b) => {
                    const A = a.maalyplus_score, B = b.maalyplus_score;
                    if (A === null && B === null) return 0;
                    if (A === null) return 1;
                    if (B === null) return -1;
                    return B - A;
                });
                break;
        }
    }
    
    function updateActiveFilterPills() {
        if (!pillsContainer) return;
        pillsContainer.innerHTML = '';
        const createPill = (id, text) => {
            const pill = document.createElement('div');
            pill.className = 'bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center';
            pill.innerHTML = `<span>${text}</span><button data-id="${id}" class="ms-2 text-blue-600 hover:text-blue-900 font-bold">&times;</button>`;
            pill.querySelector('button').addEventListener('click', (e) => {
                const elementToReset = document.getElementById(e.target.dataset.id);
                if (elementToReset.type === 'checkbox') elementToReset.checked = false;
                else elementToReset.value = elementToReset.tagName === 'SELECT' ? 'all' : '';
                applyFiltersAndRender();
            });
            pillsContainer.appendChild(pill);
        };
        if (searchFilterInput.value) createPill('searchFilter', `بحث: ${searchFilterInput.value}`);
        if (bankFilterSelect.value !== 'all') createPill('bankFilter', bankFilterSelect.options[bankFilterSelect.selectedIndex].text);
        if (issuerFilterSelect && issuerFilterSelect.value !== 'all') createPill('issuerFilter', issuerFilterSelect.options[issuerFilterSelect.selectedIndex].text);
        if (typeFilterSelect.value !== 'all') createPill('typeFilter', typeFilterSelect.options[typeFilterSelect.selectedIndex].text);
        if (networkFilterSelect.value !== 'all') createPill('networkFilter', networkFilterSelect.options[networkFilterSelect.selectedIndex].text);
        if (salaryFilterInput.value) createPill('salaryFilter', `الراتب: ${salaryFilterInput.value} د.أ`);
        if (feeFilterSelect.value !== 'all') createPill('feeFilter', feeFilterSelect.options[feeFilterSelect.selectedIndex].text);
        if (rateFilterSelect.value !== 'all') createPill('rateFilter', `الكلفة الشهرية: ${rateFilterSelect.options[rateFilterSelect.selectedIndex].text}`);
        if (rewardFilterSelect.value !== 'all') createPill('rewardFilter', rewardFilterSelect.options[rewardFilterSelect.selectedIndex].text);
        if (loungeAccessFilterCheckbox.checked) createPill('loungeAccessFilter', 'دخول صالات المطارات');
        if (islamicFilterCheckbox && islamicFilterCheckbox.checked) createPill('islamicFilter', '<svg class="mp-ic"><use href="/images/icons.svg#ic-crescent"/></svg> متوافقة مع الشريعة');
    }
    
    function displaySkeletonLoaders(count = 6) {
        if (!cardsGridElement) return;
        cardsGridElement.innerHTML = '';
        resultsCountElement.textContent = 'جاري تحميل البطاقات...';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'bg-white rounded-lg shadow-md border border-gray-100 p-5 animate-pulse';
            skeleton.innerHTML = `<div class="flex items-start mb-4"><div class="w-12 h-12 rounded-full bg-gray-200 me-4 flex-shrink-0"></div><div class="flex-grow"><div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div class="h-3 bg-gray-200 rounded w-1/2"></div></div></div><div class="space-y-3 mt-4"><div class="h-3 bg-gray-200 rounded w-full"></div><div class="h-3 bg-gray-200 rounded w-5/6"></div><div class="h-3 bg-gray-200 rounded w-full"></div></div><div class="mt-4 pt-4 border-t border-gray-100"><div class="h-8 bg-gray-200 rounded w-1/3 ml-auto"></div></div>`;
            cardsGridElement.appendChild(skeleton);
        }
    }

    function displayCards(cards) {
        if (!cardsGridElement) return;
        cardsGridElement.innerHTML = '';
        lastRenderList = cards;
        const shown = Math.min(visibleCount, cards.length);
        resultsCountElement.textContent = cards.length > shown
            ? `عرض ${shown} من أصل ${pluralCards(cards.length)}`
            : `تم العثور على ${pluralCards(cards.length)}`;
        const sortBy = sortBySelect.value;
    
        if (cards.length === 0) {
            cardsGridElement.innerHTML = '<p class="col-span-full text-center text-neutral-dark-gray-1 py-10">لا توجد بطاقات تطابق خيارات البحث.</p>';
            return;
        }

        // ملف المستخدم الحالي (من الفلاتر) — يُحسب مرة واحدة لكل عملية عرض
        const userProfile = getUserProfile();

        cards.slice(0, visibleCount).forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'bg-neutral-white rounded-lg shadow-md border border-neutral-light-gray-2 p-5 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1';
            
            const isSelected = selectedForCompare.includes(card.id);
            const networksHTML = (card.networks || []).map(net => `<img src="../images/${net.toLowerCase()}.png" alt="${net}" class="w-auto h-5" onerror="this.style.display='none'">`).join('');
            const isIslamicBank = (card.bank_ar || '').includes('إسلام') || (card.bank_ar || '').includes('اسلام');
            const shariaTag = (card.sharia_compliant || card.is_islamic) && !isIslamicBank ? `<span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">✓ متوافقة مع الشريعة</span>` : 
                              (card.sharia_compliant || card.is_islamic) ? `<span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">✓ متوافقة مع الشريعة</span>` : '';
            /* ثلاث حالات صريحة: درجة كاملة · درجة جزئية موسومة بعدد المعايير
               المحتسبة · لا درجة لأن المنشور أقل من نصف الوزن. */
            const cov = card.score_coverage;
            const scoreBadge = card.maalyplus_score !== null && card.maalyplus_score !== undefined
                ? renderScoreBadge(card.maalyplus_score) + (cov && cov.partial
                    ? `<span title="حُسبت الدرجة من ${cov.counted} معايير من ${cov.applicable} تنطبق على هذه البطاقة — الباقي غير منشور، ولم يُستبدل برقم" style="display:inline-flex;align-items:center;gap:3px;background:#FEF3C7;color:#92400E;border-radius:50px;padding:3px 9px;font-size:.7rem;font-weight:700;cursor:help;margin-inline-start:4px">درجة جزئية ${cov.counted}/${cov.applicable}</span>` : '')
                : `<span title="المنشور من معايير هذه البطاقة أقل من نصف الوزن — لا نمنحها درجة بدل تلفيق واحدة" style="display:inline-flex;align-items:center;gap:3px;background:#F3F4F6;color:#4B5563;border-radius:50px;padding:3px 9px;font-size:.72rem;font-weight:700;cursor:help">لا درجة — بيانات غير كافية</span>`;
            const allTags = card.maalyplus_tags && card.maalyplus_tags.length ? card.maalyplus_tags : (card.maalyplus_tag ? [card.maalyplus_tag] : []);
            const tagBadge = allTags.map(t => `<span style="display:inline-block;background:${t.color}18;color:${t.color};border-radius:50px;padding:2px 8px;font-size:.7rem;font-weight:600;margin-right:4px;">${t.text}</span>`).join('');
            
            let feeStyle = "font-semibold";
            let salaryStyle = "font-semibold";
            if (sortBy === 'fee_asc' || sortBy === 'fee_desc') feeStyle = "font-bold text-primary-blue";
            if (sortBy === 'salary_asc') salaryStyle = "font-bold text-primary-blue";
    
            cardElement.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-start">
                        <img src="../${card.logo}?v=20260724" alt="${card.bank_ar}" class="w-12 h-12 rounded-full border p-1 me-4 flex-shrink-0" onerror="this.style.display='none'">
                        <div>
                            <h3 class="font-bold text-lg text-primary-blue-dark">${wrapLatin(card.product_name)}</h3>
                            <p class="text-sm text-neutral-dark-gray-1">${card.bank_ar}${issuerKind(card)==='wallet' ? ` <span title="جهة غير مصرفية — البطاقة مرتبطة بمحفظة رقمية لا بحساب بنكي" style="background:#EEF2FF;color:#3730A3;border-radius:50px;padding:1px 7px;font-size:.68rem;font-weight:700;white-space:nowrap">محفظة رقمية</span>` : ''}</p>
                            <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:3px;">${tagBadge}${scoreBadge}${card.segment ? `<span title="مخصّصة لفئة معيّنة — تحقّق من الشرط" style="background:#EFF6FF;color:#1E40AF;border-radius:50px;padding:2px 8px;font-size:.7rem;font-weight:700"><svg class="mp-ic"><use href="/images/icons.svg#ic-grad"/></svg> ${card.segment}${card.age_min?` ${card.age_min}–${card.age_max}`:''}</span>` : ''}${card.credit_mechanism==='charge' ? `<span title="يُسدَّد رصيدها كاملاً كل شهر — ليست حداً متجدداً" style="background:#F3F4F6;color:#374151;border-radius:50px;padding:2px 8px;font-size:.7rem;font-weight:700"><svg class="mp-ic"><use href="/images/icons.svg#ic-calendar"/></svg> حسم شهري</span>` : ''}${userProfile.active ? renderMatchBadge(card, userProfile) : ''}</div>
                        </div>
                    </div>
                    <div class="flex space-x-2 items-center flex-shrink-0">${networksHTML}</div>
                </div>
                <div class="flex-grow space-y-3 text-sm text-neutral-dark-gray-1">
                    <p><span class="${feeStyle}">الرسوم السنوية:</span> ${card.annual_fee_jod === 0 ? 'بدون رسوم' : (card.annual_fee_jod == null ? 'غير منشورة؛ يُرجى التحقق من البنك' : `${card.annual_fee_jod} د.أ سنوياً`)}</p>
                    <p><span class="${salaryStyle}">الحد الأدنى للراتب:</span> ${card.minimum_salary_jod ? `${card.minimum_salary_jod} د.أ` : 'غير معلن'}</p>
                    <p><span class="font-semibold">المكافأة:</span> ${wrapLatin(card.reward_summary) || 'لا يوجد'}</p>
                </div>
                <div class="mp-trustline" title="${confidenceTip(card)}">
                    آخر تحديث ${formatVerifiedDate(card.last_verified)} · ${confidenceWord(card)} · <a href="../methodology.html" target="_blank" rel="noopener">المنهجية</a>
                </div>
                <div class="mt-3 pt-3">
                    <div class="flex justify-between items-center">
                        
                        <div>
                            <input type="checkbox" id="compare-${card.id}" data-card-id="${card.id}" class="compare-checkbox hidden" ${isSelected ? 'checked' : ''} aria-label="أضف ${card.product_name} من ${card.bank_ar} إلى المقارنة">
                            <label for="compare-${card.id}" class="mp-cmp-toggle ${isSelected ? 'is-on' : ''}">
                                <span class="mp-cmp-box">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                                </span>
                                <span class="mp-cmp-text">${isSelected ? 'تمت الإضافة' : 'أضف للمقارنة'}</span>
                            </label>
                        </div>

                        <div class="flex items-center h-full">${shariaTag}</div>

                        <div class="flex items-center gap-2">
                          <button data-card-id="${card.id}" class="details-button bg-primary-blue-dark text-white py-2 px-4 rounded-lg font-semibold hover:bg-neutral-dark-gray-2 transition-colors text-sm">عرض التفاصيل</button>
                          <a href="details.html?id=${encodeURIComponent(card.id)}" title="فتح في صفحة منفصلة" class="text-primary-blue hover:text-primary-blue-dark p-2 mp-tap44" aria-label="افتح في صفحة منفصلة">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </a>
                        </div>
                    </div>
                </div>`;
            cardsGridElement.appendChild(cardElement);
        });

        /* زر «عرض المزيد» — تخفيف ازدحام القائمة الكاملة */
        if (cards.length > visibleCount) {
            const more = document.createElement('div');
            more.style.cssText = 'grid-column:1/-1;text-align:center;padding:.75rem 0 .25rem';
            const remaining = cards.length - visibleCount;
            more.innerHTML = `<button onclick="showMoreCards()" style="background:#fff;color:#1E40AF;border:1.5px solid #1E40AF;border-radius:50px;padding:.7rem 2rem;font-family:inherit;font-weight:700;font-size:.9rem;cursor:pointer">عرض المزيد (${Math.min(PAGE_SIZE, remaining)} من ${remaining} المتبقية) ↓</button>`;
            cardsGridElement.appendChild(more);
        }

        document.querySelectorAll('.compare-checkbox').forEach(c => c.addEventListener('change', handleCompareSelection));
        document.querySelectorAll('.details-button').forEach(b => b.addEventListener('click', () => showCardDetails(b.dataset.cardId)));
    }
    window.showMoreCards = function(){
        visibleCount += PAGE_SIZE;
        displayCards(lastRenderList);
        try{ if(typeof gtag==='function') gtag('event','cards_show_more',{visible:visibleCount}); }catch(e){}
    };

    /* ══ المستوى الأول: الاكتشاف — تصنيفات جاهزة وأفضل البطاقات والبنوك ══ */
    window.showDbLevel = function(scroll=true){
        const db=document.getElementById('dbLevel'); if(!db) return;
        db.style.display='block';
        if(scroll) db.scrollIntoView({behavior:'smooth'});
        try{ if(typeof gtag==='function') gtag('event','view_all_cards'); }catch(e){}
    };
    window.toggleAdvFilters = function(){
        const p=document.getElementById('advFilters'); if(!p) return;
        p.style.display = p.style.display==='none' ? 'block' : 'none';
    };
    function buildDiscovery(cards){
        const tilesEl=document.getElementById('needTiles');
        if(!tilesEl) return;
        const salaryOk=(c,cap)=>{const m=c.minimum_salary_jod; return m!=null&&m!==''&&Number(m)<=cap;};
        const easy=(c)=>{const m=c.minimum_salary_jod; return m==null||m===''||Number(m)<=400;};
        const TILES=[
            ['ic-percent','#047857','بدون رسوم سنوية', c=>c.annual_fee_jod===0, '?fee=0'],
            ['ic-cash','#047857','استرداد نقدي', c=>String(c.rewards).toLowerCase()==='cashback', '?rewards=cashback'],
            ['ic-briefcase','#1E40AF','السفر وصالات المطارات', c=>cardHasLounge(c), '?lounge=true'],
            ['ic-plane','#1E40AF','أميال الطيران', c=>String(c.rewards).toLowerCase()==='miles', '?rewards=miles'],
            ['ic-gift','#7C3AED','نقاط ومكافآت', c=>String(c.rewards).toLowerCase()==='points', '?rewards=points'],
            ['ic-crescent','#0E7490','متوافقة مع الشريعة', c=>c.sharia_compliant||c.is_islamic, '?islamic=true'],
            ['ic-wallet','#B45309','راتب شهري أقل من 500 د.أ.', c=>salaryOk(c,500), '?salary=500'],
            ['ic-check-circle','#047857','سهلة القبول', easy, '?salary=400'],
        ];
        tilesEl.innerHTML = TILES.map(([ic,col,label,fn,q])=>{
            const n=cards.filter(fn).length;
            return `<a href="cards.html${q}" style="background:#fff;border:1.5px solid #E5E7EB;border-radius:14px;padding:1rem .9rem;text-decoration:none;display:flex;flex-direction:column;gap:6px;transition:all .15s" onmouseover="this.style.borderColor='#1E40AF'" onmouseout="this.style.borderColor='#E5E7EB'">
                <svg class="mp-ic" style="width:1.6rem;height:1.6rem;color:${col}"><use href="/images/icons.svg#${ic}"/></svg>
                <span style="font-weight:800;color:#1E2B3C;font-size:.92rem">${label}</span>
                <span style="font-size:.75rem;color:#6B7280">${n} بطاقة</span></a>`;
        }).join('');
        /* «أفضل 3» عامة أُزيلت عمداً — لا توجد أفضل بطاقة للجميع؛ الترشيح الشخصي عبر المستشار */
        /* البنوك — المحافظ مستثناة، لها قسمها الخاص أدناه */
        const bc=document.getElementById('bankChips');
        if(bc){
            const counts={};
            cards.filter(c=>issuerKind(c)==='bank').forEach(c=>{counts[c.bank_ar]=(counts[c.bank_ar]||0)+1;});
            const topBanks=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
            bc.innerHTML = topBanks.map(([b,n])=>`<a class="mp-chip" href="cards.html?bank=${encodeURIComponent(b)}" style="background:#fff;border:1.5px solid #E5E7EB;border-radius:50px;padding:.5rem 1.1rem;font-size:.83rem;font-weight:700;color:#1E2B3C;text-decoration:none">${b} <span style="color:#6B7280;font-weight:600">(${n})</span></a>`).join('')
                + `<button class="mp-chip" onclick="showDbLevel()" style="background:#EFF6FF;border:1.5px solid #1E40AF;color:#1E40AF;border-radius:50px;padding:.5rem 1.1rem;font-size:.83rem;font-weight:700;cursor:pointer;font-family:inherit">المزيد ↓</button>`;
        }
        /* المحافظ الرقمية — جهات قليلة، فتُعرض كلها بلا «المزيد» */
        const wc=document.getElementById('walletChips');
        if(wc){
            const wallets=cards.filter(c=>issuerKind(c)==='wallet');
            const ws=document.getElementById('walletSection');
            if(!wallets.length){ if(ws) ws.style.display='none'; }
            else {
                const counts={};
                wallets.forEach(c=>{counts[c.bank_ar]=(counts[c.bank_ar]||0)+1;});
                wc.innerHTML = Object.entries(counts).sort((a,b)=>b[1]-a[1])
                    .map(([b,n])=>`<a class="mp-chip" href="cards.html?bank=${encodeURIComponent(b)}" style="background:#fff;border:1.5px solid #C7D2FE;border-radius:50px;padding:.5rem 1.1rem;font-size:.83rem;font-weight:700;color:#1E2B3C;text-decoration:none">${b} <span style="color:#6B7280;font-weight:600">(${n})</span></a>`).join('')
                    + `<a class="mp-chip" href="cards.html?issuer=wallet" style="background:#EEF2FF;border:1.5px solid #4338CA;color:#3730A3;border-radius:50px;padding:.5rem 1.1rem;font-size:.83rem;font-weight:700;text-decoration:none">كل بطاقات المحافظ (${wallets.length}) ←</a>`;
            }
        }
    }

    function handleCompareSelection(event) {
        const cardId = event.target.dataset.cardId;
        const isChecked = event.target.checked;
        if (isChecked) {
            if (selectedForCompare.length < MAX_COMPARE_ITEMS) {
                selectedForCompare.push(cardId);
        compareRestored = false;
            } else {
                showTooltip(`يمكنك مقارنة حتى ${MAX_COMPARE_ITEMS} بطاقات فقط.`);
                event.target.checked = false; // Prevent checking the box
            }
        } else {
            selectedForCompare = selectedForCompare.filter(id => id !== cardId);
        }
        localStorage.setItem('comparisonList', JSON.stringify(selectedForCompare));
        updateCompareButton();
        applyFiltersAndRender();
    }

    function renderRestoredNote() {
        const bar = document.getElementById('compareFloatContainer');
        if (!bar) return;
        let note = document.getElementById('compareRestoredNote');
        if (!compareRestored || selectedForCompare.length === 0) {
            if (note) note.remove();
            return;
        }
        if (note) return;
        note = document.createElement('div');
        note.id = 'compareRestoredNote';
        note.className = 'text-xs leading-relaxed';
        note.style.cssText = 'background:#FFFBEB;border:1px solid #FDE68A;color:#78350F;' +
            'border-radius:10px;padding:.5rem .8rem;margin:0 0 .5rem;display:flex;' +
            'align-items:center;gap:.6rem;flex-wrap:wrap;justify-content:space-between';
        const n = selectedForCompare.length;
        const word = n === 1 ? 'بطاقة واحدة محفوظة' : (n === 2 ? 'بطاقتان محفوظتان' : n + ' بطاقات محفوظة');
        note.innerHTML = '<span>هذه مقارنة من زيارة سابقة — ' + word +
            ' في متصفحك، لم تُضَف الآن.</span>' +
            '<button type="button" id="compareRestoredClear" style="background:#fff;border:1.5px solid #FDE68A;' +
            'color:#92400E;border-radius:8px;padding:.3rem .9rem;font-weight:700;cursor:pointer;font-family:inherit">' +
            'ابدأ مقارنة جديدة</button>';
        bar.insertBefore(note, bar.firstChild);
        const btn = document.getElementById('compareRestoredClear');
        if (btn) btn.addEventListener('click', () => { compareRestored = false; clearAllFromCompare(); });
    }

    function updateCompareButton() {
        if (!compareFloatContainer) return;
        const count = selectedForCompare.length;
        compareCount.textContent = count + ' / ' + MAX_COMPARE_ITEMS;
        renderRestoredNote();
        if (count > 0) {
            compareFloatContainer.classList.remove('translate-y-full');
            document.body.classList.add('pb-28');
        } else {
            compareFloatContainer.classList.add('translate-y-full');
            document.body.classList.remove('pb-28');
        }
        compareButton.disabled = count < 2 || count > MAX_COMPARE_ITEMS;
        renderCompareTray();
    }

    function renderCompareTray() {
        const chipsContainer = document.getElementById('compareChips');
        if (!chipsContainer) return;
        if (selectedForCompare.length === 0) { chipsContainer.innerHTML = ''; return; }
        chipsContainer.innerHTML = selectedForCompare.map(id => {
            const card = allCards.find(c => c.id === id);
            if (!card) return '';
            const safeId = String(card.id).replace(/'/g, "\\'");
            const bankName = (card.bank_ar || '').replace(/</g, '&lt;');
            const productName = (card.product_name || '').replace(/</g, '&lt;');
            return `
            <div class="flex items-center bg-blue-50 border border-blue-200 rounded-full ps-1 pe-3 py-1 flex-shrink-0">
                <button type="button" onclick="window.removeFromCompare('${safeId}')"
                        class="w-7 h-7 rounded-full bg-blue-100 hover:bg-red-100 text-blue-700 hover:text-red-600 flex items-center justify-center text-base font-bold transition me-2 leading-none"
                        aria-label="إزالة من المقارنة" title="إزالة">×</button>
                <div class="text-xs leading-tight">
                    <div class="font-bold text-blue-900">${bankName}</div>
                    <div class="text-neutral-dark-gray-1 truncate" style="max-width:130px;">${productName}</div>
                </div>
            </div>`;
        }).join('');
    }

    function syncCardCheckboxState(cardId) {
        const cb = document.getElementById('compare-' + cardId);
        if (!cb) return;
        const isSelected = selectedForCompare.includes(cardId);
        cb.checked = isSelected;
        const label = document.querySelector(`label[for="compare-${cardId}"]`);
        if (label) {
            label.classList.toggle('is-on', isSelected);
            const txt = label.querySelector('.mp-cmp-text');
            if (txt) txt.textContent = isSelected ? 'تمت الإضافة' : 'أضف للمقارنة';
        }
    }

    function removeFromCompare(cardId, fromModal) {
        if (!selectedForCompare.includes(cardId)) return;
        selectedForCompare = selectedForCompare.filter(id => id !== cardId);
        localStorage.setItem('comparisonList', JSON.stringify(selectedForCompare));
        syncCardCheckboxState(cardId);
        updateCompareButton();
        if (fromModal) {
            if (selectedForCompare.length < 2) {
                hideCompareModal();
            } else {
                const remaining = selectedForCompare.map(id => allCards.find(c => c.id === id)).filter(Boolean);
                showCompareModal(remaining);
            }
        }
    }
    window.removeFromCompare = removeFromCompare;

    function clearAllFromCompare() {
        const ids = [...selectedForCompare];
        selectedForCompare = [];
        localStorage.removeItem('comparisonList');
        ids.forEach(syncCardCheckboxState);
        updateCompareButton();
        hideCompareModal();
    }
    const _clearBtn = document.getElementById('clearCompareBtn');
    if (_clearBtn) _clearBtn.addEventListener('click', clearAllFromCompare);

    function navigateToComparePage() {
        if (compareButton.disabled) return;
        const cards = selectedForCompare.map(id => allCards.find(c => c.id === id)).filter(Boolean);
        if (cards.length < 2) return;
        showCompareModal(cards);
    }

    function showCompareModal(cards) {
        const modal = document.getElementById('compareModal');
        const body  = document.getElementById('compareModalBody');
        if (!modal || !body) return;

        const rwd = c => String(c.rewards || '').toLowerCase();
        const hasLounge = c => {
            const l = String(c.lounge_access_details || '').trim().toLowerCase();
            return l && l !== 'none';
        };
        const UNK = '<span class="mp-unk">غير معلن</span>';
        const fields = [
            { label: 'البنك',                  fn: c => c.bank_ar || UNK },
            { label: 'اسم البطاقة',            fn: c => c.product_name || UNK },
            { label: 'الرسوم السنوية',          fn: c => c.annual_fee_jod === 0 ? '<span class="text-green-600 font-bold">بدون رسوم</span>' : (c.annual_fee_jod ? c.annual_fee_jod + ' د.أ' : '—') },
            { label: 'الكلفة الشهرية',         fn: c => (c.score_inputs && c.score_inputs.rate) ? c.score_inputs.rate : (c.interest_rate_monthly || UNK) },
            { label: 'الراتب المطلوب',          fn: c => c.minimum_salary_jod ? c.minimum_salary_jod + ' د.أ' : UNK },
            { label: 'استرداد نقدي',                fn: c => rwd(c) === 'cashback' ? '<span class="text-green-600 font-bold">✅ نعم</span>' : '<span class="mp-no">لا</span>' },
            { label: 'نقاط / أميال',           fn: c => { const r = rwd(c); return r === 'miles' ? '✅ أميال' : r === 'points' ? '✅ نقاط' : '<span class="mp-no">لا</span>'; } },
            { label: 'مزايا السفر',            fn: c => c.travel_benefits ? '<span class="text-blue-600 font-bold">✅ نعم</span>' : '<span class="mp-no">لا</span>' },
            { label: 'دخول الصالات',           fn: c => hasLounge(c) ? '<span class="text-blue-600 font-bold">✅ متاح</span>' : '<span class="mp-no">لا</span>' },
            { label: 'متوافقة مع الشريعة', fn: c => c.sharia_compliant ? '<span style="color:#047857;font-weight:700">✅ نعم</span>' : '<span class="mp-no">لا</span>' },
            { label: 'رسوم خارجية',            fn: c => c.foreign_transaction_fee_percent || UNK },
        ];

        const colW = Math.floor(100 / (cards.length + 1));

        let html = `<table style="width:100%;border-collapse:collapse;font-family:var(--font-body);font-size:.88rem;">
            <thead>
                <tr style="background:#F8FAFF;">
                    <th style="padding:12px 14px;text-align:right;color:#6B7280;font-weight:600;width:${colW}%;border-bottom:2px solid #E5E7EB;">المعيار</th>
                    ${cards.map(c => {
                        const safeId = String(c.id).replace(/'/g, "\\'");
                        return `<th style="padding:28px 10px 12px;text-align:center;width:${colW}%;border-bottom:2px solid #1E40AF;position:relative;">
                            <button type="button" onclick="window.removeFromCompare('${safeId}', true)"
                                    style="position:absolute;top:6px;left:6px;width:24px;height:24px;border-radius:50%;background:#FEE2E2;color:#DC2626;border:none;cursor:pointer;font-weight:bold;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;transition:all .15s;"
                                    onmouseover="this.style.background='#DC2626';this.style.color='#fff';"
                                    onmouseout="this.style.background='#FEE2E2';this.style.color='#DC2626';"
                                    aria-label="إزالة من المقارنة" title="إزالة من المقارنة">×</button>
                            <div style="font-family:var(--font-heading);font-size:.82rem;color:#1E2B3C;font-weight:900;">${c.bank_ar}</div>
                            <div style="font-size:.75rem;color:#6B7280;margin-top:2px;">${c.product_name || ''}</div>
                        </th>`;
                    }).join('')}
                </tr>
            </thead>
            <tbody>
                ${fields.map((f, i) => `
                <tr style="background:${i%2===0?'#fff':'#F8FAFF'};">
                    <td style="padding:11px 14px;color:#374151;font-weight:600;border-bottom:1px solid #F3F4F6;">${f.label}</td>
                    ${cards.map(c => `<td style="padding:11px 10px;text-align:center;border-bottom:1px solid #F3F4F6;color:#1F2937;">${f.fn(c)}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
        </table>
        <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap;align-items:center;">
            ${cards.map(c => `<a href="../cards/cards.html" style="flex:1;min-width:140px;display:flex;align-items:center;justify-content:center;padding:10px 16px;background:linear-gradient(135deg,#1E40AF,#047857);color:#fff;border-radius:50px;font-weight:700;font-size:.85rem;text-decoration:none;text-align:center;">
                تقدم لـ ${c.bank_ar}
            </a>`).join('')}
            <button onclick="shareCompare()" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#F3F4F6;border:1.5px solid #E5E7EB;border-radius:50px;font-weight:700;font-size:.85rem;cursor:pointer;color:#374151;font-family:var(--font-body);">
                🔗 شارك المقارنة
            </button>
        </div>`;

        body.innerHTML = html;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function hideCompareModal() {
        const modal = document.getElementById('compareModal');
        if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    }
    window.hideCompareModal = hideCompareModal;
    function shareCompare() {
        const ids = selectedForCompare.join(',');
        const url = window.location.origin + window.location.pathname + '?compare=' + ids;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showTooltip('✅ تم نسخ رابط المقارنة!');
            });
        } else {
            prompt('انسخ الرابط:', url);
        }
    }
    window.shareCompare = shareCompare;
    
    function showTooltip(message) {
        if (!compareTooltip) return;
        compareTooltip.textContent = message;
        setTimeout(() => {
            compareTooltip.textContent = '';
        }, 3000);
    }
    
    // -- Modal Functions --
    function showCardDetails(cardId) {
        const card = allCards.find(c => c.id === cardId);
        if (!card || !cardModal) return;

        modalTitle.textContent = card.product_name;
        modalBody.innerHTML = `
            <div class="flex items-center mb-4 pb-4 border-b border-neutral-light-gray-2">
                <img src="../${card.logo}?v=20260724" class="w-12 h-12 rounded-full me-4 border p-1" onerror="this.style.display='none'">
                <div>
                    <h2 class="text-xl font-bold font-heading text-primary-blue-dark">${card.product_name}</h2>
                    <p class="text-neutral-dark-gray-1">${card.bank_ar}</p>
                </div>
            </div>
            <div class="space-y-4">
                <div>
                    <h3 class="font-bold text-neutral-dark-gray-2 mb-2">أهم المزايا:</h3>
                    <ul class="list-disc list-inside space-y-2 text-neutral-dark-gray-1">
                        ${(card.key_features || []).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-neutral-dark-gray-2 mb-2">تفاصيل الرسوم:</h3>
                    <ul class="list-disc list-inside space-y-2 text-neutral-dark-gray-1">
                        <li><strong>الرسوم السنوية:</strong> ${card.annual_fee_jod === 0 ? 'لا يوجد' : (card.annual_fee_jod == null ? 'غير منشورة' : card.annual_fee_jod + ' دينار أردني')}</li>
                        <li><strong>الكلفة الشهرية:</strong> ${(card.score_inputs && card.score_inputs.rate) || card.interest_rate_monthly || 'لا ينطبق'}</li>
                        <li><strong>رسوم المعاملات الأجنبية:</strong> ${card.foreign_transaction_fee_percent || 'لا ينطبق'}</li>
                    </ul>
                </div>
                ${card.lounge_access_details ? `<div><h3 class="font-bold text-neutral-dark-gray-2 mb-2">دخول صالات المطارات:</h3><p class="text-neutral-dark-gray-1">${card.lounge_access_details}</p></div>` : ''}
            </div>
        `;
        cardModal.classList.remove('hidden');
        cardModal.classList.add('flex');
    }

    function hideCardDetails() {
        if (!cardModal) return;
        cardModal.classList.add('hidden');
        cardModal.classList.remove('flex');
    }

    function resetAllFilters() {
        filterElements.forEach(el => {
            if (el.type === 'checkbox') el.checked = false;
            else if (el.tagName === 'SELECT') el.value = 'all';
            else el.value = '';
        });
        topLimit = null;
        selectedForCompare = [];
        localStorage.removeItem('comparisonList');
        updateCompareButton();
        applyFiltersAndRender();
    }

    // Reads URL search params and applies them to filter inputs.
    // Used when arriving from the "من يموّلني" tool (start.html) which links here with
    // params like ?type=credit&salary=600&fee=100&top=3 to show pre-filtered top results.
    function applyURLParams() {
        const params = new URLSearchParams(window.location.search);
        if (![...params.keys()].length) return;

        const t = params.get('type');
        if (t && ['credit','debit','prepaid'].includes(t)) typeFilterSelect.value = t;

        const b = params.get('bank');
        if (b && Array.from(bankFilterSelect.options).some(o => o.value === b)) {
            bankFilterSelect.value = b;
        }

        const iss = params.get('issuer');
        if (iss && ['bank','wallet'].includes(iss) && issuerFilterSelect) issuerFilterSelect.value = iss;

        const n = params.get('network');
        if (n && ['Visa','Mastercard'].includes(n)) networkFilterSelect.value = n;

        const s = params.get('salary');
        if (s && !isNaN(parseInt(s, 10))) salaryFilterInput.value = s;

        const f = params.get('fee');
        if (f && ['0','50','100'].includes(f)) feeFilterSelect.value = f;

        const r = params.get('rate');
        if (r && Array.from(rateFilterSelect.options).some(o => o.value === r)) {
            rateFilterSelect.value = r;
        }

        const rw = params.get('rewards');
        if (rw && ['cashback','points','miles'].includes(rw)) rewardFilterSelect.value = rw;

        if (params.get('lounge') === 'true') loungeAccessFilterCheckbox.checked = true;
        if (params.get('islamic') === 'true' && islamicFilterCheckbox) islamicFilterCheckbox.checked = true;

        const top = parseInt(params.get('top'), 10);
        if (top && top > 0 && top <= 20) topLimit = top;

        /* بحث نصّي حر قادم من الصفحة الرئيسية: ?q=... */
        const q = params.get('q');
        if (q && searchFilterInput) searchFilterInput.value = q;
    }

    function updateRecommendationBanner(totalMatching) {
        const banner = document.getElementById('recommendationBanner');
        if (!banner) return;
        const recCount = document.getElementById('recCount');
        const recTotal = document.getElementById('recTotal');
        if (topLimit) {
            banner.classList.remove('hidden');
            const shown = Math.min(topLimit, totalMatching || topLimit);
            if (recCount) recCount.textContent = shown;
            if (recTotal) {
                if (totalMatching && totalMatching > shown) {
                    recTotal.textContent = ' من أصل ' + (totalMatching === 2 ? 'بطاقتين مطابقتين' : pluralCards(totalMatching) + ' مطابقة');
                } else {
                    recTotal.textContent = '';
                }
            }
        } else {
            banner.classList.add('hidden');
        }
    }

    function clearRecommendation() {
        topLimit = null;
        // Strip ?top= from URL so reload doesn't re-apply the limit; keep other filters intact in UI
        if (window.history && window.history.replaceState) {
            const url = new URL(window.location.href);
            url.searchParams.delete('top');
            window.history.replaceState(null, '', url.pathname + (url.search || ''));
        }
        applyFiltersAndRender();
    }
    const _clearRecBtn = document.getElementById('clearRecBtn');
    if (_clearRecBtn) _clearRecBtn.addEventListener('click', clearRecommendation);
});