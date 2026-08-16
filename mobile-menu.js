/**
 * MaalyPlus — Universal Mobile Menu Handler
 * ============================================================
 * يفعّل قائمة الموبايل على أي صفحة فيها زر #nav-toggle و #nav-menu
 * يُحقن في كل صفحة عبر <script src="../mobile-menu.js"></script>
 */
(function () {
    'use strict';

    function init() {
        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        // فتح/إغلاق القائمة
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = menu.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            // قفل/فتح scroll الـ body
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // إغلاق عند النقر خارج القائمة
        document.addEventListener('click', function (e) {
            if (menu.classList.contains('open') &&
                !menu.contains(e.target) &&
                !toggle.contains(e.target)) {
                menu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // إغلاق عند النقر على رابط داخل القائمة
        menu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                menu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // إغلاق عند تغيير حجم النافذة لتفادي قفل scroll
        window.addEventListener('resize', function () {
            if (window.innerWidth > 900 && menu.classList.contains('open')) {
                menu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // إغلاق بالـ Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                menu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                toggle.focus();
            }
        });

        // ARIA attributes
        toggle.setAttribute('aria-controls', 'nav-menu');
        toggle.setAttribute('aria-expanded', 'false');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
