document.addEventListener('DOMContentLoaded', () => {
    // ── Selectors ──
    const grid = document.getElementById('companiesGrid');
    const resultsCount = document.getElementById('resultsCount');
    const searchInput = document.getElementById('searchFilter');
    const typeFilter = document.getElementById('typeFilter');
    const shariaFilter = document.getElementById('shariaFilter');
    const collateralFilter = document.getElementById('collateralFilter');
    const maxAmountFilter = document.getElementById('maxAmountFilter');
    const resetBtn = document.getElementById('resetFilters');
    const sortSelect = document.getElementById('sortBy');

    let allCompanies = [];

    // ── Fetch Data ──
    displaySkeletons();
    fetch('microfinance.json?v=20260723')
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(data => { allCompanies = data; renderAll(); })
        .catch(() => {
            grid.innerHTML = '<p class="col-span-full text-center text-red-500 py-10">حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
        });

    // ── Listeners ──
    [searchInput, typeFilter, shariaFilter, collateralFilter, maxAmountFilter, sortSelect].forEach(el => {
        if (!el) return;
        el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', renderAll);
    });
    resetBtn?.addEventListener('click', resetFilters);

    function resetFilters() {
        if (searchInput) searchInput.value = '';
        if (typeFilter) typeFilter.value = 'all';
        if (shariaFilter) shariaFilter.value = 'all';
        if (collateralFilter) collateralFilter.value = 'all';
        if (maxAmountFilter) maxAmountFilter.value = '';
        if (sortSelect) sortSelect.value = 'rating';
        renderAll();
    }

    function renderAll() {
        let filtered = [...allCompanies];

        // Search
        const q = searchInput?.value.trim().toLowerCase() || '';
        if (q) {
            filtered = filtered.filter(c =>
                c.name_ar.toLowerCase().includes(q) ||
                c.name_en.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.target_audience.some(t => t.toLowerCase().includes(q))
            );
        }

        // Type
        const type = typeFilter?.value || 'all';
        if (type !== 'all') filtered = filtered.filter(c => c.type === type);

        // Sharia
        const sharia = shariaFilter?.value || 'all';
        if (sharia === 'yes') filtered = filtered.filter(c => c.sharia_compliant);
        if (sharia === 'no') filtered = filtered.filter(c => !c.sharia_compliant);

        // Collateral
        const collateral = collateralFilter?.value || 'all';
        if (collateral === 'no') filtered = filtered.filter(c => c.no_collateral);

        // Requested amount: keep only companies whose lending range covers it
        const maxAmt = parseInt(maxAmountFilter?.value) || 0;
        if (maxAmt > 0) filtered = filtered.filter(c => c.min_loan_jod <= maxAmt && c.max_loan_jod >= maxAmt);

        // Sort
        const sort = sortSelect?.value || 'rating';
        filtered.sort((a, b) => {
            if (sort === 'rating') return b.rating - a.rating;
            if (sort === 'max_loan_asc') return a.max_loan_jod - b.max_loan_jod;
            if (sort === 'max_loan_desc') return b.max_loan_jod - a.max_loan_jod;
            if (sort === 'min_loan_asc') return a.min_loan_jod - b.min_loan_jod;
            if (sort === 'branches') return b.branches - a.branches;
            return 0;
        });

        if (resultsCount) resultsCount.textContent = `${filtered.length} شركة`;
        grid.innerHTML = filtered.length ? filtered.map(renderCard).join('') : emptyState();

        // Attach modal listeners
        grid.querySelectorAll('[data-open-modal]').forEach(btn => {
            btn.addEventListener('click', () => openModal(btn.dataset.openModal));
        });
    }

    function renderCard(c) {
        const stars = renderStars(c.rating);
        const islamicBadge = c.sharia_compliant
            ? `<span class="badge-islamic">متوافق مع الشريعة</span>` : '';
        const noCollateralBadge = c.no_collateral
            ? `<span class="badge-no-collateral">بدون ضمانات</span>` : '';
        const digitalBadge = c.digital_application
            ? `<span class="badge-digital">تقديم إلكتروني</span>` : '';
        const features = c.key_features.slice(0, 3).map(f =>
            `<li class="feature-item"><span class="feature-dot"></span>${f}</li>`).join('');

        return `
        <div class="company-card" data-id="${c.id}">
            <div class="card-header">
                <div class="logo-wrap" style="background:${c.logo_color}20; border-color:${c.logo_color}30">
                    <img src="${c.logo}" alt="${c.name_ar}" class="logo-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="logo-fallback" style="display:none; background:${c.logo_color||'#1E40AF'}; color:#fff">
                        ${c.logo_fallback_text}
                    </div>
                </div>
                <div class="card-title-wrap">
                    <h3 class="company-name">${c.name_ar}</h3>
                    <p class="company-tagline">${c.tagline}</p>
                    <div class="stars-row">${stars}<span class="rating-val">${c.rating}</span></div>
                </div>
            </div>

            <div class="badges-row">
                ${islamicBadge}${noCollateralBadge}${digitalBadge}
                <span class="badge-category">${c.category}</span>
            </div>

            <div class="stats-grid">
                <div class="stat-box">
                    <span class="stat-label">أدنى تمويل</span>
                    <span class="stat-value">${c.min_loan_jod.toLocaleString()} د.أ</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">أعلى تمويل</span>
                    <span class="stat-value">${c.max_loan_jod.toLocaleString()} د.أ</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">الفروع</span>
                    <span class="stat-value">${c.branches}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">الموافقة</span>
                    <span class="stat-value small">${c.approval_speed}</span>
                </div>
            </div>

            <ul class="features-list">${features}</ul>

            <div class="disclaimer-note">
                ⚠️ الأسعار والشروط تُحدد عند التقديم — تحقق من الموقع الرسمي
            </div>
            <div class="card-footer">
                <button class="btn-details" data-open-modal="${c.id}">عرض التفاصيل</button>
                <a href="${c.apply_url}" target="_blank" rel="noopener" class="btn-apply">تقدم الآن ←</a>
            </div>
        </div>`;
    }

    function openModal(id) {
        const c = allCompanies.find(x => x.id === id);
        if (!c) return;
        const modal = document.getElementById('companyModal');
        const modalBody = document.getElementById('modalBody');
        if (!modal || !modalBody) return;

        const products = c.products.map(p => `
            <div class="product-row">
                <div class="product-name">${p.name}</div>
                <div class="product-meta">
                    <span>💰 ${p.min_amount_jod.toLocaleString()} – ${p.max_amount_jod.toLocaleString()} د.أ</span>
                    <span>📅 حتى ${p.max_duration_months} شهر</span>
                    <span>📊 ${p.interest_rate}</span>
                    <span>${p.collateral_required ? '🔒 يستلزم ضمانة' : '✅ بدون ضمانة'}</span>
                    <span>${p.guarantor_required ? '👥 يستلزم كفيل' : '✅ بدون كفيل'}</span>
                </div>
                <div class="product-target">الفئة: ${p.target}</div>
            </div>`).join('');

        const pros = c.pros.map(p => `<li class="pro-item">✓ ${p}</li>`).join('');
        const cons = c.cons.map(p => `<li class="con-item">✗ ${p}</li>`).join('');
        const audience = c.target_audience.map(a => `<span class="audience-pill">${a}</span>`).join('');

        modalBody.innerHTML = `
            <div class="modal-logo-row">
                <div class="modal-logo" style="background:${c.logo_color}20; border-color:${c.logo_color}40">
                    <img src="${c.logo}" alt="${c.name_ar}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div style="display:none; background:${c.logo_color}; color:#fff; width:100%; height:100%; align-items:center; justify-content:center; font-weight:700; font-size:1.1rem; border-radius:8px">${c.logo_fallback_text}</div>
                </div>
                <div>
                    <h2 class="modal-company-name">${c.name_ar}</h2>
                    <p class="modal-company-en">${c.name_en}</p>
                    <div class="modal-badges">
                        ${c.sharia_compliant ? '<span class="badge-islamic">متوافق مع الشريعة</span>' : ''}
                        ${c.no_collateral ? '<span class="badge-no-collateral">بدون ضمانات</span>' : ''}
                        <span class="badge-category">${c.category}</span>
                    </div>
                </div>
            </div>
            <p class="modal-desc">${c.description}</p>
            <div class="modal-audience"><strong>الفئات المستهدفة:</strong><br/>${audience}</div>
            <h4 class="modal-section-title">المنتجات التمويلية</h4>
            <div class="products-list">${products}</div>
            <div class="pros-cons-grid">
                <div>
                    <h4 class="modal-section-title">المزايا</h4>
                    <ul>${pros}</ul>
                </div>
                <div>
                    <h4 class="modal-section-title">العيوب</h4>
                    <ul>${cons}</ul>
                </div>
            </div>
            <div class="modal-footer-btns">
                <a href="${c.website}" target="_blank" rel="noopener" class="btn-website">زيارة الموقع</a>
                <a href="${c.apply_url}" target="_blank" rel="noopener" class="btn-apply">تقدم الآن ←</a>
            </div>`;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('companyModal')?.addEventListener('click', e => {
        if (e.target.id === 'companyModal') closeModal();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    function closeModal() {
        document.getElementById('companyModal')?.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function renderStars(rating) {
        return Array.from({ length: 5 }, (_, i) =>
            `<span class="${i < Math.round(rating) ? 'star-filled' : 'star-empty'}">★</span>`
        ).join('');
    }

    function emptyState() {
        return `<div class="empty-state col-span-full">
            <div class="empty-icon">🔍</div>
            <h3>لا توجد نتائج</h3>
            <p>جرّب تعديل معايير البحث أو إعادة تعيين الفلاتر</p>
            <button onclick="document.getElementById('resetFilters').click()" class="btn-reset-empty">إعادة تعيين</button>
        </div>`;
    }

    function displaySkeletons() {
        grid.innerHTML = Array(6).fill(`
            <div class="skeleton-card">
                <div class="sk sk-logo"></div>
                <div class="sk sk-title"></div>
                <div class="sk sk-text"></div>
                <div class="sk sk-text short"></div>
                <div class="sk sk-stats"></div>
            </div>`).join('');
    }
});
