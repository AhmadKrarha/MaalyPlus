/* ══ Scroll to Top Button — Self-contained ══ */
(function() {
    // Inject styles
    var style = document.createElement('style');
    style.textContent = '.scroll-top-btn{position:fixed;bottom:2rem;left:2rem;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#1E40AF,#10B981);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(30,64,175,.3);z-index:900;opacity:0;visibility:hidden;transform:translateY(20px);transition:opacity .3s ease,visibility .3s ease,transform .3s ease,background .2s ease}.scroll-top-btn.visible{opacity:1;visibility:visible;transform:translateY(0)}.scroll-top-btn:hover{background:linear-gradient(135deg,#1E2B3C,#059669);box-shadow:0 6px 20px rgba(30,64,175,.4);transform:translateY(-2px)}.scroll-top-btn svg{width:22px;height:22px;stroke:currentColor;stroke-width:2.5;fill:none}@media(max-width:768px){.scroll-top-btn{bottom:1.25rem;left:1.25rem;width:42px;height:42px}.scroll-top-btn svg{width:20px;height:20px}}';
    document.head.appendChild(style);

    // إذا كانت الصفحة فيها شريط مقارنة سفلي ثابت، ارفع الزر فوقه لمنع التداخل
    if (document.getElementById('compareFloatContainer')) {
        var fix = document.createElement('style');
        fix.textContent = '.scroll-top-btn{bottom:6.5rem !important}@media(max-width:768px){.scroll-top-btn{bottom:6rem !important}}';
        document.head.appendChild(fix);
    }

    // Create button
    var btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.setAttribute('aria-label', 'العودة للأعلى');
    btn.setAttribute('title', 'العودة للأعلى');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    document.body.appendChild(btn);

    // Show/hide on scroll
    var ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                if (window.scrollY > 400) {
                    btn.classList.add('visible');
                } else {
                    btn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Scroll to top on click
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();
