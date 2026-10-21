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

  }

  /* --- Пятно за курсором по всей странице -------------------------------- */
  if (fine) {
    const spot = document.createElement('div');
    spot.className = 'spot-global';
    spot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spot);
    let raf = null;
    document.addEventListener('mousemove', e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mx', e.clientX + 'px');
        document.documentElement.style.setProperty('--my', e.clientY + 'px');
        raf = null;
      });
    }, { passive: true });
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

  /* --- Плавное появление страницы --------------------------------------- */
  document.body.classList.add('is-ready');
})();
