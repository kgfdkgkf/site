/* =========================================================================
   МОЙ ПОРТАЛ — прототип редизайна
   1. Тема · 2. Меню · 3. Поиск-оверлей · 4. Хедер · 5. Появление блоков
   6. Персона · 7. Реакции · 8. Фильтры · 9. Прогресс · 10. Курсор
   11. Наклон · 12. Магнит · 13. Параллакс · 14. Счётчики
   15. Подгрузка ленты · 16. Демо-действия
   ========================================================================= */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k) { try { return localStorage.getItem('mp:' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('mp:' + k, v); } catch (e) {} }
  };
  const lock = (on) => document.body.classList.toggle('is-locked', on);

  /* --- 1. Тема ---------------------------------------------------------- */
  const savedTheme = store.get('theme');
  const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && sysDark)) root.setAttribute('data-theme', 'dark');

  function syncThemeLabel() {
    const dark = root.getAttribute('data-theme') === 'dark';
    $$('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
      btn.setAttribute('aria-pressed', String(dark));
      const sun = $('.i-sun', btn), moon = $('.i-moon', btn);
      if (sun && moon) { sun.style.display = dark ? 'none' : 'block'; moon.style.display = dark ? 'block' : 'none'; }
    });
  }
  $$('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (next === 'dark') root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    store.set('theme', next);
    syncThemeLabel();
  }));
  syncThemeLabel();

  /* --- 2. Мобильное меню ------------------------------------------------ */
  const mmenu = $('#mmenu');
  const openMenu = () => { if (!mmenu) return; mmenu.classList.add('is-open'); lock(true); };
  const closeMenu = () => { if (!mmenu) return; mmenu.classList.remove('is-open'); lock(false); };
  $$('[data-menu-open]').forEach(b => b.addEventListener('click', openMenu));
  $$('[data-menu-close]').forEach(b => b.addEventListener('click', closeMenu));

  /* --- 3. Поиск-оверлей -------------------------------------------------- */
  const HOT = [
    ['Гранты до 1,5 млн ₽', '14 заявок', 'SECPATHopp'],
    ['Стипендии и выплаты', 'калькулятор', 'service/index.html?s=money'],
    ['Аренда без депозита', 'гайд', 'service/index.html?s=home'],
    ['Куда сходить бесплатно', '11 мест', 'afisha/index.html'],
    ['Работа с гибким графиком', '128 вакансий', 'service/index.html?s=job'],
    ['Психолог бесплатно', 'анонимно', 'service/index.html?s=psy']
  ];
  const ov = document.createElement('div');
  ov.className = 'search-ov';
  ov.id = 'searchOverlay';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', 'Поиск по порталу');
  ov.innerHTML = `
    <div class="search-ov__box">
      <div class="search-ov__top">
        <span class="search-ov__label">Поиск по порталу</span>
        <button class="icon-btn" type="button" data-search-close aria-label="Закрыть поиск">
          <svg aria-hidden="true"><use href="#i-close"/></svg>
        </button>
      </div>
      <form role="search" autocomplete="off">
        <svg aria-hidden="true"><use href="#i-search"/></svg>
        <input type="search" id="searchInput" placeholder="Грант, аренда, ЕГЭ…" aria-label="Поисковый запрос">
      </form>
      <div class="search-ov__hint">
        <span>Часто ищут:</span>
        ${HOT.slice(0, 3).map(h => `<button class="chip" type="button" data-hot="${h[0]}">${h[0]}</button>`).join('')}
      </div>
      <div class="search-ov__hot" id="searchDefault">
        <h4>Сейчас на портале</h4>
        ${HOT.map(h => `<a href="${h[2]}"><span style="color:inherit">${h[0]}</span><span>${h[1]}</span></a>`).join('')}
      </div>
      <div class="search-ov__hot" id="searchResults" hidden></div>
    </div>`;
  document.body.appendChild(ov);

  const searchInput = $('#searchInput', ov);
  const openSearch = () => { ov.classList.add('is-open'); lock(true); setTimeout(() => searchInput && searchInput.focus(), 120); };
  const closeSearch = () => { ov.classList.remove('is-open'); lock(false); };
  $$('[data-search-open]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openSearch(); }));
  $$('[data-search-close]', ov).forEach(b => b.addEventListener('click', closeSearch));
  ov.addEventListener('click', e => { if (e.target === ov) closeSearch(); });
  $$('[data-hot]', ov).forEach(b => b.addEventListener('click', () => {
    searchInput.value = b.dataset.hot;
    searchInput.focus();
  }));
  const resultsBox = $('#searchResults', ov);
  const defaultBox = $('#searchDefault', ov);

  function renderResults() {
    const q = searchInput.value.trim();
    if (!q) { resultsBox.hidden = true; defaultBox.hidden = false; return; }
    const res = (window.MPSearch ? window.MPSearch(q) : []);
    defaultBox.hidden = true;
    resultsBox.hidden = false;
    resultsBox.innerHTML = res.length
      ? '<h4>Найдено ' + res.length + '</h4>' + res.map(r =>
          `<a href="${r.href}"><span style="color:inherit">${r.title}</span><span>${r.kind}</span></a>`).join('')
      : '<h4>Ничего не нашлось</h4><p style="color:var(--muted);font-size:14px;line-height:1.5">Попробуй другое слово: «грант», «аренда», «стипендия», «стендап».</p>';
  }

  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderResults, 120);
  });

  $('form', ov).addEventListener('submit', e => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    const res = (window.MPSearch ? window.MPSearch(q) : []);
    if (res.length) { location.href = res[0].href; }
    else renderResults();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenu(); closeSearch(); }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault(); openSearch();
    }
  });

  /* --- 4. Хедер ---------------------------------------------------------- */
  const hdr = $('.hdr');
  if (hdr) {
    const onScroll = () => hdr.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- 5. Появление блоков + стаггер ------------------------------------- */
  $$('[data-stagger]').forEach(group => {
    $$('.reveal', group).forEach((el, i) => { el.style.setProperty('--d', (i * 70) + 'ms'); });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    $$('.reveal, .reveal-img').forEach(el => io.observe(el));
  } else {
    $$('.reveal, .reveal-img').forEach(el => el.classList.add('is-in'));
  }

  /* --- 6. Переключатель аудитории ---------------------------------------- */
  const personaBtns = $$('[data-persona]');
  if (personaBtns.length) {
    const saved = store.get('persona') || 'school';
    const activate = (key) => {
      personaBtns.forEach(b => {
        const on = b.dataset.persona === key;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      $$('.persona-panel').forEach(p => p.classList.toggle('is-active', p.dataset.personaPanel === key));
      store.set('persona', key);
    };
    personaBtns.forEach(b => b.addEventListener('click', () => activate(b.dataset.persona)));
    activate(saved);
  }

  /* --- 7. Реакции --------------------------------------------------------- */
  $$('[data-react]').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = $('.js-count', btn);
      let n = parseInt(num ? num.textContent : '0', 10) || 0;
      const on = btn.classList.toggle('is-on');
      n += on ? 1 : -1;
      if (num) num.textContent = n;
      btn.setAttribute('aria-pressed', String(on));
    });
  });

  /* --- 8. Мультифильтры --------------------------------------------------- */
  const filterGroups = $$('[data-filter-group]');
  if (filterGroups.length) {
    const state = {};
    const apply = () => {
      const items = $$('[data-filter-item]');
      let shown = 0;
      items.forEach(el => {
        let show = true;
        Object.keys(state).forEach(g => {
          const v = state[g];
          if (!v || v === 'all') return;
          if ((el.dataset[g] || '').split(' ').indexOf(v) < 0) show = false;
        });
        el.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      $$('[data-filter-count]').forEach(n => { n.textContent = shown; });
      const empty = $('[data-empty]');
      if (empty) empty.style.display = shown ? 'none' : 'block';
    };
    filterGroups.forEach(group => {
      const name = group.dataset.filterGroup;
      state[name] = 'all';
      group.addEventListener('click', e => {
        const btn = e.target.closest('[data-value]');
        if (!btn) return;
        $$('[data-value]', group).forEach(b => b.classList.toggle('is-active', b === btn));
        state[name] = btn.dataset.value;
        apply();
      });
    });
    apply();
    const preset = new URLSearchParams(location.search).get('f');
    if (preset) {
      const chip = document.querySelector('[data-filter-group="cat"] [data-value="' + preset + '"]') ||
                   document.querySelector('[data-filter-group="price"] [data-value="' + preset + '"]');
      if (chip) chip.click();
    }
    window.__mpApplyFilters = apply;
  }

  /* --- 9. Прогресс скролла ------------------------------------------------ */
  let bar = $('#progressBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.id = 'progressBar';
    document.body.appendChild(bar);
  }
  const onProgress = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(Math.max(window.scrollY / h, 0), 1) * 100 : 0).toFixed(2) + '%';
  };
  onProgress();

  /* --- 10. Курсор ---------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    const cur = document.createElement('div');
    cur.className = 'cursor';
    cur.innerHTML = '<span class="cursor__ring"></span><span class="cursor__dot"></span>';
    document.body.appendChild(cur);
    const ring = $('.cursor__ring', cur), dot = $('.cursor__dot', cur);
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, started = false;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (!started) { started = true; cur.classList.add('is-on'); }
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      const t = e.target.closest('a, button, .rub-tile, .card, .ev, .person, input, .chip, .spec-card');
      cur.classList.toggle('is-hover', !!t);
    }, { passive: true });
    document.addEventListener('mousedown', () => cur.classList.add('is-press'));
    document.addEventListener('mouseup', () => cur.classList.remove('is-press'));
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    document.addEventListener('mouseenter', () => cur.classList.add('is-on'));

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* --- 11. Наклон карточек ------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(el => {
      let raf = null;
      const onMove = e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateZ(0)`;
          raf = null;
        });
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* --- 12. Магнитные кнопки ----------------------------------------------- */
  if (finePointer && !reduceMotion) {
    $$('.magnet').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* --- 13. Параллакс ------------------------------------------------------ */
  const parEls = $$('[data-parallax]').filter(() => !reduceMotion);
  const onParallax = () => {
    const vh = window.innerHeight;
    parEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const k = parseFloat(el.dataset.parallax) || 0.08;
      const shift = ((r.top + r.height / 2) - vh / 2) * -k;
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(${1 + Math.abs(k) * 0.6})`;
    });
  };

  /* --- 14. Счётчики -------------------------------------------------------- */
  const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  const counters = $$('[data-count]');
  const runCounter = el => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const dur = 1100, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.4 });
      counters.forEach(el => cio.observe(el));
    } else counters.forEach(runCounter);
  }

  /* --- 16. Демо-действия ---------------------------------------------------- */
  $$('[data-demo]').forEach(el => el.addEventListener('click', e => {
    if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
    const msg = el.dataset.demo;
    if (msg) alert(msg);
  }));

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* --- Общий rAF-цикл для скролл-эффектов ---------------------------------- */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onProgress();
      onParallax();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', () => { onProgress(); onParallax(); });
  onParallax();
})();

/* страховка для скриншотов и старых браузеров */
window.addEventListener('load', function () {
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); });
  }, 1500);
});
