// 홈: 곰돌이를 누르면 그 아치 위에 영수증이 떠요
(function () {
  var niches = document.querySelectorAll('[data-niche]');
  if (!niches.length) return;
  function closeAll(except) {
    niches.forEach(function (n) {
      if (n === except) return;
      n.classList.remove('is-open');
      n.querySelector('.receipt').hidden = true;
      n.querySelector('.niche__arch').setAttribute('aria-expanded', 'false');
    });
  }
  niches.forEach(function (n) {
    var btn = n.querySelector('.niche__arch');
    var rc = n.querySelector('.receipt');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = rc.hidden;
      closeAll(n);
      rc.hidden = !open;
      n.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    rc.addEventListener('click', function (e) { e.stopPropagation(); });
  });
  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(null); });
})();

// 카테고리 페이지: 부카테고리 탭 (주소 끝 #부카테고리 로도 바로 열려요)
(function () {
  var tabs = document.querySelector('[data-tabs]');
  if (!tabs) return;
  var items = document.querySelectorAll('[data-cards] [data-sub]');
  function show(sub) {
    var found = false;
    tabs.querySelectorAll('.tab').forEach(function (t) {
      var on = t.getAttribute('data-sub') === sub;
      if (on) found = true;
      t.classList.toggle('is-on', on);
    });
    if (!found) { sub = ''; tabs.querySelector('.tab').classList.add('is-on'); }
    items.forEach(function (it) { it.hidden = !!sub && it.getAttribute('data-sub') !== sub; });
  }
  function fromHash() {
    var h = '';
    try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    show(h);
  }
  tabs.addEventListener('click', function (e) {
    var t = e.target.closest('.tab');
    if (!t) return;
    var sub = t.getAttribute('data-sub');
    history.replaceState(null, '', sub ? '#' + encodeURIComponent(sub) : location.pathname);
    show(sub);
  });
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();

// 홈: 첫 화면은 곰돌이 선반만, 스크롤하면 아래 내용이 차례로 떠올라요
(function () {
  var els = document.querySelectorAll('[data-reveal]');
  window.addEventListener('scroll', function () {
    document.documentElement.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive: true });
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
  var cards = document.querySelectorAll('.card[data-reveal]');
  cards.forEach(function (c, i) { c.style.setProperty('--d', (i % 4) * 0.08 + 's'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (e) { io.observe(e); });
})();
