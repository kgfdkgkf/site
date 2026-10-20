/* =========================================================================
   MOTION — сборка эффектов: фон, пятно, рельс, наклон карточек
   ========================================================================= */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) return;

  /* --- Аврора + пятно в первом экране ----------------------------------- */
  const hero = $('.hero');
  if (hero) {
    const aura = document.createElement('div');
    aura.className = 'aura';
    aura.setAttribute('aria-hidden', 'true');
    aura.innerHTML = '<span></span><span></span>';
    hero.insertBefore(aura, hero.firstChild);

    if (fine) {
      const spot = document.createElement('div');
      spot.className = 'spot';
      spot.setAttribute('aria-hidden', 'true');
      hero.insertBefore(spot, hero.firstChild);

      let raf = null;
      hero.addEventListener('mousemove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
          raf = null;
        });
      }, { passive: true });
    }
  }

  /* --- Линии под заголовками секций ------------------------------------- */
  const heads = $$('.section__head');
  if (heads.length && 'IntersectionObserver' in window) {
    const hio = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); hio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    heads.forEach(h => hio.observe(h));
  }

  /* --- Рельс прокрутки --------------------------------------------------- */
  const sections = $$('main section[id], main [id="podpiska"]');
  if (sections.length > 2) {
    const rail = document.createElement('nav');
    rail.className = 'rail';
    rail.setAttribute('aria-label', 'Навигация по странице');
    sections.forEach(sec => {
      const title = sec.dataset.rail || (sec.querySelector('.section__title') || {}).textContent || sec.id;
      const a = document.createElement('a');
      a.href = '#' + sec.id;
      a.innerHTML = '<span>' + title.trim().slice(0, 22) + '</span><i></i>';
      rail.appendChild(a);
    });
    document.body.appendChild(rail);

    const links = $$('a', rail);
    const syncRail = () => rail.classList.toggle('is-visible', window.scrollY > 520);
    syncRail();
    window.addEventListener('scroll', syncRail, { passive: true });
    const sio = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const i = sections.indexOf(e.target);
        links.forEach((l, k) => l.classList.toggle('is-active', k === i));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(s => sio.observe(s));
  }

  /* --- Наклон и глубина карточек ---------------------------------------- */
  if (fine) {
    const targets = $$('.card, .ev, .person, .test, .pod');
    targets.forEach(el => {
      if (el.classList.contains('tilt')) return;
      let raf = null;
      el.addEventListener('mousemove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - .5;
          const py = (e.clientY - r.top) / r.height - .5;
          el.style.transform =
            `perspective(1000px) rotateX(${(-py * 2.2).toFixed(2)}deg) rotateY(${(px * 2.6).toFixed(2)}deg) translateY(-4px)`;
          raf = null;
        });
      }, { passive: true });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* --- Параллакс «рельса» цифр в статистике ----------------------------- */
  const stats = $$('.stats');
  if (stats.length) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        stats.forEach(s => {
          const r = s.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          const k = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          s.style.setProperty('--k', k.toFixed(3));
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* --- Плавное появление страницы --------------------------------------- */
  document.body.classList.add('is-ready');
})();
