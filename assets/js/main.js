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

// 사이드바: 화살표를 눌러 접고 펴기 (이름을 누르면 카테고리 페이지로 가요)
(function () {
  var cats = document.querySelectorAll('.tree__cat');
  if (!cats.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cats.forEach(function (cat) {
    var btn = cat.querySelector('.tree__toggle');
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

// 맨 위로 버튼 — 조금 내려가면 나타나요
(function () {
  var btn = document.querySelector('.totop');
  if (!btn) return;
  btn.hidden = false;

  var ticking = false;
  function update() {
    ticking = false;
    btn.classList.toggle('is-in', window.scrollY > 400);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  btn.addEventListener('click', function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();

// 사이드바 검색
(function () {
  var box = document.querySelector('.search');
  if (!box) return;
  var input = box.querySelector('.search__input');
  var panel = box.querySelector('.search__panel');
  if (!input || !panel) return;

  var posts = null, loading = false, timer = null, hits = [], cursor = -1;
  var base = (document.querySelector('link[rel="stylesheet"][href*="style.css"]') || {}).href || '';
  var root = base ? base.replace(/assets\/css\/style\.css.*$/, '') : '/';

  function load(then) {
    if (posts) { then(); return; }
    if (loading) return;
    loading = true;
    fetch(root + 'search.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { posts = data; loading = false; then(); })
      .catch(function () { loading = false; posts = []; then(); });
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // 찾은 단어 주변을 조금 잘라서 보여줘요
  function snippet(body, q) {
    var i = body.toLowerCase().indexOf(q);
    if (i < 0) return '';
    var from = Math.max(0, i - 30);
    var cut = body.slice(from, from + 110);
    var at = cut.toLowerCase().indexOf(q);
    if (at < 0) return esc(cut);
    return (from > 0 ? '…' : '') + esc(cut.slice(0, at)) +
           '<mark>' + esc(cut.slice(at, at + q.length)) + '</mark>' +
           esc(cut.slice(at + q.length)) + '…';
  }

  function close() {
    panel.hidden = true;
    hits = [];
    cursor = -1;
  }

  function render(q) {
    var query = q.trim().toLowerCase();
    if (!query) { close(); return; }

    hits = (posts || []).filter(function (p) {
      return (p.title + ' ' + p.cat + ' ' + p.tag + ' ' + p.body).toLowerCase().indexOf(query) > -1;
    }).slice(0, 8);
    cursor = -1;

    if (!hits.length) {
      panel.innerHTML = '<p class="search__none">검색 결과가 없어요</p>';
      panel.hidden = false;
      return;
    }

    panel.innerHTML = hits.map(function (p) {
      var snip = snippet(p.body, query);
      return '<a class="search__hit" href="' + esc(p.url) + '">' +
             '<span class="search__title">' + esc(p.title) + '</span>' +
             '<span class="search__meta">' + esc(p.cat) + ' / ' + esc(p.tag) + ' · ' + esc(p.date) + '</span>' +
             (snip ? '<span class="search__snip">' + snip + '</span>' : '') +
             '</a>';
    }).join('');
    panel.hidden = false;
  }

  function move(step) {
    var links = panel.querySelectorAll('.search__hit');
    if (!links.length) return;
    cursor = (cursor + step + links.length) % links.length;
    for (var i = 0; i < links.length; i++) links[i].classList.toggle('is-on', i === cursor);
    links[cursor].scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('input', function () {
    var q = input.value;
    clearTimeout(timer);
    timer = setTimeout(function () { load(function () { render(q); }); }, 120);
  });
  input.addEventListener('focus', function () { load(function () {}); });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); input.blur(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      var links = panel.querySelectorAll('.search__hit');
      if (links.length) { e.preventDefault(); (links[cursor] || links[0]).click(); }
    }
  });

  document.addEventListener('click', function (e) {
    if (!box.contains(e.target)) close();
  });
})();
