/* =========================================================================
   Форум: комментарии, реакции, письма и заявки под аккаунтом
   ========================================================================= */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const KEY = 'mp:user';
  const user = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const now = () => new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };


  /* --- 1. Почта: подставляем адрес из аккаунта --------------------------- */
  function paintEmail(input) {
    const form = input.closest('form') || input.parentNode;
    const u = user();
    if (u && u.email) {
      if (input.value !== u.email) input.value = u.email;
      input.setAttribute('readonly', 'readonly');
      input.classList.add('is-locked');
      let hint = form.querySelector('.mail-hint');
      if (!hint) {
        hint = document.createElement('p');
        hint.className = 'mail-hint check';
        form.appendChild(hint);
      }
      hint.textContent = 'Придёт на ' + u.email;
    } else {
      input.removeAttribute('readonly');
      input.classList.remove('is-locked');
      const hint = form.querySelector('.mail-hint');
      if (hint) hint.remove();
    }
  }

  function initEmail() {
    const repaint = () => Array.from(document.querySelectorAll('input[type="email"]')).forEach(paintEmail);
    repaint();
    setTimeout(repaint, 400);
    setTimeout(repaint, 1200);
    document.addEventListener('mp:auth', repaint);
    window.addEventListener('storage', e => { if (e.key === KEY) repaint(); });

    // подстановка при отправке любой формы
    document.addEventListener('submit', e => {
      const form = e.target;
      const mail = form.querySelector && form.querySelector('input[type="email"]');
      if (!mail) return;
      const u = user();
      if (u && u.email) { mail.value = u.email; }
    }, true);

    // новые формы (отрисованные позже) — подхватываем
    if (window.MutationObserver) {
      let busy = false, timer = null;
      const obs = new MutationObserver(() => {
        if (busy) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          busy = true;
          try { repaint(); } finally { setTimeout(() => { busy = false; }, 50); }
        }, 250);
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  /* --- 2. Комментарии и реакции ------------------------------------------ */
  function pageKey() {
    const p = location.pathname;
    if (p.indexOf('/article/') > -1) return 'article:' + (new URLSearchParams(location.search).get('id') || '1');
    if (p.indexOf('/event/') > -1) return 'event:' + (new URLSearchParams(location.search).get('id') || '1');
    return null;
  }

  function initComments() {
    const k = pageKey();
    if (!k || $('#forum')) return;
    const main = $('main');
    if (!main) return;

    const sec = document.createElement('section');
    sec.className = 'section forum';
    sec.id = 'forum';
    sec.innerHTML = `
      <div class="wrap">
        <div class="forum__head">
          <h2 class="section__title">Обсуждение</h2>
          <span class="meta" data-count>0</span>
        </div>
        <form class="forum__form" data-form>
          <textarea rows="3" placeholder="Что думаешь? Без агрессии — по делу" required></textarea>
          <div class="forum__row">
            <span class="forum__who" data-who></span>
            <button class="btn btn--sm" type="submit">Отправить</button>
          </div>
        </form>
        <div class="forum__list" data-list></div>
      </div>`;

    main.appendChild(sec);

    const list = $('[data-list]', sec);
    const who = $('[data-who]', sec);
    const count = $('[data-count]', sec);

    const paintWho = () => {
      const u = user();
      who.textContent = u ? 'Пишешь как ' + (u.name || 'пользователь') : 'Войди, чтобы подписаться на ответы';
    };
    paintWho();
    document.addEventListener('mp:auth', paintWho);

    const render = () => {
      const items = store.get(k);
      count.textContent = items.length + ' ' + (items.length === 1 ? 'сообщение' : 'сообщений');
      list.innerHTML = items.map((c, i) => `
        <article class="comment" data-i="${i}">
          <div class="comment__top">
            <b>${esc(c.name)}</b>
            <span>${esc(c.ts)}</span>
          </div>
          <p class="comment__text">${esc(c.text)}</p>
          <div class="comment__foot">
            <button class="react${c.mine ? ' is-on' : ''}" type="button" data-like="${i}">
              <span>👍</span> ${c.likes || 0}
            </button>
            <button class="react" type="button" data-reply="${i}">Ответить</button>
          </div>
        </article>`).join('') || '<p class="forum__empty">Пока тихо. Начни первым.</p>';
    };

    sec.addEventListener('click', e => {
      const like = e.target.closest('[data-like]');
      if (like) {
        const u = user();
        if (!u) { $('[data-auth-open]')?.click(); return; }
        const i = +like.dataset.like;
        const items = store.get(k);
        const c = items[i];
        c.mine = !c.mine;
        c.likes = (c.likes || 0) + (c.mine ? 1 : -1);
        store.set(k, items);
        render();
        return;
      }
      const rep = e.target.closest('[data-reply]');
      if (rep) {
        const u = user();
        if (!u) { $('[data-auth-open]')?.click(); return; }
        const items = store.get(k);
        const c = items[+rep.dataset.reply];
        $('textarea', sec).value = '@' + c.name + ', ';
        $('textarea', sec).focus();
      }
    });

    $('[data-form]', sec).addEventListener('submit', e => {
      e.preventDefault();
      const u = user();
      if (!u) { $('[data-auth-open]')?.click(); return; }
      const ta = $('textarea', sec);
      const text = ta.value.trim();
      if (text.length < 2) return;
      const items = store.get(k);
      items.push({ name: u.name || 'Пользователь', text: text, ts: now(), likes: 0, mine: false });
      store.set(k, items);
      ta.value = '';
      render();
      if (window.mpToast) window.mpToast('Комментарий опубликован');
    });

    render();
  }

  /* --- 3. Предложить событие — только после входа ------------------------ */
  function initSuggest() {
    const form = $('[data-suggest]');
    if (!form) return;
    const gate = () => {
      const u = user();
      form.hidden = !u;
      let note = document.getElementById('suggestGate');
      if (!u) {
        if (!note) {
          note = document.createElement('div');
          note.id = 'suggestGate';
          note.className = 'suggest-gate';
          note.innerHTML = '<p>Предлагать события могут только зарегистрированные — так мы отсекаем спам.</p><button class="btn" type="button" data-auth-open>Войти и предложить</button>';
          form.parentNode.insertBefore(note, form);
        }
      } else if (note) { note.remove(); }
    };
    gate();
    document.addEventListener('mp:auth', gate);
    window.addEventListener('storage', e => { if (e.key === KEY) gate(); });
  }

  initEmail();
  document.addEventListener('DOMContentLoaded', () => {
    initComments(); initSuggest();
    setTimeout(() => { initComments(); initSuggest(); }, 600);
  });
  if (document.readyState !== 'loading') { initComments(); initSuggest(); }
})();
