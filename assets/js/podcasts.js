/* =========================================================================
   Подкасты: кликабельные карточки и модальный плеер
   ========================================================================= */
(function () {
  'use strict';
  const cards = Array.from(document.querySelectorAll('.podcast'));
  if (!cards.length) return;

  const modal = document.createElement('div');
  modal.className = 'auth-modal pod-modal';
  modal.id = 'podModal';
  modal.innerHTML = '<div class="auth-modal__box pod-modal__box"><button class="icon-btn auth-modal__x" type="button" data-pod-close aria-label="Закрыть"><svg aria-hidden="true"><use href="#i-close"/></svg></button><div class="pod-modal__body"></div></div>';
  document.body.appendChild(modal);
  const box = modal.querySelector('.pod-modal__body');

  const close = () => { modal.classList.remove('is-open'); document.body.classList.remove('is-locked'); };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-pod-close]')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  cards.forEach(card => {
    card.classList.add('is-clickable');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const open = () => {
      const img = card.querySelector('.podcast__cover img');
      const tag = card.querySelector('.rubric');
      const title = card.querySelector('.podcast__t');
      const desc = card.querySelector('.podcast__d');
      const eps = Array.from(card.querySelectorAll('.podcast__eps li'));
      box.innerHTML = `
        <div class="pod-modal__head">
          <div class="pod-modal__cover"><img src="${img ? img.getAttribute('src') : ''}" alt=""></div>
          <div>
            <span class="rubric">${tag ? tag.textContent : ''}</span>
            <h2 class="pod-modal__t">${title ? title.textContent : ''}</h2>
            <p class="pod-modal__d">${desc ? desc.textContent : ''}</p>
          </div>
        </div>
        <div class="pod-modal__list">
          ${eps.map((li, i) => {
            const t = li.children[0] ? li.children[0].textContent : '';
            const d = li.children[1] ? li.children[1].textContent : '';
            return `<button class="pod-ep" type="button" data-ep="${i}">
              <span class="pod-ep__play"><svg aria-hidden="true"><use href="#i-play"/></svg></span>
              <span class="pod-ep__t">${t}</span>
              <span class="pod-ep__d">${d}</span>
            </button>`;
          }).join('')}
        </div>
        <p class="pod-modal__note">Демо-плеер: звук появится, когда эпизоды будут загружены.</p>`;
      modal.classList.add('is-open');
      document.body.classList.add('is-locked');
    };
    card.addEventListener('click', e => { if (!e.target.closest('summary')) open(); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  modal.addEventListener('click', e => {
    const ep = e.target.closest('[data-ep]');
    if (!ep) return;
    const was = ep.classList.contains('is-playing');
    box.querySelectorAll('.pod-ep').forEach(x => x.classList.remove('is-playing'));
    if (!was) ep.classList.add('is-playing');
  });
})();
