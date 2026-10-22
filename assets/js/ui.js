/* =========================================================================
   UI: карусель новостей, меню подписки, персонализация
   ========================================================================= */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const ESC = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const MP = window.MP;

  /* --- карусель новостей -------------------------------------------------- */
  const track = document.getElementById('carTrack');
  if (track && MP) {
    const items = MP.articles.slice(0, 8);
    track.innerHTML = items.map(a => `
      <div class="carousel__item">
        <a class="card" href="article/index.html?id=${a.id}">
          <div class="card__media">
            <span class="sticker sticker-abs sticker--paper">${ESC(a.rubric)}</span>
            <img src="assets/img/${a.img}" alt="${ESC(a.title)}" loading="lazy">
          </div>
          <div class="card__body">
            <h3 class="card__title">${ESC(a.title)}</h3>
            <p class="meta">${a.minutes} минут <span class="dot"></span> ${a.views}</p>
          </div>
        </a>
      </div>`).join('');

    const btns = $$('[data-car]');
    const step = () => {
      const first = $('.carousel__item', track);
      return first ? first.getBoundingClientRect().width + 18 : 320;
    };
    btns.forEach(b => b.addEventListener('click', () => {
      track.scrollBy({ left: step() * +b.dataset.car, behavior: 'smooth' });
    }));
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 4;
      const prev = btns.find(b => b.dataset.car === '-1');
      const next = btns.find(b => b.dataset.car === '1');
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    track.addEventListener('scroll', sync, { passive: true });
    setTimeout(sync, 300);
  }

  /* --- меню подписки ------------------------------------------------------ */
  const toggles = $$('[data-sub-toggle]');
  toggles.forEach(btn => {
    const wrap = btn.closest('.sub-wrap');
    const menu = wrap && $('.sub-menu', wrap);
    if (!menu) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* --- персонализация подписки ------------------------------------------- */
  $$('[data-topics]').forEach(box => {
    const KEY = 'mp:topics';
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
    if (saved.length) {
      $$('button', box).forEach(b => b.classList.toggle('is-on', saved.indexOf(b.dataset.topic) > -1));
    }
    box.addEventListener('click', e => {
      const b = e.target.closest('button[data-topic]');
      if (!b) return;
      b.classList.toggle('is-on');
      const on = $$('button.is-on', box).map(x => x.dataset.topic);
      try { localStorage.setItem(KEY, JSON.stringify(on)); } catch (err) {}
    });
  });

  /* --- авто-карусель в первом экране ------------------------------------- */
  const heroCard = document.querySelector('.hero-card');
  if (heroCard && MP) {
    const slides = MP.articles.slice(0, 5);
    let idx = 0, timer = null;
    const img = heroCard.querySelector('img');
    const title = heroCard.querySelector('.hero-card__title');
    const rubric = heroCard.querySelector('.rubric');
    const meta = heroCard.querySelector('.meta');
    const sticker = heroCard.querySelector('.sticker');

    const dots = document.createElement('div');
    dots.className = 'hero-dots';
    slides.forEach((a, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Новость ' + (k + 1));
      b.addEventListener('click', () => go(k, true));
      dots.appendChild(b);
    });
    heroCard.parentNode.appendChild(dots);

    const paintDots = () => {
      Array.from(dots.children).forEach((d, k) => d.classList.toggle('is-on', k === idx));
    };

    function go(n, manual) {
      idx = (n + slides.length) % slides.length;
      const a = slides[idx];
      const pre = new Image();
      pre.src = 'assets/img/' + a.img;
      heroCard.classList.remove('is-anim'); void heroCard.offsetWidth; heroCard.classList.add('is-anim');
      setTimeout(() => {
        if (img) img.src = 'assets/img/' + a.img;
        if (title) title.textContent = a.title;
        if (rubric) rubric.textContent = a.rubric;
        if (meta) meta.innerHTML = a.date + '<span class="dot"></span>' + a.minutes + ' минут<span class="dot"></span>' + a.views;
        if (sticker) sticker.textContent = a.sticker || 'Свежее';
        heroCard.href = 'article/index.html?id=' + a.id;
        heroCard.classList.remove('is-anim');
        paintDots();
      }, 260);
      if (manual) restart();
    }

    function start() { clearInterval(timer); timer = setInterval(() => go(idx + 1), 4000); }
    function restart() { start(); }
    let tx = 0, ty = 0;
    heroCard.addEventListener('touchstart', e => {
      const t = e.touches[0]; tx = t.clientX; ty = t.clientY;
      clearInterval(timer);
    }, { passive: true });
    heroCard.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      const dx = t.clientX - tx, dy = t.clientY - ty;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        go(idx + (dx < 0 ? 1 : -1), true);
      }
      start();
    }, { passive: true });
    heroCard.addEventListener('mouseenter', () => clearInterval(timer));
    heroCard.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer); else start();
    });
    paintDots();
    start();
  }

  /* --- живые дата и время ------------------------------------------------- */
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const WD = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const dEl = document.querySelector('[data-clock-date]');
  const tEl = document.querySelector('[data-clock-time]');
  function tick() {
    const d = new Date();
    if (dEl) dEl.textContent = 'Тюмень · ' + WD[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()];
    if (tEl) tEl.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  if (dEl || tEl) { tick(); setInterval(tick, 20000); }

  /* --- авторизация -------------------------------------------------------- */
  const AUTH_KEY = 'mp:user';
  const actions = document.querySelector('.hdr__actions');
  let user = null;
  try { user = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch (e) {}

  const authBtn = document.createElement('button');
  authBtn.className = 'btn btn--ghost btn--sm auth-btn';
  authBtn.type = 'button';
  authBtn.setAttribute('data-auth-open', '');

  const paintAuth = () => {
    authBtn.textContent = user ? (user.name || 'Профиль') : 'Войти';
    authBtn.classList.toggle('is-user', !!user);
  };
  paintAuth();
  if (actions) {
    const sub = actions.querySelector('.sub-wrap');
    actions.insertBefore(authBtn, sub || actions.firstChild);
  }

  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.id = 'authModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="auth-modal__box">
      <button class="icon-btn auth-modal__x" type="button" data-auth-close aria-label="Закрыть">
        <svg aria-hidden="true"><use href="#i-close"/></svg>
      </button>
      <div class="auth-tabs">
        <button type="button" class="is-on" data-tab="in">Вход</button>
        <button type="button" data-tab="up">Регистрация</button>
      </div>
      <form class="auth-form" data-auth-form="in">
        <label class="auth-lbl">E-mail<input type="email" name="email" required placeholder="you@mail.ru"></label>
        <label class="auth-lbl">Пароль<input type="password" name="pass" required minlength="6" placeholder="минимум 6 символов"></label>
        <p class="auth-err" hidden>Проверь e-mail и пароль (от 6 символов).</p>
        <button class="btn" type="submit">Войти</button>
        <p class="auth-note">Демо-режим: данные хранятся только в этом браузере.</p>
      </form>
      <form class="auth-form" data-auth-form="up" hidden>
        <label class="auth-lbl">Имя<input type="text" name="name" required placeholder="Как тебя зовут"></label>
        <label class="auth-lbl">E-mail<input type="email" name="email" required placeholder="you@mail.ru"></label>
        <label class="auth-lbl">Пароль<input type="password" name="pass" required minlength="6" placeholder="минимум 6 символов"></label>
        <p class="auth-err" hidden>Проверь поля: имя, e-mail и пароль от 6 символов.</p>
        <button class="btn" type="submit">Создать аккаунт</button>
        <p class="auth-note">Демо-режим: данные хранятся только в этом браузере.</p>
      </form>
      <div class="auth-profile" hidden>
        <div class="auth-profile__name"></div>
        <div class="auth-profile__mail meta"></div>
        <a class="btn btn--ghost btn--sm" href="feed/index.html">Сохранённое</a>
        <button class="btn btn--sm" type="button" data-auth-out>Выйти</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const forms = modal.querySelectorAll('[data-auth-form]');
  const profile = modal.querySelector('.auth-profile');
  const tabs = modal.querySelectorAll('[data-tab]');

  const openAuth = () => {
    modal.classList.add('is-open');
    document.body.classList.add('is-locked');
    if (user) {
      forms.forEach(f => { f.hidden = true; });
      profile.hidden = false;
      modal.querySelector('.auth-tabs').hidden = true;
      modal.querySelector('.auth-profile__name').textContent = user.name || 'Пользователь';
      modal.querySelector('.auth-profile__mail').textContent = user.email || '';
    } else {
      forms.forEach(f => { f.hidden = f.dataset.authForm !== 'in'; });
      profile.hidden = true;
      modal.querySelector('.auth-tabs').hidden = false;
    }
  };
  const closeAuth = () => { modal.classList.remove('is-open'); document.body.classList.remove('is-locked'); };

  authBtn.addEventListener('click', openAuth);
  /* delegatedAuth: любые кнопки [data-auth-open] на странице */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-auth-open]');
    if (!t) return;
    e.preventDefault();
    document.querySelectorAll('.mmenu.is-open, .mmenu--open').forEach(m => m.classList.remove('is-open', 'is-menu-open'));
    document.body.classList.remove('menu-open', 'is-locked');
    openAuth();
  });
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-auth-close]')) closeAuth(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuth(); });

  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.toggle('is-on', x === t));
    forms.forEach(f => { f.hidden = f.dataset.authForm !== t.dataset.tab; });
  }));

  forms.forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(f);
    const email = (fd.get('email') || '').toString().trim();
    const pass = (fd.get('pass') || '').toString();
    const name = (fd.get('name') || '').toString().trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && pass.length >= 6 && (f.dataset.authForm === 'in' || name.length > 1);
    const err = f.querySelector('.auth-err');
    if (!ok) { if (err) err.hidden = false; return; }
    if (err) err.hidden = true;
    user = { name: f.dataset.authForm === 'up' ? name : (email.split('@')[0]), email: email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    paintAuth();
    document.dispatchEvent(new Event('mp:auth'));
    f.reset();
    if (window.mpToast) window.mpToast('Добро пожаловать, ' + user.name);
    openAuth();
  }));

  modal.addEventListener('click', e => {
    if (e.target.closest('[data-auth-out]')) {
      user = null;
      localStorage.removeItem(AUTH_KEY);
      paintAuth();
      document.dispatchEvent(new Event('mp:auth'));
      closeAuth();
      if (window.mpToast) window.mpToast('Вы вышли из аккаунта');
    }
  });

  /* --- карточка сотрудника ------------------------------------------------ */
  document.addEventListener('click', e => {
    const item = e.target.closest('.team__item');
    if (!item || !window.MP || !window.MP.pages) return;
    const list = Array.from(item.parentNode.children);
    const idx = list.indexOf(item);
    const team = (window.MP.pages.about || {}).team || [];
    const t = team[idx];
    if (!t) return;

    let m = document.getElementById('teamModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'teamModal';
      m.className = 'auth-modal team-modal';
      document.body.appendChild(m);
      m.addEventListener('click', ev => {
        if (ev.target === m || ev.target.closest('[data-team-close]')) {
          m.classList.remove('is-open'); document.body.classList.remove('is-locked');
        }
      });
      document.addEventListener('keydown', ev => {
        if (ev.key === 'Escape') { m.classList.remove('is-open'); document.body.classList.remove('is-locked'); }
      });
    }
    m.innerHTML = `<div class="auth-modal__box team-modal__box">
        <button class="icon-btn auth-modal__x" type="button" data-team-close aria-label="Закрыть"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
        <div class="team-modal__photo"><img src="assets/img/${t.img}" alt="${t.n}"></div>
        <div class="team-modal__name">${t.n}</div>
        <div class="team-modal__role">${t.r}</div>
        <p class="team-modal__txt">Отвечает за материалы и проекты портала. Связаться можно через редакцию — мы передаём письма авторам.</p>
        <a class="btn btn--sm" href="page/index.html?p=authors">Написать в редакцию</a>
      </div>`;
    m.classList.add('is-open');
    document.body.classList.add('is-locked');
  });

  /* --- подписка в мобильном меню: список соцсетей ------------------------- */
  const mmSub = document.querySelector('[data-mmenu-sub]');
  if (mmSub) {
    const list = document.querySelector('.mmenu__socials');
    mmSub.addEventListener('click', () => {
      if (!list) return;
      list.hidden = !list.hidden;
      mmSub.classList.toggle('is-open', !list.hidden);
    });
  }

  /* --- кнопка «наверх» ---------------------------------------------------- */
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Наверх');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    [250, 600, 1000].forEach(ms => setTimeout(() => {
      if (window.scrollY > 4) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
      }
    }, ms));
  });
  const toggleTop = () => toTop.classList.toggle('is-on', window.scrollY > 700);
  window.addEventListener('scroll', toggleTop, { passive: true });
  toggleTop();

  /* --- активный пункт меню по адресу -------------------------------------- */
  (function () {
    const here = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    const links = document.querySelectorAll('.nav a, .mmenu nav a');
    let matched = false;
    links.forEach(a => {
      const p = new URL(a.href, document.baseURI).pathname.replace(/index\.html$/, '').replace(/\/$/, '');
      const on = p === here && here !== '';
      if (on) matched = true;
      a.classList.toggle('is-active', on);
    });
    if (!matched) links.forEach(a => a.classList.remove('is-active'));
  })();

  /* --- афиша на главной: актуальные даты и события ------------------------ */
  (function homeAfisha() {
    const sec = document.getElementById('afisha');
    if (!sec || !MP || !MP.events) return;
    const evs = MP.events.slice(0, 3);
    if (!evs.length) return;

    const sub = sec.querySelector('.section__sub');
    if (sub) {
      const free = MP.events.filter(e => e.price === 'free').length;
      sub.textContent = evs[0].date + ' – ' + MP.events[2].date + ' · ' +
        MP.events.length + ' событий, из них ' + free + ' — бесплатно';
    }

    const CAT = { music: 'Музыка', lecture: 'Лекция', kino: 'Кино', master: 'Мастер-класс',
                  meeting: 'Встреча', sport: 'Спорт', party: 'Вечеринка', trip: 'Поездка' };
    const grid = sec.querySelector('.events');
    if (grid) {
      grid.innerHTML = evs.map(e => `
        <a class="ev reveal is-in" href="event/index.html?id=${e.id}">
          <div class="ev__media">
            <div class="ev__date"><b>${e.dayNum}</b><span>${e.mon}</span></div>
            ${e.price === 'free' ? '<span class="sticker sticker-abs sticker-abs--br">Бесплатно</span>' : ''}
            <img src="assets/img/${e.img}" alt="${e.title}" loading="lazy">
          </div>
          <div class="ev__body">
            <span class="rubric">${CAT[e.cat] || 'Событие'}</span>
            <h3 class="ev__title">${e.title}</h3>
            <p class="ev__place">${e.place}</p>
            <div class="ev__foot">
              <span class="price${e.price === 'free' ? ' price--free' : ''}">${e.priceLabel}</span>
              <span class="meta">${e.time}</span>
            </div>
          </div>
        </a>`).join('');
    }
  })();
})();