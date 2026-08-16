// ═══════════════════════════════════════════
// app.js - الملف الكامل مع جميع التحسينات
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    // --- Element Selectors ---
    const form = document.getElementById('recommendationForm');
    const resultsSection = document.getElementById('resultsSection');
    const questionnaireSection = document.getElementById('questionnaireSection');
    const recommendationCardsEl = document.getElementById('recommendationCards');
    const noResultsEl = document.getElementById('noResults');
    const recommendationSummaryEl = document.getElementById('recommendationSummary');
    const modal = document.getElementById('comparisonModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const sortByEl = document.getElementById('sortBy');
    const bankFiltersEl = document.getElementById('bankFilters');
    const loungeFilter = document.getElementById('filter_lounge');
    const noFeesFilter = document.getElementById('filter_no_fees');
    const islamicFilter = document.getElementById('filter_islamic');
    const toastEl = document.getElementById('toastNotification');
    const stickyBar = document.getElementById('stickyCompareBar');
    const stickyContent = document.getElementById('stickyCompareContent');
    const copyCompareBtn = document.getElementById('copyCompareBtn');
    const detailsCompareBtn = document.getElementById('detailsCompareBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const printBtn = document.getElementById('printBtn');
    const shareBtn = document.getElementById('shareBtn');
    const editSearchBtn = document.getElementById('editSearchBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    let selectedCardsForComparison = new Set();
    let allScoredCards = [];
    let currentUserAnswers = null;

    // ═══════════════════════════════════════════
    // Helper Functions
    // ═══════════════════════════════════════════
    
    function showToast(message) { 
        if (!toastEl) return;
        toastEl.textContent = message; 
        toastEl.classList.add('show'); 
        setTimeout(() => { toastEl.classList.remove('show'); }, 3000); 
    }
    
    const getGoalText = (goal) => ({ 
        cashback: 'الكاش باك', 
        travel: 'السفر', 
        points: 'النقاط', 
        low_interest: 'الفائدة المنخفضة' 
    }[goal] || 'خياراتك');

    // ═══════════════════════════════════════════
    // Progress Bar Logic
    // ═══════════════════════════════════════════
    
    function updateProgress() {
        if (!progressFill || !progressText) return;
        
        const requiredFields = [
            document.getElementById('monthlySalary'),
            document.getElementById('mainGoal'),
            document.querySelector('input[name="feePreference"]:checked'),
            document.querySelector('input[name="paymentMethod"]:checked')
        ];
        
        const optionalFields = [
            document.getElementById('spend_general'),
            document.getElementById('spend_dining'),
            document.getElementById('spend_gas'),
            document.getElementById('spend_online'),
            document.getElementById('travelFrequency')
        ];
        
        let filledRequired = requiredFields.filter(field => 
            field && field.value && field.value.trim() !== ''
        ).length;
        
        let filledOptional = optionalFields.filter(field => 
            field && field.value && field.value.trim() !== ''
        ).length;
        
        const requiredProgress = (filledRequired / requiredFields.length) * 70;
        const optionalProgress = (filledOptional / optionalFields.length) * 30;
        const totalProgress = Math.round(requiredProgress + optionalProgress);
        
        progressFill.style.width = totalProgress + '%';
        progressText.textContent = totalProgress + '% مكتمل';
        
        if (totalProgress === 100) {
            progressText.textContent = '✓ جاهز للإرسال!';
            progressText.style.color = '#10b981';
        }
    }

    // ═══════════════════════════════════════════
    // Core Logic - Calculations
    // ═══════════════════════════════════════════
    
    function calculateAnnualRewards(card, spending) { 
        if (!card.rewards_summary) return 0; 
        let totalRewards = 0; 
        const annualSpend = Object.keys(spending).reduce((acc, key) => { 
            acc[key] = (spending[key] || 0) * 12; 
            return acc; 
        }, {}); 
        
        if (card.rewards_structure && card.rewards_structure.type === 'cashback') { 
            for (const category in annualSpend) { 
                totalRewards += annualSpend[category] * (card.rewards_structure.categories?.[category] || card.rewards_structure.default_rate || 0); 
            } 
        } 
        return totalRewards; 
    }
    
    function calculateMatchScore(cards, answers, spending) { 
        return cards.map(card => { 
            if (card.minimum_salary_jod > answers.monthlySalary) { 
                return { ...card, matchScore: 0 }; 
            } 
            
            let score = 50; 
            const annualRewards = calculateAnnualRewards(card, spending); 
            const netValue = annualRewards - card.annual_fee_jod; 
            
            if (netValue > 50) { 
                score += 25; 
            } else if (netValue > 0) { 
                score += 10; 
            } else if (netValue < -50) { 
                score -= 15; 
            } 
            
            if (answers.mainGoal === card.rewards) { 
                score += 20; 
            } 
            
            if (answers.paymentMethod === 'minimum') { 
                const interestRate = parseFloat(card.interest_rate); 
                if (card.rewards === 'low_interest' || interestRate <= 1.60) { 
                    score += 25; 
                } else if (interestRate <= 1.70) { 
                    score += 10; 
                } 
            } 
            
            if (answers.mainGoal === 'travel' && (card.lounge_access && card.lounge_access !== "لا يوجد")) { 
                score += 15; 
            } 
            
            if (answers.feePreference === 'no' && card.annual_fee_jod === 0) { 
                score += 15; 
            } 
            
            if (answers.travelFrequency === 'often' && (card.lounge_access && card.lounge_access !== "لا يوجد")) { 
                score += 15; 
            } 
            
            const finalScore = Math.max(10, Math.min(99, Math.round(score))); 
            return { ...card, matchScore: finalScore, annualRewards, netValue }; 
        }).sort((a, b) => b.matchScore - a.matchScore); 
    }

    // ═══════════════════════════════════════════
    // Star Rating System
    // ═══════════════════════════════════════════
    
    function calculateStarRating(card) {
        const ratings = {
            rewards: 0,
            fees: 0,
            accessibility: 0,
            overall: 0
        };
        
        // تقييم المكافآت (من 5)
        const annualRewards = card.annualRewards || 0;
        if (annualRewards > 200) ratings.rewards = 5;
        else if (annualRewards > 100) ratings.rewards = 4;
        else if (annualRewards > 50) ratings.rewards = 3;
        else if (annualRewards > 20) ratings.rewards = 2;
        else ratings.rewards = 1;
        
        // تقييم الرسوم (من 5)
        if (card.annual_fee_jod === 0) ratings.fees = 5;
        else if (card.annual_fee_jod < 50) ratings.fees = 4;
        else if (card.annual_fee_jod < 100) ratings.fees = 3;
        else if (card.annual_fee_jod < 150) ratings.fees = 2;
        else ratings.fees = 1;
        
        // تقييم سهولة القبول (من 5)
        if (card.minimum_salary_jod < 400) ratings.accessibility = 5;
        else if (card.minimum_salary_jod < 700) ratings.accessibility = 4;
        else if (card.minimum_salary_jod < 1200) ratings.accessibility = 3;
        else if (card.minimum_salary_jod < 2000) ratings.accessibility = 2;
        else ratings.accessibility = 1;
        
        // التقييم الإجمالي
        ratings.overall = ((ratings.rewards + ratings.fees + ratings.accessibility) / 3).toFixed(1);
        
        return ratings;
    }
    
    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let html = '<div class="star-rating">';
        
        for (let i = 0; i < fullStars; i++) {
            html += '<span class="star filled">★</span>';
        }
        
        if (hasHalfStar) {
            html += '<span class="star half">★</span>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            html += '<span class="star empty">☆</span>';
        }
        
        html += `<span class="rating-number">${rating}/5</span>`;
        html += '</div>';
        
        return html;
    }
    
    // ═══════════════════════════════════════════
    // Rendering Functions
    // ═══════════════════════════════════════════
    
    function renderProsCons(card) { 
        let html = '<div class="pros-cons-container">'; 
        
        if (card.pros && card.pros.length > 0) { 
            html += '<div class="pros"><ul>'; 
            card.pros.forEach(pro => { 
                html += `<li><span class="icon">✔</span>${pro}</li>`; 
            }); 
            html += '</ul></div>'; 
        } 
        
        if (card.cons && card.cons.length > 0) { 
            html += '<div class="cons"><ul>'; 
            card.cons.forEach(con => { 
                html += `<li><span class="icon">✗</span>${con}</li>`; 
            }); 
            html += '</ul></div>'; 
        } 
        
        html += '</div>'; 
        return html; 
    }
    
    function renderCard(card, isTopPick = false) {
        const ratings = calculateStarRating(card);
        const topCard = allScoredCards[0];
        let compareHTML = '';
        
        // Quick Compare Tooltip
        if (!isTopPick && topCard) {
            const feeDiff = topCard.annual_fee_jod - card.annual_fee_jod;
            const rewardsDiff = (card.annualRewards || 0) - (topCard.annualRewards || 0);
            const netValueDiff = (card.netValue || 0) - (topCard.netValue || 0);
            
            compareHTML = `
            <div class="quick-compare-tooltip">
                <h5>⚡ مقارنة مع الأفضل</h5>
                <div class="quick-compare-item">
                    <span>الرسوم السنوية:</span>
                    <span class="${feeDiff > 0 ? 'quick-compare-better' : feeDiff < 0 ? 'quick-compare-worse' : 'quick-compare-same'}">
                        ${feeDiff > 0 ? '▼' : feeDiff < 0 ? '▲' : '='} ${Math.abs(feeDiff)} د.أ
                    </span>
                </div>
                <div class="quick-compare-item">
                    <span>المكافآت:</span>
                    <span class="${rewardsDiff > 0 ? 'quick-compare-better' : rewardsDiff < 0 ? 'quick-compare-worse' : 'quick-compare-same'}">
                        ${rewardsDiff > 0 ? '▲' : rewardsDiff < 0 ? '▼' : '='} ${Math.abs(Math.round(rewardsDiff))} د.أ
                    </span>
                </div>
                <div class="quick-compare-item">
                    <span>القيمة الصافية:</span>
                    <span class="${netValueDiff > 0 ? 'quick-compare-better' : netValueDiff < 0 ? 'quick-compare-worse' : 'quick-compare-same'}">
                        ${netValueDiff > 0 ? '▲' : netValueDiff < 0 ? '▼' : '='} ${Math.abs(Math.round(netValueDiff))} د.أ
                    </span>
                </div>
            </div>
            `;
        }
        
        return `
        <div class="card-recommendation ${isTopPick ? 'top-pick' : ''}" data-card-id="${card.id}">
            ${isTopPick ? '<div class="top-pick-badge">الأكثر توافقاً</div>' : ''}
            ${compareHTML}
            
            <div class="card-header">
                <div class="card-main-info">
                    <img src="../${card.logo}" alt="${card.bank_ar}" class="bank-logo">
                    <div class="card-title-area">
                        <h3>${card.product_name}</h3>
                        <p>${card.bank_ar}</p>
                    </div>
                </div>
                <div class="card-side-info">
                    <div class="match-score">
                        <div class="score-circle" style="--score: ${card.matchScore}">
                            <span>${card.matchScore}%</span>
                        </div>
                    </div>
                    <div class="compare-checkbox-container">
                        <input type="checkbox" id="compare_${card.id}" class="compare-checkbox" ${selectedCardsForComparison.has(card.id) ? 'checked' : ''}>
                        <label for="compare_${card.id}">قارن</label>
                    </div>
                </div>
            </div>
            
            <div class="card-body-content">
                <div class="card-details">
                    <p><strong>المكافآت السنوية (تقديري):</strong> <span class="positive">~${Math.round(card.annualRewards || 0)} د.أ</span></p>
                    <p><strong>الرسوم السنوية:</strong> ${card.annual_fee_jod === 0 ? 'مجانية' : `${card.annual_fee_jod} د.أ`}</p>
                    <p><strong>القيمة الصافية لك:</strong> <strong class="${card.netValue >= 0 ? 'positive' : 'negative'}">~${Math.round(card.netValue || 0)} د.أ</strong></p>
                </div>
                
                <div class="rating-breakdown">
                    <div class="rating-item">
                        <span class="rating-label">التقييم الإجمالي</span>
                        ${renderStars(ratings.overall)}
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">المكافآت</span>
                        ${renderStars(ratings.rewards)}
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">الرسوم</span>
                        ${renderStars(ratings.fees)}
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">سهولة القبول</span>
                        ${renderStars(ratings.accessibility)}
                    </div>
                </div>
                
                ${renderProsCons(card)}
            </div>
            
            <a href="${card.apply_url}" target="_blank" class="cta-button">اطلبها الآن</a>
        </div>`;
    }

    // ═══════════════════════════════════════════
    // Comparison Chart
    // ═══════════════════════════════════════════
    
    function renderComparisonChart(cardsToCompare) {
        const chartContainer = document.getElementById('comparisonChart');
        if (!chartContainer) return;
        
        let html = '';
        
        // Chart 1: الرسوم السنوية
        html += '<div class="chart-bar-container">';
        html += '<div class="chart-label"><span>الرسوم السنوية</span><span>أقل = أفضل</span></div>';
        html += '<div class="chart-bars">';
        
        const maxFee = Math.max(...cardsToCompare.map(c => c.annual_fee_jod), 1);
        cardsToCompare.forEach(card => {
            const heightPercent = (card.annual_fee_jod / maxFee) * 100;
            html += `
                <div class="chart-bar" style="height: ${heightPercent}%; background: linear-gradient(to top, #ef4444, #f87171);">
                    <div class="chart-bar-value">${card.annual_fee_jod} د.أ</div>
                    <div class="chart-bar-label">${card.product_name.split(' ')[0]}</div>
                </div>
            `;
        });
        html += '</div></div>';
        
        // Chart 2: القيمة الصافية
        html += '<div class="chart-bar-container">';
        html += '<div class="chart-label"><span>القيمة الصافية السنوية</span><span>أعلى = أفضل</span></div>';
        html += '<div class="chart-bars">';
        
        const maxValue = Math.max(...cardsToCompare.map(c => Math.abs(c.netValue || 0)), 1);
        cardsToCompare.forEach(card => {
            const netValue = card.netValue || 0;
            const heightPercent = (Math.abs(netValue) / maxValue) * 100;
            const color = netValue >= 0 ? 'linear-gradient(to top, #10b981, #34d399)' : 'linear-gradient(to top, #ef4444, #f87171)';
            html += `
                <div class="chart-bar" style="height: ${heightPercent}%; background: ${color};">
                    <div class="chart-bar-value">${netValue >= 0 ? '+' : ''}${Math.round(netValue)} د.أ</div>
                    <div class="chart-bar-label">${card.product_name.split(' ')[0]}</div>
                </div>
            `;
        });
        html += '</div></div>';
        
        // Legend
        html += '<div class="chart-legend">';
        cardsToCompare.forEach(card => {
            const color = card.netValue >= 0 ? '#10b981' : '#ef4444';
            html += `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${color};"></div>
                    <span>${card.product_name}</span>
                </div>
            `;
        });
        html += '</div>';
        
        chartContainer.innerHTML = html;
    }

    // ═══════════════════════════════════════════
    // Comparison Table
    // ═══════════════════════════════════════════

    function renderComparisonTable(cardIds) {
        const cardsToCompare = ALL_CARDS_DATA.filter(card => cardIds.has(card.id));
        
        if (cardsToCompare.length < 2) {
            showToast('⚠️ يرجى اختيار بطاقتين على الأقل للمقارنة');
            return;
        }
        
        // رسم الرسم البياني
        renderComparisonChart(cardsToCompare);
        
        const features = [ 
            { label: 'الرسوم السنوية', key: 'annual_fee_jod', format: v => `${v} د.أ`, lowerIsBetter: true }, 
            { label: 'نسبة الفائدة', key: 'interest_rate', lowerIsBetter: true }, 
            { label: 'الحد الأدنى للراتب', key: 'minimum_salary_jod', format: v => `${v} د.أ`, lowerIsBetter: true }, 
            { label: 'دخول صالات المطار', key: 'lounge_access' }, 
            { label: 'رسوم العمليات الدولية', key: 'foreign_transaction_fee', lowerIsBetter: true }, 
            { label: 'تأمين السفر', key: 'travel_insurance' } 
        ];
        
        let tableHTML = '<table class="comparison-table"><thead><tr><th>الميزة</th>';
        cardsToCompare.forEach(c => { 
            tableHTML += `<th><img src="../${c.logo}" alt="${c.bank_ar}" class="bank-logo"><h3>${c.product_name}</h3></th>`; 
        });
        tableHTML += '</tr></thead><tbody>';
        
        features.forEach(f => {
            const values = cardsToCompare.map(c => c[f.key]);
            let bestValue;
            if (f.lowerIsBetter) {
                const numericValues = values.map(v => parseFloat(v) || Infinity);
                bestValue = Math.min(...numericValues);
            }
            tableHTML += `<tr><th scope="row">${f.label}</th>`;
            cardsToCompare.forEach((c, index) => {
                const value = values[index];
                let displayValue = value || '—';
                if (f.format && typeof value === 'number') displayValue = f.format(value);
                const isBest = bestValue !== undefined && (parseFloat(value) || Infinity) === bestValue;
                tableHTML += `<td data-label="${f.label}" class="${isBest ? 'is-best' : ''}">${displayValue}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        const modalContainer = document.getElementById('comparisonTableContainer');
        if (modalContainer) {
            modalContainer.innerHTML = tableHTML;
            modal.style.display = 'flex';
        }
    }
    
    // ═══════════════════════════════════════════
    // Sticky Compare Bar
    // ═══════════════════════════════════════════
    
    function updateStickyCompareBar() {
        if (!stickyBar || !stickyContent) return;
        
        if (selectedCardsForComparison.size < 2) {
            stickyBar.classList.remove('visible');
            document.body.classList.remove('compare-bar-active');
            return;
        }
        
        const cardsToCompare = ALL_CARDS_DATA.filter(card => selectedCardsForComparison.has(card.id));
        const features = [ 
            { label: 'أهم المكافآت', key: 'rewards_summary' }, 
            { label: 'الرسوم السنوية', key: 'annual_fee_jod', format: v => `${v} د.أ` }, 
            { label: 'حد الدخل', key: 'minimum_salary_jod', format: v => `${v} د.أ` }, 
            { label: 'الفائدة الشهرية', key: 'interest_rate' } 
        ];
        
        let html = '<table><thead><tr><th></th>';
        cardsToCompare.forEach(c => { 
            html += `<th><img src="../${c.logo}" alt="${c.bank_ar}" class="sticky-bank-logo">${c.product_name}</th>`; 
        });
        html += '</tr></thead><tbody>';
        
        features.forEach(f => {
            html += `<tr><td>${f.label}</td>`;
            cardsToCompare.forEach(c => {
                let value = c[f.key] === 0 ? 0 : (c[f.key] || '—');
                if (f.format && typeof value === 'number') value = f.format(value);
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        stickyContent.innerHTML = html;
        stickyBar.classList.add('visible');
        document.body.classList.add('compare-bar-active');
    }

    // ═══════════════════════════════════════════
    // Display and Filter Functions
    // ═══════════════════════════════════════════

    function displayCards(cards) { 
        if (!recommendationCardsEl || !noResultsEl) return;
        
        recommendationCardsEl.innerHTML = ''; 
        noResultsEl.style.display = 'none'; 
        
        if (cards.length === 0) { 
            noResultsEl.style.display = 'block'; 
            noResultsEl.innerHTML = `<h4>لا توجد نتائج تطابق بحثك</h4><p>حاول تعديل الفلاتر أو مسحها للحصول على نتائج.</p>`; 
        } else { 
            cards.forEach((card, index) => { 
                const isTopPick = index === 0 && sortByEl.value === 'matchScore'; 
                recommendationCardsEl.innerHTML += renderCard(card, isTopPick); 
            }); 
        } 
    }
    
    function applyFiltersAndSort() {
        if (!sortByEl || !bankFiltersEl) return;
        
        const sortBy = sortByEl.value;
        const selectedBanks = Array.from(bankFiltersEl.querySelectorAll('input:checked')).map(input => input.value);
        
        let filteredCards = allScoredCards.filter(card => 
            card.matchScore > 0 && 
            (!loungeFilter || !loungeFilter.checked || (card.lounge_access && card.lounge_access !== "لا يوجد")) && 
            (!noFeesFilter || !noFeesFilter.checked || card.annual_fee_jod === 0) && 
            (!islamicFilter || !islamicFilter.checked || card.is_islamic) && 
            (selectedBanks.length === 0 || selectedBanks.includes(card.bank_ar))
        );
        
        switch (sortBy) { 
            case 'netValue': 
                filteredCards.sort((a, b) => b.netValue - a.netValue); 
                break; 
            case 'annualFee': 
                filteredCards.sort((a, b) => a.annual_fee_jod - b.annual_fee_jod); 
                break; 
            default: 
                filteredCards.sort((a, b) => b.matchScore - a.matchScore); 
                break; 
        }
        
        displayCards(filteredCards);
    }

    // ═══════════════════════════════════════════
    // Smart Alerts System
    // ═══════════════════════════════════════════
    
    function showSmartAlerts(userAnswers, scoredCards) {
        const alertsContainer = document.getElementById('smartAlerts');
        if (!alertsContainer) return;
        
        let alerts = [];
        const topCard = scoredCards[0];
        
        // تنبيه: راتب منخفض
        if (userAnswers.monthlySalary < 500) {
            alerts.push({
                type: 'info',
                icon: '💡',
                title: 'معلومة مفيدة',
                message: `راتبك ${userAnswers.monthlySalary} د.أ يؤهلك لـ ${scoredCards.filter(c => c.matchScore > 0).length} بطاقات فقط. للحصول على مزيد من الخيارات، يمكنك الانتظار حتى يزيد راتبك.`
            });
        }
        
        // تنبيه: توفير كبير
        if (topCard && topCard.netValue > 50) {
            alerts.push({
                type: 'success',
                icon: '🎉',
                title: 'فرصة ممتازة!',
                message: `البطاقة الأفضل لك ستوفر لك ${Math.round(topCard.netValue)} د.أ سنوياً! هذا يعني ${Math.round(topCard.netValue / 12)} د.أ شهرياً.`
            });
        }
        
        // تنبيه: رسوم عالية مقابل مكافآت قليلة
        if (topCard && topCard.annual_fee_jod > 100 && topCard.annualRewards < 150) {
            alerts.push({
                type: 'warning',
                icon: '⚠️',
                title: 'انتبه!',
                message: `البطاقة الأفضل لها رسوم ${topCard.annual_fee_jod} د.أ ولكن المكافآت محدودة. تأكد أنك ستستفيد من مزايا أخرى كصالات المطار.`
            });
        }
        
        // نصيحة: بطاقة مجانية متاحة
        const freeCards = scoredCards.filter(c => c.annual_fee_jod === 0 && c.matchScore > 60);
        if (freeCards.length > 0 && topCard && topCard.annual_fee_jod > 0) {
            alerts.push({
                type: 'tip',
                icon: '💡',
                title: 'نصيحة',
                message: `لديك ${freeCards.length} بطاقة مجانية بتقييم جيد! إذا كنت لا تسافر كثيراً، قد تكون خياراً أفضل.`
            });
        }
        
        // نصيحة: السفر
        if (userAnswers.mainGoal === 'travel' && userAnswers.travelFrequency === 'rarely') {
            alerts.push({
                type: 'tip',
                icon: '✈️',
                title: 'هل تعلم؟',
                message: 'ذكرت أن السفر مهم لك، لكنك لا تسافر كثيراً. قد يكون الكاش باك خياراً أفضل لك!'
            });
        }
        
        // نصيحة: الفائدة
        if (userAnswers.paymentMethod === 'minimum') {
            const lowInterestCards = scoredCards.filter(c => parseFloat(c.interest_rate) < 1.60);
            if (lowInterestCards.length > 0) {
                alerts.push({
                    type: 'warning',
                    icon: '📊',
                    title: 'مهم!',
                    message: `بما أنك تدفع الحد الأدنى أحياناً، ننصحك ببطاقة بفائدة منخفضة. لديك ${lowInterestCards.length} خيارات بفائدة أقل من 1.60%.`
                });
            }
        }
        
        // رسم الإشعارات
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="smart-alert ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════════════
    // Savings Calculator Widget
    // ═══════════════════════════════════════════
    
    function updateSavingsCalculator() {
        const topCard = allScoredCards[0];
        
        if (!topCard) return;
        
        const totalRewardsEl = document.getElementById('totalRewards');
        const totalFeesEl = document.getElementById('totalFees');
        const netSavingsEl = document.getElementById('netSavings');
        
        if (totalRewardsEl) {
            totalRewardsEl.textContent = Math.round(topCard.annualRewards || 0) + ' د.أ';
        }
        
        if (totalFeesEl) {
            totalFeesEl.textContent = topCard.annual_fee_jod + ' د.أ';
        }
        
        if (netSavingsEl) {
            const savings = Math.round(topCard.netValue || 0);
            netSavingsEl.textContent = (savings >= 0 ? '+' : '') + savings + ' د.أ';
            netSavingsEl.style.color = savings >= 0 ? '#fff' : '#fecaca';
        }
    }
    
    // ═══════════════════════════════════════════
    // Form Submission
    // ═══════════════════════════════════════════
    
    if (form) {
        form.addEventListener('input', updateProgress);
        form.addEventListener('change', updateProgress);
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userInputs = { 
                monthlySalary: document.getElementById('monthlySalary').value, 
                mainGoal: document.getElementById('mainGoal').value, 
                spend_general: document.getElementById('spend_general').value, 
                spend_dining: document.getElementById('spend_dining').value, 
                spend_gas: document.getElementById('spend_gas').value, 
                spend_online: document.getElementById('spend_online').value, 
                travelFrequency: document.getElementById('travelFrequency').value, 
                feePreference: document.querySelector('input[name="feePreference"]:checked').value, 
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value 
            };
            
            const userAnswers = { 
                ...userInputs, 
                monthlySalary: parseFloat(userInputs.monthlySalary) || 0 
            };
            
            const userSpending = {
                general: parseFloat(userInputs.spend_general) || 0,
                dining: parseFloat(userInputs.spend_dining) || 0,
                gas: parseFloat(userInputs.spend_gas) || 0,
                online: parseFloat(userInputs.spend_online) || 0,
            };

            currentUserAnswers = userAnswers;
            allScoredCards = calculateMatchScore(ALL_CARDS_DATA, userAnswers, userSpending);
            
            if (questionnaireSection) questionnaireSection.style.display = 'none';
            if (resultsSection) resultsSection.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            if (recommendationSummaryEl) {
                recommendationSummaryEl.textContent = `وجدنا ${allScoredCards.filter(c => c.matchScore > 0).length} بطاقة متوافقة مع بحثك.`;
            }
            
            // عرض الإشعارات الذكية
            showSmartAlerts(userAnswers, allScoredCards);
            
            // تحديث حاسبة التوفير
            updateSavingsCalculator();
            
            const banks = [...new Set(allScoredCards.filter(c => c.matchScore > 0).map(c => c.bank_ar))];
            if (bankFiltersEl) {
                bankFiltersEl.innerHTML = banks.map(bank_ar => { 
                    const bankData = allScoredCards.find(c => c.bank_ar === bank_ar); 
                    return `<div><input type="checkbox" class="bank-filter-input" value="${bank_ar}" id="filter_${bank_ar}"><label for="filter_${bank_ar}" class="bank-filter-label" title="${bank_ar}"><img src="../${bankData.logo}" alt="${bank_ar}"></label></div>`; 
                }).join('');
                
                bankFiltersEl.querySelectorAll('.bank-filter-input').forEach(input => 
                    input.addEventListener('change', applyFiltersAndSort)
                );
            }
            
            applyFiltersAndSort();
        });
    }

    // ═══════════════════════════════════════════
    // Event Listeners
    // ═══════════════════════════════════════════
    
    [sortByEl, loungeFilter, noFeesFilter, islamicFilter].forEach(el => {
        if (el) el.addEventListener('change', applyFiltersAndSort);
    });
    
    if (recommendationCardsEl) {
        recommendationCardsEl.addEventListener('change', (e) => { 
            if (e.target.classList.contains('compare-checkbox')) { 
                const cardId = e.target.closest('.card-recommendation').dataset.cardId; 
                
                if (e.target.checked) { 
                    if (selectedCardsForComparison.size < 3) { 
                        selectedCardsForComparison.add(cardId); 
                    } else { 
                        e.target.checked = false; 
                        showToast('يمكنك مقارنة 3 بطاقات كحد أقصى.'); 
                    } 
                } else { 
                    selectedCardsForComparison.delete(cardId); 
                } 
                
                updateStickyCompareBar(); 
            } 
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => { 
            if (modal) modal.style.display = 'none'; 
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    if (detailsCompareBtn) {
        detailsCompareBtn.addEventListener('click', () => {
            if (selectedCardsForComparison.size < 2) {
                showToast('⚠️ يرجى اختيار بطاقتين على الأقل للمقارنة');
                return;
            }
            renderComparisonTable(selectedCardsForComparison);
        });
    }
    
    if (copyCompareBtn) {
        copyCompareBtn.addEventListener('click', () => {
            const cardsToCompare = ALL_CARDS_DATA.filter(card => selectedCardsForComparison.has(card.id));
            
            let text = `مقارنة بين: ${cardsToCompare.map(c => c.product_name).join(' و ')}\n\n`;
            
            const features = [ 
                { label: 'الرسوم السنوية', key: 'annual_fee_jod', format: v => `${v} د.أ` }, 
                { label: 'الفائدة الشهرية', key: 'interest_rate' }, 
                { label: 'حد الدخل', key: 'minimum_salary_jod', format: v => `${v} د.أ` }
            ];
            
            features.forEach(f => {
                text += `${f.label}:\n`;
                cardsToCompare.forEach(c => {
                    let value = c[f.key] === 0 ? 0 : (c[f.key] || '—');
                    if (f.format && typeof value === 'number') value = f.format(value);
                    text += `- ${c.product_name}: ${value}\n`;
                });
                text += '\n';
            });
            
            navigator.clipboard.writeText(text).then(() => 
                showToast('✓ تم نسخ المقارنة بنجاح!')
            );
        });
    }

    // ═══════════════════════════════════════════
    // Additional Buttons
    // ═══════════════════════════════════════════
    
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', () => {
            if (form) form.reset();
            updateProgress();
            showToast('✓ تم مسح جميع الإجابات');
        });
    }

    if (editSearchBtn) {
        editSearchBtn.addEventListener('click', () => {
            if (resultsSection) resultsSection.style.display = 'none';
            if (questionnaireSection) questionnaireSection.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            selectedCardsForComparison.clear();
            updateStickyCompareBar();
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'نتائج البطاقات الائتمانية - MaalyPlus',
                text: `وجدت ${allScoredCards.filter(c => c.matchScore > 0).length} بطاقة مناسبة لي على MaalyPlus!`,
                url: window.location.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    showToast('✓ تمت المشاركة بنجاح!');
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        navigator.clipboard.writeText(window.location.href).then(() => {
                            showToast('✓ تم نسخ الرابط!');
                        });
                    }
                }
            } else {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showToast('✓ تم نسخ الرابط!');
                });
            }
        });
    }

    // ═══════════════════════════════════════════
    // Scenario Cards
    // ═══════════════════════════════════════════
    
    const scenarioCards = document.querySelectorAll('.scenario-card');
    scenarioCards.forEach(card => {
        card.addEventListener('click', function() {
            const salaryEl = document.getElementById('monthlySalary');
            const goalEl = document.getElementById('mainGoal');
            const spendGeneralEl = document.getElementById('spend_general');
            const spendDiningEl = document.getElementById('spend_dining');
            const spendGasEl = document.getElementById('spend_gas');
            const spendOnlineEl = document.getElementById('spend_online');
            const travelFreqEl = document.getElementById('travelFrequency');
            
            if (salaryEl) salaryEl.value = this.dataset.salary || '';
            if (goalEl) goalEl.value = this.dataset.goal || 'cashback';
            if (spendGeneralEl) spendGeneralEl.value = this.dataset.spend_general || '0';
            if (spendDiningEl) spendDiningEl.value = this.dataset.spend_dining || '0';
            if (spendGasEl) spendGasEl.value = this.dataset.spend_gas || '0';
            if (spendOnlineEl) spendOnlineEl.value = this.dataset.spend_online || '0';
            if (travelFreqEl) travelFreqEl.value = this.dataset.travel_frequency || 'rarely';
            
            const feePreference = this.dataset.fee || 'yes';
            const feeEl = document.querySelector(`input[name="feePreference"][value="${feePreference}"]`);
            if (feeEl) feeEl.checked = true;
            
            const paymentMethod = this.dataset.payment || 'full';
            const paymentEl = document.querySelector(`input[name="paymentMethod"][value="${paymentMethod}"]`);
            if (paymentEl) paymentEl.checked = true;
            
            updateProgress();
            showToast('✓ تم تطبيق السيناريو! اضغط "اعرض أفضل البطاقات لي"');
            
            if (form) {
                window.scrollTo({ 
                    top: form.offsetTop - 100, 
                    behavior: 'smooth' 
                });
            }
        });
    });
});