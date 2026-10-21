/* =========================================================================
   Тест профориентации
   ========================================================================= */
(function () {
  'use strict';
  const app = document.getElementById('app');
  if (!app) return;

  const Q = [
    { q: 'Что тебе интереснее делать в свободный вечер?', a: [
      ['Собирать что-то руками или разбирать технику', 'tech'],
      ['Читать, спорить, разбирать смыслы', 'hum'],
      ['Собирать людей и организовывать движ', 'org'],
      ['Рисовать, монтировать, писать тексты', 'art']] },
    { q: 'Какой предмет давался легче всего?', a: [
      ['Физика, информатика, математика', 'tech'],
      ['История, литература, обществознание', 'hum'],
      ['Никакой — зато легко давались проекты', 'org'],
      ['МХК, ИЗО, музыка', 'art']] },
    { q: 'Идеальная задача на работе?', a: [
      ['Найти ошибку в системе и починить', 'tech'],
      ['Разобраться в сложном вопросе и объяснить', 'hum'],
      ['Собрать команду и довести проект до сдачи', 'org'],
      ['Придумать, как это будет выглядеть', 'art']] },
    { q: 'Что тебя бесит больше всего?', a: [
      ['Когда всё работает криво и никто не чинит', 'tech'],
      ['Когда говорят «не надо думать, просто сделай»', 'hum'],
      ['Когда всё срывается из-за безответственности', 'org'],
      ['Когда результат выглядит уродливо', 'art']] },
    { q: 'Как ты учишься новому?', a: [
      ['Через практику и эксперименты', 'tech'],
      ['Через тексты и разговоры', 'hum'],
      ['Через людей, которые уже это делают', 'org'],
      ['Через образы, примеры и насмотренность', 'art']] },
    { q: 'Какая работа кажется 가장 скучной?', a: [
      ['Где ничего не нужно изобретать', 'tech'],
      ['Где нельзя спорить и сомневаться', 'hum'],
      ['Где ты один и не с кем взаимодействовать', 'org'],
      ['Где всё строго по шаблону и без вкуса', 'art']] },
    { q: 'Что важнее в первом месте работы?', a: [
      ['Понятные задачи и рост в навыке', 'tech'],
      ['Смысл и люди, с которыми можно говорить', 'hum'],
      ['Ответственность и влияние на процесс', 'org'],
      ['Свобода и возможность делать красиво', 'art']] }
  ];

  const TYPES = {
    tech: {
      t: 'Технарь', d: 'Ты любишь системы, точность и результат, который можно проверить. Тебе подойдут профессии, где важно понимание «как это работает».',
      rec: ['IT, аналитика, инженерия', 'Лаборатории и проектные офисы вузов', 'Курсы по программированию и данным'],
      links: [['Направления и проходные баллы', 'study/admission/index.html'], ['Практика для студентов', 'study/practice/index.html'], ['Школы и курсы', 'study/courses/index.html']]
    },
    hum: {
      t: 'Гуманитарий', d: 'Ты видишь контекст, умеешь формулировать и задавать неудобные вопросы. Тебе подойдут профессии, где ценят мысль и текст.',
      rec: ['Медиа, редактура, преподавание', 'Право, история, социология', 'Исследования и аналитика'],
      links: [['Актуальные профессии', 'study/professions/index.html'], ['Поступление', 'study/admission/index.html'], ['Материалы по теме', 'lenta/index.html']]
    },
    org: {
      t: 'Организатор', d: 'Ты собираешь людей и доводишь до результата. Тебе подойдут роли, где нужно соединять людей, задачи и сроки.',
      rec: ['Проджект и продакт, event', 'Молодёжные проекты и НКО', 'Гранты и акселераторы'],
      links: [['Возможности', 'opp/index.html'], ['Акселераторы', 'opp/accelerators/index.html'], ['Волонтёрство', 'opp/volunteering/index.html']]
    },
    art: {
      t: 'Творец', d: 'Тебе важно, как это выглядит и звучит. Ты замечаешь детали, которые другие не видят.',
      rec: ['Дизайн, монтаж, фотография', 'Медиа и контент', 'Брендинг и коммуникации'],
      links: [['Школы и курсы', 'study/courses/index.html'], ['Афиша лекций и кинопоказов', 'afisha/edu/index.html'], ['Материалы по теме', 'lenta/index.html']]
    }
  };

  let step = 0;
  const score = { tech: 0, hum: 0, org: 0, art: 0 };

  function intro() {
    app.innerHTML = `
      <div class="wrap" style="padding:32px 0 60px">
        <nav class="crumbs"><a href="index.html">Главная</a><span>/</span>
          <a href="study/index.html">Учёба</a><span>/</span>
          <span style="opacity:1;color:var(--muted)">Тест</span></nav>
        <header class="page-head" style="padding-top:20px">
          <p class="eyebrow">Учёба · тест</p>
          <h1>Кем быть?</h1>
          <p class="page-head__sub">Семь вопросов — и список направлений, куда тебе стоит смотреть. Без регистрации, результат сразу.</p>
        </header>
        <div class="quiz-start">
          <div class="quiz-start__meta">7 вопросов · 3 минуты · 4 типа результата</div>
          <button class="btn btn--lg magnet" type="button" data-quiz-start>Начать тест</button>
        </div>
      </div>`;
    document.querySelector('[data-quiz-start]').addEventListener('click', () => { step = 0; question(); });
  }

  function question() {
    const q = Q[step];
    app.innerHTML = `
      <div class="wrap" style="padding:28px 0 70px;max-width:760px">
        <div class="quiz-top">
          <span class="meta">Вопрос ${step + 1} из ${Q.length}</span>
          <div class="quiz-bar"><i style="width:${Math.round(step / Q.length * 100)}%"></i></div>
        </div>
        <h2 class="quiz-q">${q.q}</h2>
        <div class="quiz-answers">
          ${q.a.map(([txt, key]) => `<button class="quiz-a" type="button" data-k="${key}">${txt}</button>`).join('')}
        </div>
        <button class="quiz-back" type="button" data-back ${step === 0 ? 'hidden' : ''}>← назад</button>
      </div>`;
    app.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => {
      score[b.dataset.k] += 1;
      step += 1;
      if (step < Q.length) question(); else result();
    }));
    const back = app.querySelector('[data-back]');
    if (back) back.addEventListener('click', () => { step = Math.max(0, step - 1); question(); });
  }

  function result() {
    const best = Object.keys(score).sort((a, b) => score[b] - score[a])[0];
    const T = TYPES[best];
    app.innerHTML = `
      <div class="wrap" style="padding:28px 0 70px;max-width:820px">
        <div class="quiz-result">
          <span class="eyebrow">Результат</span>
          <h1 class="quiz-result__t">${T.t}</h1>
          <p class="quiz-result__d">${T.d}</p>
          <ul class="quiz-result__l">${T.rec.map(r => `<li>${r}</li>`).join('')}</ul>
          <div class="univ-list" style="margin-top:18px">
            ${T.links.map(([t, u]) => `<a href="${u}">${t}<svg aria-hidden="true"><use href="#i-arrow-ur"/></svg></a>`).join('')}
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">
            <button class="btn" type="button" data-again>Пройти заново</button>
            <a class="btn btn--ghost" href="study/admission/index.html">Смотреть вузы</a>
          </div>
        </div>
      </div>`;
    document.querySelector('[data-again]').addEventListener('click', () => {
      Object.keys(score).forEach(k => { score[k] = 0; });
      intro();
    });
  }

  intro();
})();
