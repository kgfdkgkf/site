/* =========================================================================
   Актуальные даты событий: считаются от сегодняшнего дня.
   Прошедшие события не показываем.
   ========================================================================= */
(function () {
  'use strict';
  var MP = window.MP;
  if (!MP || !MP.events) return;

  var MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
             'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var MON3 = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН',
              'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // смещения в днях от сегодняшнего
  var OFFSETS = [1, 1, 2, 2, 3, 4, 4, 5, 6, 8, 9, 12];

  MP.events.forEach(function (e, i) {
    var d = new Date(today);
    d.setDate(d.getDate() + (OFFSETS[i % OFFSETS.length] || i + 1));
    e.iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    e.dayNum = String(d.getDate());
    e.mon = MON3[d.getMonth()];
    e.date = d.getDate() + ' ' + MON[d.getMonth()];
    e.day = 'soon';
  });

  // не показываем прошедшее
  MP.events = MP.events.filter(function (e) {
    return new Date(e.iso + 'T23:59:59') >= today;
  });
})();
