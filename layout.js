/**
 * MaalyPlus — layout.js
 * (1) تمييز رابط الصفحة الحالية بالقائمة تلقائياً
 * (2) تجربة نموذج النشرة البريدية (Netlify Forms)
 */
(function () {
  'use strict';

  function init() {
    // ── (1) الرابط النشط ──
    var parts = window.location.pathname.split('/').filter(Boolean);
    var page = parts.length ? parts[parts.length - 1] : 'index.html';
    var dir = parts.length > 1 ? parts[parts.length - 2] : '';
    var atRoot = parts.length <= 1;
    document.querySelectorAll('.nav .nav-link, .nav .nav-drop-item').forEach(function (a) {
      var clean = (a.getAttribute('href') || '').replace(/^(\.\.\/)+/, '');
      var hp = clean.split('/');
      var hrefPage = hp[hp.length - 1];
      var hrefDir = hp.length > 1 ? hp[hp.length - 2] : '';
      var active = hrefDir
        ? hrefDir === dir
        : atRoot && (hrefPage === page || (hrefPage === 'index.html' && (page === '' || page === 'index.html')));
      if (active) {
        a.classList.add('active');
        var dd = a.closest('.nav-dropdown');
        if (dd) { var btn = dd.querySelector('.nav-drop-btn'); if (btn) btn.classList.add('active'); }
      }
    });

    // ── (2) النشرة البريدية ──
    var form = document.getElementById('newsletter-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('button');
        var email = document.getElementById('newsletter-email');
        var body = new URLSearchParams({ 'form-name': 'newsletter', email: email.value }).toString();
        fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
          .finally(function () {
            btn.textContent = '✓ تم الاشتراك!';
            btn.disabled = true;
            setTimeout(function () { btn.textContent = 'اشترك الآن'; btn.disabled = false; form.reset(); }, 3000);
          });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
