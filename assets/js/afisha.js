/* =========================================================================
   АФИША: рендер событий из данных + календарь дат
   ========================================================================= */
(function () {
  'use strict';
  const MP = window.MP;
  const grid = document.getElementById('eventsGrid');
  if (!MP || !grid) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const ESC = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const CAT = { music: 'Музыка', lecture: 'Лекция', kino: 'Кино', master: 'Мастер-класс', meeting: 'Встреча', sport: 'Спорт', party: 'Вечеринка', trip: 'Поездка' };
  const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const events = MP.events.slice().sort((a, b) => (a.iso || '').localeCompare(b.iso || ''));

  /* --- карточки событий -------------------------------------------------- */
  grid.innerHTML = events.map(e => `
    <a class="ev reveal" data-id="${e.id}" href="event/index.html?id=${e.id}" data-filter-item
       data-cat="${e.cat}" data-price="${e.price}" data-day="${e.day}" data-date="${e.iso || ''}">
      <div class="ev__media">
        <div class="ev__date"><b>${e.dayNum}</b><span>${e.mon}</span></div>
        ${e.price === 'free' ? '<span class="sticker sticker-abs sticker-abs--br">Бесплатно</span>' : ''}
        <img src="assets/img/${e.img}" alt="${ESC(e.title)}" loading="lazy">
      </div>
      <div class="ev__body">
        <span class="rubric">${CAT[e.cat] || 'Событие'}</span>
        <h3 class="ev__title">${ESC(e.title)}</h3>
        <p class="ev__place">${ESC(e.place)}</p>
        <div class="ev__foot">
          <span class="price${e.price === 'free' ? ' price--free' : ''}">${ESC(e.priceLabel)}</span>
          <span class="meta">${ESC(e.time)}</span>
        </div>
      </div>
    </a>`).join('');

  /* --- счётчики ---------------------------------------------------------- */
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('evCount', events.length);
  set('evFree', events.filter(e => e.price === 'free').length);
  set('evTrips', events.filter(e => e.cat === 'trip').length);
  const counter = $('[data-filter-count]');
  if (counter) counter.textContent = events.length;

  /* --- календарь --------------------------------------------------------- */
  const mount = document.getElementById('calMount');
  if (!mount) return;

  const byDate = {};
  events.forEach(e => { if (e.iso) byDate[e.iso] = (byDate[e.iso] || 0) + 1; });

  const first = events.find(e => e.iso);
  let state = first ? { y: +first.iso.slice(0, 4), m: +first.iso.slice(5, 7) - 1 } : { y: 2026, m: 9 };

  const pad = n => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

  function draw() {
    const { y, m } = state;
    const start = (new Date(y, m, 1).getDay() + 6) % 7; // пн = 0
    const days = new Date(y, m + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < start; i++) cells.push('<span class="cal__d is-empty"></span>');
    for (let d = 1; d <= days; d++) {
      const key = iso(y, m, d);
      const n = byDate[key] || 0;
      cells.push(`<button class="cal__d${n ? ' has-ev' : ''}" type="button" data-value="${key}"
        aria-label="${d} ${MONTHS[m]}, событий: ${n}">${d}</button>`);
    }

    mount.innerHTML = `
      <div class="cal" data-filter-group="date">
        <div class="cal__hd">
          <div class="cal__m">${MONTHS[m]} ${y}</div>
          <div class="cal__nav">
            <button type="button" data-cal="-1" aria-label="Предыдущий месяц">‹</button>
            <button type="button" data-cal="1" aria-label="Следующий месяц">›</button>
          </div>
        </div>
        ${WD.map(w => `<span class="cal__wd">${w}</span>`).join('')}
        ${cells.join('')}
        <button class="chip" type="button" data-value="all" style="grid-column:1/-1;justify-self:start;margin-top:8px">Любой день</button>
      </div>`;

    $$('[data-cal]', mount).forEach(b => b.addEventListener('click', () => {
      const delta = +b.dataset.cal;
      let m2 = m + delta, y2 = y;
      if (m2 < 0) { m2 = 11; y2--; }
      if (m2 > 11) { m2 = 0; y2++; }
      state = { y: y2, m: m2 };
      draw();
    }));
  }

  draw();


  /* --- реальная карта событий -------------------------------------------- */
  const GEO = {
    'e-tech': [57.1355, 65.5560, 'Точка кипения, Республики 142'],
    'e-books': [57.1490, 65.5180, 'Библиотека Менделеева'],
    'e-kino': [57.1610, 65.5390, 'Дом кино, Ленина 4'],
    'e-volta': [57.1560, 65.5680, 'Дом печати, Осипенко 81'],
    'e-grant': [57.1370, 65.5120, 'Музейный комплекс, Советская 63'],
    'e-run': [57.1710, 65.5470, 'Набережная Туры'],
    'e-psy': [57.1240, 65.5470, 'Молодёжный центр, Дзержинского 38'],
    'e-standup': [57.1450, 65.5820, 'Loft, Республики 142'],
    'e-food': [57.1460, 65.5390, 'Цветной бульвар'],
    'e-tobolsk': [57.1900, 65.4880, 'Выезд: Тобольск'],
    'e-terma': [57.0900, 65.6300, 'Выезд: термальные источники'],
    'e-yalutor': [57.1080, 65.4680, 'Выезд: Ялуторовск']
  };

  const wrapMain = document.querySelector('.wrap');
  if (wrapMain && !document.getElementById('mapBlock')) {
    const sec = document.createElement('div');
    sec.className = 'map-block';
    sec.id = 'mapBlock';
    sec.innerHTML = `
      <div class="map-block__head">
        <h2 class="h3" style="font-family:var(--f-display);font-weight:700;letter-spacing:-.02em">Карта событий</h2>
        <span class="meta">${events.length} меток · Тюмень и область</span>
      </div>
      <div class="map map--real" id="afishaMap"></div>`;
    const anchor = document.getElementById('calMount');
    (anchor ? anchor.parentNode.parentNode : wrapMain).insertBefore(sec, anchor ? anchor.parentNode : wrapMain.firstChild);

    const startMap = () => {
      const el = document.getElementById('afishaMap');
      if (!el || !window.L) return false;
      const map = L.map(el, { scrollWheelZoom: false, attributionControl: false }).setView([57.1450, 65.5470], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

      const markerById = {};
      window.__mpMarkers = markerById;
      window.__mpMap = map;

      const groups = {};
      events.forEach(e => {
        const g = GEO[e.id];
        if (!g) return;
        const key = g[0].toFixed(4) + ',' + g[1].toFixed(4);
        (groups[key] = groups[key] || []).push(e);
      });

      Object.keys(groups).forEach(key => {
        const [lat, lng] = key.split(',').map(Number);
        const list = groups[key];
        const html = `<div class="map__pop">
            ${list.map(e => `<b>${e.title.replace(/</g, '&lt;')}</b>
              <span>${e.date} · ${e.time} · ${e.place}</span>
              <a href="event/index.html?id=${e.id}">Открыть событие →</a>`).join('<hr style="border:0;border-top:1px solid #eee;margin:10px 0">')}
          </div>`;
        const icon = L.divIcon({
          className: '',
          html: `<div class="map__pin-ico${list.length > 1 ? ' map__pin-ico--multi' : ''}"><i>${list.length > 1 ? '+' + list.length : list[0].dayNum}</i></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -28]
        });
        const mk = L.marker([lat, lng], { icon }).bindPopup(html, { maxWidth: 280 }).addTo(map);
        list.forEach(e => { markerById[e.id] = mk; });
      });
      map.on('click', () => map.scrollWheelZoom.enable());

      /* метки следуют за фильтрами */
      const syncMarkers = () => {
        const visible = new Set(
          Array.from(document.querySelectorAll('.ev[data-id]'))
            .filter(el => el.offsetParent !== null)
            .map(el => el.dataset.id)
        );
        Object.keys(markerById).forEach(id => {
          const m = markerById[id];
          if (visible.has(id)) { if (!map.hasLayer(m)) m.addTo(map); }
          else if (map.hasLayer(m)) { m.remove(); }
        });
      };
      document.addEventListener('click', ev => {
        if (ev.target.closest('.filters') || ev.target.closest('.cal')) setTimeout(syncMarkers, 80);
      });
      return true;
    };

    if (!startMap()) {
      const t = setInterval(() => { if (startMap()) clearInterval(t); }, 300);
      setTimeout(() => clearInterval(t), 6000);
    }
  }

  /* --- поездки рядом с календарём ---------------------------------------- */
  const promo = document.getElementById('tripPromo');
  if (promo) {
    const trips = events.filter(e => e.cat === 'trip');
    promo.innerHTML = '<div class="trip-promo__t">Поехать в этом месяце</div>' +
      '<div class="trip-promo__d">Выезды на один день — по области и рядом</div>' +
      trips.map(e => `<a href="event/index.html?id=${e.id}">${ESC(e.title.split(':')[0])}<span>${ESC(e.dayNum)} ${ESC(e.mon)}</span></a>`).join('');
  }

})();
