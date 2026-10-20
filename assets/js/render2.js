/* =========================================================================
   Рендер: событие, сервис, служебная страница + поиск и общие действия
   ========================================================================= */
(function () {
  'use strict';
  const MP = window.MP;
  if (!MP) return;
  const { sections, articles, events, services, pages } = MP;

  const $ = (s, r) => (r || document).querySelector(s);
  const qs = n => new URLSearchParams(location.search).get(n);
  const ESC = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const CAT = { music: 'Музыка', lecture: 'Лекция', kino: 'Кино', master: 'Мастер-класс', meeting: 'Встреча', sport: 'Спорт', party: 'Вечеринка' };
  const artHref = id => 'article.html?id=' + id;
  const FRAME = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';

  /* ------------------------------------------------------------ утилиты -- */
  function toast(text) {
    let t = $('#mpToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'mpToast';
      t.className = 'mp-toast';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add('is-on');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove('is-on'), 2200);
  }
  window.mpToast = toast;

  function articleCard(a) {
    return `<a class="card" href="${artHref(a.id)}">
      <div class="card__media"><img src="assets/img/${a.img}" alt="${ESC(a.title)}" loading="lazy"></div>
      <div class="card__body"><span class="rubric">${ESC(a.rubric)}</span>
      <h3 class="card__title">${ESC(a.title)}</h3>
      <p class="meta">${a.minutes} минут <span class="dot"></span> ${a.views}</p></div>
    </a>`;
  }

  function eventCard(e) {
    return `<a class="ev" href="event.html?id=${e.id}">
      <div class="ev__media">
        <div class="ev__date"><b>${e.dayNum}</b><span>${e.mon}</span></div>
        ${e.price === 'free' ? '<span class="sticker sticker-abs sticker-abs--br">Бесплатно</span>' : ''}
        <img src="assets/img/${e.img}" alt="${ESC(e.title)}" loading="lazy">
      </div>
      <div class="ev__body">
        <span class="rubric">${CAT[e.cat] || 'Событие'}</span>
        <h3 class="ev__title">${ESC(e.title)}</h3>
        <p class="ev__place">${ESC(e.place)}</p>
        <div class="ev__foot"><span class="price${e.price === 'free' ? ' price--free' : ''}">${e.priceLabel}</span><span class="meta">${e.time}</span></div>
      </div>
    </a>`;
  }

  /* ------------------------------------------------------------ СОБЫТИЕ -- */
  function renderEvent() {
    const id = qs('id') || (events[0] && events[0].id);
    const e = events.find(x => x.id === id) || events[0];
    if (!e) return;
    document.title = e.title + ' — Мой-портал.ру';
    const rel = events.filter(x => x.id !== e.id).slice(0, 3);

    $('#app').innerHTML = `
      <div class="wrap">
        <nav class="crumbs"><a href="index.html">Главная</a><span>/</span>
          <a href="afisha.html">Афиша</a><span>/</span>
          <span style="opacity:1;color:var(--muted)">${ESC(CAT[e.cat] || 'Событие')}</span></nav>

        <header class="art-head">
          <p class="art-head__rubric rubric">${ESC(CAT[e.cat] || 'Событие')}</p>
          <h1>${ESC(e.title)}</h1>
          <p class="art-head__lead">${ESC(e.lead)}</p>
          <div class="art-meta">
            <div class="art-meta__author">
              <span class="art-meta__av">${e.dayNum}</span>
              <div>
                <div style="font-weight:600">${ESC(e.date)}, ${ESC(e.time)}</div>
                <div class="meta">${ESC(e.place)} <span class="dot"></span> ${ESC(e.priceLabel)}</div>
              </div>
            </div>
            <div class="art-meta__share">
              <button class="chip" data-action="remind" data-id="${e.id}" type="button">Напомнить</button>
              <button class="chip" data-action="share" type="button">Поделиться</button>
            </div>
          </div>
        </header>

        <figure class="art-hero"><img src="assets/img/${e.img}" alt="${ESC(e.title)}"></figure>
        <p class="figure__cap">Фото: Мой-портал.ру</p>

        <div class="art-body">
          <article class="prose">
            <p>${ESC(e.p1)}</p>
            <p>${ESC(e.p2)}</p>
            <h2>Что будет</h2>
            <ul>${e.what.map(w => `<li>${ESC(w)}</li>`).join('')}</ul>
            <div class="note"><b>Где и когда</b>${ESC(e.place)}, ${ESC(e.address)}. ${ESC(e.date)}, ${ESC(e.time)}. ${ESC(e.priceLabel)}.</div>
          </article>

          <aside class="aside-box">
            <div class="aside-card">
              <h4>Детали</h4>
              <table class="token-table" style="font-size:13px">
                <tr><td style="color:var(--muted)">Когда</td><td><b>${ESC(e.date)}, ${ESC(e.time)}</b></td></tr>
                <tr><td style="color:var(--muted)">Где</td><td><b>${ESC(e.place)}</b><br>${ESC(e.address)}</td></tr>
                <tr><td style="color:var(--muted)">Цена</td><td><b>${ESC(e.priceLabel)}</b></td></tr>
                <tr><td style="color:var(--muted)">Организатор</td><td>${ESC(e.organizer)}</td></tr>
              </table>
              <button class="btn btn--sm magnet" data-action="remind" data-id="${e.id}" style="width:100%;margin-top:14px" type="button">Напомнить о событии</button>
            </div>
            <div class="aside-card aside-card--dark">
              <h4>Одно письмо по средам</h4>
              <p style="font-size:13px;color:var(--inv-muted);margin-bottom:16px">Пять вещей на неделю: события, дедлайны, разборы.</p>
              <a class="btn btn--sm" href="index.html#podpiska" style="width:100%">Подписаться</a>
            </div>
          </aside>
        </div>
      </div>

      <section class="section">
        <div class="wrap">
          <div class="section__head">
            <div class="section__head-left"><span class="section__num">Ещё</span>
              <div><h2 class="section__title">Другие события</h2></div></div>
            <a class="link-more" href="afisha.html">Вся афиша ${FRAME}</a>
          </div>
          <div class="events" style="padding-top:0">${rel.map(eventCard).join('')}</div>
        </div>
      </section>`;
  }

  /* ------------------------------------------------------------- СЕРВИС -- */
  function renderService() {
    const slug = qs('s') || 'grant';
    const s = services.find(x => x.slug === slug) || services[0];
    document.title = s.title + ' — сервис Мой-портал.ру';
    const rel = (s.articles || []).map(id => articles.find(a => a.id === id)).filter(Boolean);

    $('#app').innerHTML = `
      <div class="wrap">
        <nav class="crumbs"><a href="index.html">Главная</a><span>/</span>
          <a href="services.html">Сервисы</a><span>/</span>
          <span style="opacity:1;color:var(--muted)">${ESC(s.title)}</span></nav>

        <header class="page-head" style="padding-bottom:20px">
          <p class="eyebrow">Сервис · ${ESC(s.tag)}</p>
          <h1>${ESC(s.title)}</h1>
          <p class="page-head__sub">${ESC(s.lead)}</p>
        </header>

        <div class="srv-detail">
          <div class="srv-detail__main">
            <h2 class="srv-detail__h">Как это работает</h2>
            <ol class="steps" style="gap:14px">
              ${s.steps.map((st, i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><span>${ESC(st)}</span></li>`).join('')}
            </ol>

            <form class="srv-form" id="srvForm" novalidate>
              <label class="srv-form__lbl" for="srvEmail">${ESC(s.cta)}</label>
              <p class="srv-form__d">Пришлём подборку на почту. Одно письмо, без спама — отписка в один клик.</p>
              <div class="field" style="border-color:var(--line);max-width:460px">
                <input id="srvEmail" type="email" placeholder="твой e-mail" required>
                <button class="btn" type="submit">Отправить</button>
              </div>
              <p class="srv-form__err" id="srvErr" hidden>Проверь адрес — похоже, в нём опечатка.</p>
            </form>

            <div class="section-head-inline" style="margin-top:40px">
              <h2 class="h3" style="font-family:var(--f-display);font-weight:700;letter-spacing:-.02em">По теме</h2>
            </div>
            <div class="grid g3">${rel.map(articleCard).join('')}</div>
          </div>

          <aside class="srv-detail__aside">
            <div class="aside-card">
              <h4>Коротко</h4>
              <p style="font-size:14px;color:var(--fg-2)">${ESC(s.meta)}</p>
            </div>
            <div class="aside-card">
              <h4>Вопросы</h4>
              <div class="faq" style="border-top:0">
                ${s.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''} style="border-bottom:1px solid var(--line)"><summary style="font-size:14px;padding:12px 0">${ESC(q)}</summary><p style="font-size:13px;padding-bottom:12px">${ESC(a)}</p></details>`).join('')}
              </div>
            </div>
            <div class="aside-card">
              <h4>Другие сервисы</h4>
              ${services.filter(x => x.slug !== s.slug).slice(0, 4).map(x => `<a href="service.html?s=${x.slug}" style="display:block;font-size:13.5px;padding:7px 0;color:var(--fg-2)">${ESC(x.title)}</a>`).join('')}
            </div>
          </aside>
        </div>
      </div>`;

    const form = $('#srvForm');
    if (form) form.addEventListener('submit', ev => {
      ev.preventDefault();
      const input = $('#srvEmail');
      const err = $('#srvErr');
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      err.hidden = ok;
      if (!ok) return;
      form.innerHTML = `<div class="srv-form__ok"><b>Готово.</b> Подборка по сервису «${ESC(s.title)}» уйдёт на ${ESC(input.value.trim())} в ближайшее письмо.</div>`;
      toast('Подписка оформлена');
    });
  }

  /* -------------------------------------------------------- СЛУЖЕБНАЯ ---- */
  function renderPage() {
    const key = qs('p') || 'about';
    const p = pages[key] || pages.about;
    document.title = p.title + ' — Мой-портал.ру';

    const html = p.blocks.map(([type, val]) => {
      if (type === 'h') return `<h2>${ESC(val)}</h2>`;
      if (type === 'p') return `<p>${ESC(val)}</p>`;
      if (type === 'ul') return `<ul>${val.map(x => `<li>${ESC(x)}</li>`).join('')}</ul>`;
      return '';
    }).join('');

    $('#app').innerHTML = `
      <div class="wrap">
        <nav class="crumbs"><a href="index.html">Главная</a><span>/</span>
          <span style="opacity:1;color:var(--muted)">${ESC(p.title)}</span></nav>
        <header class="page-head" style="padding-bottom:8px">
          <h1>${ESC(p.title)}</h1>
          <p class="page-head__sub">${ESC(p.lead)}</p>
        </header>
        <article class="prose" style="max-width:72ch;padding-bottom:60px">${html}</article>
      </div>`;
  }

  /* --------------------------------------------------------------- ПОИСК -- */
  window.MPSearch = function (q) {
    const s = (q || '').trim().toLowerCase();
    if (!s) return [];
    const out = [];
    articles.forEach(a => {
      if ((a.title + ' ' + a.lead + ' ' + a.rubric).toLowerCase().indexOf(s) > -1)
        out.push({ title: a.title, kind: 'Материал', href: artHref(a.id) });
    });
    sections.forEach(x => {
      if ((x.title + ' ' + x.lead).toLowerCase().indexOf(s) > -1)
        out.push({ title: 'Раздел «' + x.title + '»', kind: 'Раздел', href: 'razdel.html?r=' + x.slug });
    });
    events.forEach(e => {
      if ((e.title + ' ' + e.lead + ' ' + e.place).toLowerCase().indexOf(s) > -1)
        out.push({ title: e.title, kind: 'Событие', href: 'event.html?id=' + e.id });
    });
    services.forEach(x => {
      if ((x.title + ' ' + x.lead).toLowerCase().indexOf(s) > -1)
        out.push({ title: 'Сервис «' + x.title + '»', kind: 'Сервис', href: 'service.html?s=' + x.slug });
    });
    return out.slice(0, 8);
  };

  /* ------------------------------------------------------- ОБЩИЕ ДЕЙСТВИЯ -- */
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    const act = el.dataset.action;

    if (act === 'share') {
      ev.preventDefault();
      const data = { title: document.title, url: location.href };
      if (navigator.share) navigator.share(data).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => toast('Ссылка скопирована'));
      else toast('Ссылка: ' + location.href);
      return;
    }

    if (act === 'save') {
      ev.preventDefault();
      const saved = JSON.parse(localStorage.getItem('mp:saved') || '[]');
      const url = location.pathname + location.search;
      const i = saved.indexOf(url);
      el.classList.toggle('is-on');
      if (i > -1) { saved.splice(i, 1); toast('Убрали из сохранённых'); }
      else { saved.push(url); toast('Сохранили — вернуться можно с этой же ссылки'); }
      localStorage.setItem('mp:saved', JSON.stringify(saved));
      el.textContent = saved.indexOf(url) > -1 ? 'Сохранено' : 'Сохранить';
      return;
    }

    if (act === 'remind') {
      ev.preventDefault();
      const id = el.dataset.id;
      const list = JSON.parse(localStorage.getItem('mp:remind') || '[]');
      if (list.indexOf(id) < 0) list.push(id);
      localStorage.setItem('mp:remind', JSON.stringify(list));
      document.querySelectorAll('[data-action="remind"]').forEach(b => { b.textContent = 'Напомним'; b.classList.add('is-on'); });
      toast('Напомним за день до события');
      return;
    }

    if (act === 'subscribe') {
      ev.preventDefault();
      toast('Подписка оформлена');
      return;
    }
  });

  document.addEventListener('submit', ev => {
    const sg = ev.target.closest('[data-suggest]');
    if (sg) {
      ev.preventDefault();
      const inp = sg.querySelector('input');
      if (!inp || !inp.value.trim()) { if (inp) inp.focus(); return; }
      sg.innerHTML = '<div class="srv-form__ok" style="width:100%"><b>Спасибо!</b> Проверим событие в течение 24 часов и добавим в афишу.</div>';
      toast('Событие отправлено на проверку');
      return;
    }
    const f = ev.target.closest('[data-subscribe]');
    if (!f) return;
    ev.preventDefault();
    const input = f.querySelector('input[type="email"], input[type="text"]');
    const val = input ? input.value.trim() : '';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
    if (!ok) { if (input) { input.focus(); input.style.borderColor = 'var(--signal)'; } return; }
    f.innerHTML = '<div class="srv-form__ok" style="width:100%"><b>Готово.</b> Письмо по средам будет приходить на ' + val + '.</div>';
    toast('Подписка оформлена');
  });

  const page = document.body.dataset.page;
  if (page === 'event') renderEvent();
  else if (page === 'service') renderService();
  else if (page === 'info') renderPage();
})();
