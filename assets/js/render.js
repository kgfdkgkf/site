/* =========================================================================
   Рендер страниц из данных: раздел, материал, лента
   ========================================================================= */
(function () {
  'use strict';
  if (!window.MP) return;
  const { sections, articles } = window.MP;

  const $ = (s, r) => (r || document).querySelector(s);
  const byId = id => articles.find(a => a.id === id);
  const bySlug = slug => sections.find(s => s.slug === slug);
  const qs = name => new URLSearchParams(location.search).get(name);

  const ESC = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const artHref = id => 'article.html?id=' + id;
  const secHref = slug => 'razdel.html?r=' + slug;

  const ICON = `<svg aria-hidden="true"><use href="#i-arrow"/></svg>`;

  function cardHTML(a, opts) {
    opts = opts || {};
    const sticker = a.sticker
      ? `<span class="sticker sticker-abs${opts.paper ? ' sticker--paper' : ''}">${ESC(a.sticker)}</span>`
      : '';
    return `
      <a class="card${opts.reveal ? ' reveal' : ''}" href="${artHref(a.id)}"${opts.filter ? ` data-filter-item data-cat="${a.section}"` : ''}>
        <div class="card__media">${sticker}<img src="assets/img/${a.img}" alt="${ESC(a.title)}" loading="lazy"></div>
        <div class="card__body">
          <span class="rubric">${ESC(a.rubric)}</span>
          <h3 class="card__title">${ESC(a.title)}</h3>
          <p class="meta">${a.minutes} минут <span class="dot"></span> ${a.views}</p>
        </div>
      </a>`;
  }

  function listItem(a, i) {
    return `
      <a class="stack__item" href="${artHref(a.id)}">
        <span class="stack__num">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3 class="stack__title">${ESC(a.title)}</h3>
          <p class="meta" style="margin-top:6px"><span>${ESC(a.rubric)}</span><span class="dot"></span><span>${a.minutes} минут</span></p>
        </div>
      </a>`;
  }

  /* ------------------------------------------------------------- РАЗДЕЛ -- */
  function renderSection() {
    const slug = qs('r') || 'money';
    const s = bySlug(slug) || sections[0];
    const items = s.cards.map(byId).filter(Boolean);

    document.title = s.title + ' — ' + s.lead.slice(0, 60) + ' | Мой-портал.ру';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', s.lead);

    const stats = s.stats.map(([n, l]) => `
      <div class="stat"><div class="stat__num">${n}</div><div class="stat__lbl">${l}</div></div>`).join('');

    const cards = items.map(a => cardHTML(a, { reveal: true })).join('');

    const faq = s.faq.map(([q, a], i) => `
      <details${i === 0 ? ' open' : ''}>
        <summary>${ESC(q)}</summary>
        <p>${ESC(a)}</p>
      </details>`).join('');

    document.querySelectorAll('.nav a').forEach(a => {
      const u = new URL(a.href, location.href);
      a.classList.toggle('is-active', u.searchParams.get('r') === s.slug);
    });

    const navList = sections.map(x =>
      `<a href="${secHref(x.slug)}"${x.slug === s.slug ? ' class="is-active"' : ''}>${ESC(x.title)}</a>`).join('');

    $('#app').innerHTML = `
      <div class="wrap">
        <nav class="crumbs" aria-label="Хлебные крошки">
          <a href="index.html">Главная</a><span>/</span>
          <a href="index.html#razdely">Разделы</a><span>/</span>
          <span style="opacity:1;color:var(--muted)">${ESC(s.title)}</span>
        </nav>
      </div>

      <section class="page-head" style="padding-top:18px">
        <div class="wrap">
          <p class="eyebrow">${ESC(s.eyebrow)}</p>
          <h1>${ESC(s.title)}</h1>
          <p class="page-head__sub">${ESC(s.lead)}</p>
          <div class="stats" style="margin-top:26px;max-width:640px">${stats}</div>
        </div>
      </section>

      <div class="wrap">
        <div class="srv-banner">
          <span class="srv-banner__icon"><svg aria-hidden="true"><use href="#${s.service.icon}"/></svg></span>
          <div>
            <div class="srv-banner__t">${ESC(s.service.title)}</div>
            <div class="srv-banner__d">${ESC(s.service.desc)}</div>
          </div>
          <a class="btn" href="${s.service.href}">${ESC(s.service.cta)}</a>
        </div>

        <p class="meta" style="margin-bottom:22px">Темы раздела: ${s.subtopics.join(' · ')}</p>

        <div class="section-head-inline">
          <h2 class="h3" style="font-family:var(--f-display);font-weight:700;letter-spacing:-.02em">Материалы раздела</h2>
          <a class="link-more" href="lenta.html">Вся лента ${ICON}</a>
        </div>

        <div class="grid g3" data-stagger>${cards}</div>

        <div class="load-more">
          <a class="btn btn--ghost magnet" href="lenta.html">Смотреть все материалы</a>
        </div>
      </div>

      <section class="section">
        <div class="wrap">
          <div class="section__head">
            <div class="section__head-left">
              <span class="section__num">Вопрос</span>
              <div>
                <h2 class="section__title">Часто спрашивают</h2>
                <p class="section__sub">Короткие ответы на то, что ищут чаще всего</p>
              </div>
            </div>
          </div>
          <div class="faq">${faq}</div>

          <div class="section-head-inline" style="margin-top:clamp(28px,4vw,48px)">
            <h2 class="h3" style="font-family:var(--f-display);font-weight:700;letter-spacing:-.02em">Другие разделы</h2>
          </div>
          <div class="subsection-nav">${navList}</div>
        </div>
      </section>`;
  }

  /* ------------------------------------------------------------ МАТЕРИАЛ -- */
  function renderArticle() {
    const id = qs('id') || articles[0].id;
    const a = byId(id) || articles[0];
    const s = bySlug(a.section);

    document.title = a.title + ' — Мой-портал.ру';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', a.lead);

    const points = a.points.map(p => `<li>${ESC(p)}</li>`).join('');

    const related = (s ? s.cards : articles.map(x => x.id))
      .map(byId).filter(x => x && x.id !== a.id).slice(0, 3);

    $('#app').innerHTML = `
      <div class="wrap">
        <nav class="crumbs" aria-label="Хлебные крошки">
          <a href="index.html">Главная</a><span>/</span>
          <a href="${secHref(a.section)}">${ESC(s ? s.title : a.rubric)}</a><span>/</span>
          <span style="opacity:1;color:var(--muted)">${ESC(a.rubric)}</span>
        </nav>

        <header class="art-head">
          <p class="art-head__rubric rubric">${ESC(a.rubric)}</p>
          <h1>${ESC(a.title)}</h1>
          <p class="art-head__lead">${ESC(a.lead)}</p>
          <div class="art-meta">
            <div class="art-meta__author">
              <span class="art-meta__av">ЖЗ</span>
              <div>
                <div style="font-weight:600">Женя Заякина</div>
                <div class="meta">${ESC(a.date)} 2026 <span class="dot"></span> ${a.minutes} минут чтения <span class="dot"></span> ${a.views}</div>
              </div>
            </div>
            <div class="art-meta__share">
              <button class="chip" data-action="save" type="button">Сохранить</button>
              <button class="chip" data-action="share" type="button"><svg style="width:14px;height:14px" aria-hidden="true"><use href="#i-share"/></svg> Поделиться</button>
            </div>
          </div>
        </header>

        <figure class="art-hero"><img src="assets/img/${a.img}" alt="${ESC(a.title)}"></figure>
        <p class="figure__cap">Фото: Мой-портал.ру</p>

        <div class="art-body">
          <article class="prose">
            <p>${ESC(a.p1)}</p>
            <p>${ESC(a.p2)}</p>
            <h2>${ESC(a.h2)}</h2>
            <ul>${points}</ul>
            <blockquote>${ESC(a.quote[0])}<cite>${ESC(a.quote[1])}</cite></blockquote>

            <div class="inline-srv">
              <span class="inline-srv__icon"><svg aria-hidden="true"><use href="#i-${a.service.href.indexOf('job') > -1 ? 'work' : a.service.href.indexOf('psy') > -1 ? 'heart' : a.service.href.indexOf('edu') > -1 ? 'cap' : a.service.href.indexOf('grants') > -1 ? 'rub' : 'doc'}"/></svg></span>
              <div>
                <div class="inline-srv__t">${ESC(a.service.title)}</div>
                <div class="inline-srv__d">${ESC(a.service.desc)}</div>
              </div>
              <a class="btn btn--sm" href="${a.service.href}">${ESC(a.service.cta)}</a>
            </div>

            <div class="note"><b>${ESC(a.note[0])}</b>${ESC(a.note[1])}</div>

            <p>${s ? 'Материал из раздела «' + ESC(s.title) + '». В нём ещё ' + (s.cards.length - 1) + ' текста о том же — и инструмент, который решает задачу за пару минут.' : ''}</p>
          </article>

          <aside class="aside-box" aria-label="Дополнительно">
            <div class="aside-card">
              <h4>Раздел</h4>
              <a class="stack__item" href="${secHref(a.section)}" style="padding:6px 0;border-bottom:0">
                <div><div class="stack__title" style="font-size:16px">${ESC(s ? s.title : a.rubric)}</div>
                <div class="meta" style="margin-top:4px">${s ? s.cards.length : 0} материала · инструмент внутри</div></div>
              </a>
            </div>

            <div class="aside-card aside-card--dark">
              <h4>Одно письмо по средам</h4>
              <p style="font-size:13px;color:var(--inv-muted);margin-bottom:16px">Пять вещей на неделю: выплаты, дедлайны, события. Без спама.</p>
              <a class="btn btn--sm" href="index.html#podpiska" style="width:100%">Подписаться</a>
            </div>

            <div class="aside-card">
              <h4>Читайте также</h4>
              ${related.map(x => `
                <a class="card--row" href="${artHref(x.id)}" style="grid-template-columns:64px minmax(0,1fr)">
                  <div class="card__media"><img src="assets/img/${x.img}" alt=""></div>
                  <div class="card__body"><h3 class="card__title" style="font-size:14px">${ESC(x.title)}</h3></div>
                </a>`).join('')}
            </div>
          </aside>
        </div>

        <div class="art-foot">
          <div class="art-reactions">
            <span class="art-reactions__lbl">Оцени материал</span>
            <button class="react react--lg" data-react type="button" aria-pressed="false"><i>🔥</i><span class="js-count">184</span></button>
            <button class="react react--lg" data-react type="button" aria-pressed="false"><i>👌</i><span class="js-count">96</span></button>
            <button class="react react--lg" data-react type="button" aria-pressed="false"><i>🤯</i><span class="js-count">31</span></button>
            <button class="react react--lg" data-react type="button" aria-pressed="false"><i>😐</i><span class="js-count">4</span></button>
          </div>
          <div class="art-tags">
            ${[...new Set([a.rubric, 'Тюмень', s ? s.title : ''])].map(t => `<span class="chip">${ESC(t)}</span>`).join('')}
          </div>
          <div class="author-card">
            <span class="author-card__av">ЖЗ</span>
            <div>
              <div style="font-family:var(--f-display);font-weight:600;font-size:17px;letter-spacing:-.02em">Женя Заякина</div>
              <div class="meta" style="margin-top:4px">Главный редактор Мой-портал.ру</div>
              <p style="font-size:14px;color:var(--fg-2);margin-top:10px;max-width:60ch">Пишет о молодёжной политике, образовании и людях, которые меняют город.</p>
              <div class="meta" style="margin-top:10px">Есть тема? <a href="mailto:moiporta.l@ya.ru" style="color:var(--signal)">Напиши в редакцию</a></div>
            </div>
          </div>
        </div>
      </div>

      <section class="section">
        <div class="wrap">
          <div class="section__head">
            <div class="section__head-left">
              <span class="section__num">Дальше</span>
              <div><h2 class="section__title">Читайте также</h2></div>
            </div>
            <a class="link-more" href="lenta.html">Вся лента ${ICON}</a>
          </div>
          <div class="grid g3" data-stagger>
            ${articles.filter(x => x.id !== a.id).slice(3, 6).map(x => cardHTML(x, { reveal: true })).join('')}
          </div>
        </div>
      </section>`;
  }

  /* --------------------------------------------------------------- ЛЕНТА -- */
  function renderFeed() {
    const feed = $('#feed');
    if (!feed) return;
    const CHUNK = 12;
    let shown = 0;

    const draw = n => {
      const slice = articles.slice(shown, shown + n);
      const tpl = document.createElement('div');
      tpl.innerHTML = slice.map(a => cardHTML(a, { filter: true })).join('');
      while (tpl.firstElementChild) feed.appendChild(tpl.firstElementChild);
      shown += slice.length;
      const state = $('.load-more__state');
      if (state) state.textContent = `Показано ${shown} из ${articles.length} материалов`;
      const btn = $('#loadMore');
      if (btn) btn.style.display = shown >= articles.length ? 'none' : '';
      const counter = $('[data-filter-count]');
      if (counter) counter.textContent = $$('[data-filter-item]').length;
      requestAnimationFrame(() => { if (window.__mpApplyFilters) window.__mpApplyFilters(); });
    };

    draw(CHUNK);

    const btn = $('#loadMore');
    if (btn) btn.addEventListener('click', () => {
      btn.disabled = true;
      setTimeout(() => { draw(6); btn.disabled = false; }, 450);
    });

    const sentinel = $('#feedSentinel');
    if (sentinel && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting && shown < articles.length) draw(6); });
      }, { rootMargin: '240px' });
      io.observe(sentinel);
    }
  }

  const page = document.body.dataset.page;
  if (page === 'section') renderSection();
  else if (page === 'article') renderArticle();
  else if (page === 'feed') renderFeed();
})();
