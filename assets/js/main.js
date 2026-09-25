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
    var shown = 0;
    items.forEach(function (it) {
      var hide = !!sub && it.getAttribute('data-sub') !== sub;
      it.classList.remove('is-swap');
      it.hidden = hide;
      if (!hide) { it.style.setProperty('--d', (shown % 8) * 0.05 + 's'); shown++; }
    });
    void tabs.offsetWidth; // 애니메이션 다시 재생
    items.forEach(function (it) { if (!it.hidden) it.classList.add('is-swap'); });
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

// Categories: 카테고리를 접고 펼 때 부드럽게
(function () {
  var items = document.querySelectorAll('.acc__item');
  if (!items.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  items.forEach(function (d) {
    var sum = d.querySelector('summary');
    var panel = d.querySelector('.acc__panel');
    if (!sum || !panel || reduce || !panel.animate) return;
    var busy = false;
    sum.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;      // 카테고리 이름은 링크 그대로
      e.preventDefault();
      if (busy) return;
      busy = true;
      var open = d.open;
      if (!open) d.open = true;
      var h = panel.scrollHeight;
      var from = open ? h : 0;
      var to = open ? 0 : h;
      var an = panel.animate(
        [{ height: from + 'px', opacity: open ? 1 : 0 }, { height: to + 'px', opacity: open ? 0 : 1 }],
        { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
      an.onfinish = function () { if (open) d.open = false; busy = false; };
    });
  });
})();

// 사이드바: 카테고리 이름을 눌러 접고 펴기 (페이지를 열면 항상 펼쳐진 상태)
(function () {
  var cats = document.querySelectorAll('.tree__cat');
  if (!cats.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cats.forEach(function (cat) {
    var btn = cat.querySelector('.tree__label');
    var panel = cat.querySelector('.tree__subs');
    if (!btn || !panel) return;

    btn.addEventListener('click', function () {
      var isClosed = cat.classList.contains('is-closed');

      if (isClosed) {
        cat.classList.remove('is-closed');
        btn.setAttribute('aria-expanded', 'true');
        if (!reduce && panel.animate) {
          panel.animate(
            [{ height: '0px', opacity: 0 }, { height: panel.scrollHeight + 'px', opacity: 1 }],
            { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' }
          );
        }
      } else {
        var h = panel.scrollHeight;
        btn.setAttribute('aria-expanded', 'false');
        if (!reduce && panel.animate) {
          var an = panel.animate(
            [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
            { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' }
          );
          an.onfinish = function () { cat.classList.add('is-closed'); };
        } else {
          cat.classList.add('is-closed');
        }
      }
    });
  });
})();

// 글 페이지: 오른쪽 막대 목차 (마우스를 올리면 펼쳐져요)
(function () {
  var nav = document.querySelector('.toc');
  var prose = document.querySelector('.prose');
  if (!nav || !prose) return;

  var heads = prose.querySelectorAll('h2, h3');
  if (heads.length < 2) return;   // 소제목이 하나뿐이면 목차를 만들지 않아요

  var items = [];
  Array.prototype.forEach.call(heads, function (h, i) {
    if (!h.id) h.id = 'section-' + (i + 1);

    var a = document.createElement('a');
    a.className = 'toc__item toc__item--' + h.tagName.toLowerCase();
    a.href = '#' + h.id;

    var bar = document.createElement('span');
    bar.className = 'toc__bar';
    var text = document.createElement('span');
    text.className = 'toc__text';
    text.textContent = h.textContent;

    a.appendChild(bar);
    a.appendChild(text);
    nav.appendChild(a);
    items.push({ link: a, head: h });
  });

  nav.hidden = false;

  // 읽고 있는 위치를 표시해요
  var ticking = false;
  function update() {
    ticking = false;
    var line = window.scrollY + 140;
    var cur = 0;
    for (var i = 0; i < items.length; i++) {
      var top = items[i].head.getBoundingClientRect().top + window.scrollY;
      if (top <= line) cur = i; else break;
    }
    for (var j = 0; j < items.length; j++) {
      items[j].link.classList.toggle('is-on', j === cur);
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
