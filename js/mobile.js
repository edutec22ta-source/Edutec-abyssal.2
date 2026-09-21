/* ════════════════════════════════════════════════════════════════════
   ABYSSAL · camada de adequação ao celular
   ────────────────────────────────────────────────────────────────────
   1. Mantém `--hdr-h` igual à altura real do cabeçalho fixo, para que o
      padding do body, o topo do mega-menu e a barra de progresso nunca
      saiam de sincronia quando a tipografia ou a barra do navegador
      mudarem de tamanho.
   2. Dá controles de toque ao simulador de ROV. O jogo só escutava
      teclado (WASD/setas/Shift/Espaço), o que o tornava injogável em
      celular. O manche abaixo apenas escreve em `rovState.keys`, os
      mesmos sinais que o teclado produz — a física, o consumo de
      energia e as regras das fases continuam idênticos.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ---------- 1. altura real do cabeçalho ---------- */

  function syncHeaderHeight() {
    var h = document.querySelector('.header');
    if (!h) return;
    var px = Math.round(h.getBoundingClientRect().height);
    if (px > 0) document.documentElement.style.setProperty('--hdr-h', px + 'px');
  }

  addEventListener('load', syncHeaderHeight);
  addEventListener('resize', syncHeaderHeight, { passive: true });
  addEventListener('orientationchange', function () { setTimeout(syncHeaderHeight, 120); });
  if (document.readyState !== 'loading') syncHeaderHeight();
  else addEventListener('DOMContentLoaded', syncHeaderHeight);
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(syncHeaderHeight);
    var hdr = document.querySelector('.header');
    if (hdr) ro.observe(hdr);
  }

  /* ---------- 2. controles de toque do ROV ---------- */

  // `rovState` é declarado com `let` em js/game.js: não vira propriedade de
  // `window`, então precisa ser lido pelo identificador nu.
  function state() {
    try { return rovState; } catch (e) { return null; }
  }
  function isTouch() {
    return matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
  }
  function setKey(name, on) {
    var s = state();
    if (s && s.keys) s.keys[name] = !!on;
  }
  function releaseAll() {
    ['up', 'down', 'left', 'right', 'shift'].forEach(function (k) { setKey(k, false); });
  }

  function buildPad(frame) {
    var pad = document.createElement('div');
    pad.className = 'rovTouch';
    pad.innerHTML =
      '<div class="rovStick" id="rovStick" role="application" ' +
      'aria-label="Manche do ROV: arraste para mover">' +
      '<i class="rovStickKnob"></i></div>' +
      '<p class="rovTouchHint">arraste para mover<br>até o fim = impulso</p>' +
      '<div class="rovTouchBtns">' +
      '<button type="button" class="rovTouchBtn" id="rovSonarBtn" aria-label="Disparar pulso de sonar">SONAR</button>' +
      '<button type="button" class="rovTouchBtn" id="rovPauseBtn" aria-label="Pausar ou retomar a missão">PAUSA</button>' +
      '</div>';
    frame.appendChild(pad);

    var stick = pad.querySelector('#rovStick');
    var knob = pad.querySelector('.rovStickKnob');
    var pointerId = null;

    function apply(ev) {
      var r = stick.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = ev.clientX - cx;
      var dy = ev.clientY - cy;
      var R = r.width / 2;
      var dist = Math.hypot(dx, dy);
      var norm = Math.min(1, dist / R);

      // knob acompanha o dedo, limitado ao anel
      var k = dist > 0 ? Math.min(dist, R * 0.62) / dist : 0;
      knob.style.transform = 'translate(' + dx * k + 'px,' + dy * k + 'px)';

      var dead = 0.26;
      if (norm < dead) { releaseAll(); return; }

      var t = R * 0.20;                       // limiar por eixo → 8 direções
      setKey('right', dx > t);
      setKey('left', dx < -t);
      setKey('down', dy > t);
      setKey('up', dy < -t);
      setKey('shift', norm > 0.86);           // empurrar até o fim = impulso
      stick.dataset.active = '1';
    }

    function end() {
      pointerId = null;
      stick.dataset.active = '0';
      knob.style.transform = '';
      releaseAll();
    }

    stick.addEventListener('pointerdown', function (e) {
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      stick.setPointerCapture(e.pointerId);
      e.preventDefault();
      apply(e);
    });
    stick.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pointerId) return;
      e.preventDefault();
      apply(e);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) {
      stick.addEventListener(t, function (e) {
        if (e.pointerId !== pointerId) return;
        e.preventDefault();
        end();
      });
    });
    // Se a aba perder o foco com o dedo apoiado, o ROV não pode seguir andando.
    addEventListener('blur', end);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) end();
    });

    var sonar = pad.querySelector('#rovSonarBtn');
    sonar.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (typeof pulseSonar === 'function') pulseSonar();
      sonar.dataset.on = '1';
      setTimeout(function () { sonar.dataset.on = '0'; }, 180);
    });

    var pause = pad.querySelector('#rovPauseBtn');
    pause.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (typeof toggleROVPause !== 'function') return;
      releaseAll();
      toggleROVPause();
      var s = state();
      pause.dataset.on = s && !s.running ? '1' : '0';
      // A mensagem padrão pede a tecla P, que não existe no celular.
      var hint = document.getElementById('gameHint');
      if (hint && s && !s.running) {
        var span = hint.querySelector('span');
        if (span) span.textContent = 'Toque em PAUSA novamente para retomar.';
      }
    });

    return pad;
  }

  // A legenda da página do jogo lista teclas (WASD, Shift, Espaço, F, P) que
  // não existem no celular. Num aparelho de toque ela descreve os controles
  // que o jogador realmente tem.
  function retitleLegend() {
    var leg = document.querySelector('.gameLegend');
    if (!leg || leg.dataset.touch === '1') return;
    leg.dataset.touch = '1';
    leg.innerHTML =
      '<span>Manche · mover</span>' +
      '<span>Empurrar até o fim · impulso</span>' +
      '<span>SONAR · pulso</span>' +
      '<span>PAUSA · pausar</span>' +
      '<span>Tela cheia · melhor deitado</span>';
  }

  function mountPad() {
    if (!isTouch()) return;
    var onGame = location.hash.slice(1).split('?')[0] === '/jogo';
    var frame = document.querySelector('.canvasFrame');
    var existing = document.querySelector('.rovTouch');

    if (!onGame || !frame) {
      if (existing) existing.remove();
      document.body.classList.remove('rovTouchOn');
      return;
    }
    retitleLegend();
    if (existing && frame.contains(existing)) return;   // já montado
    if (existing) existing.remove();
    buildPad(frame);
    document.body.classList.add('rovTouchOn');
  }

  // `render()` troca o innerHTML de #app a cada rota, então os controles
  // precisam ser remontados sempre que o canvas reaparecer.
  function watch() {
    var app = document.getElementById('app');
    if (!app) return;
    mountPad();
    new MutationObserver(function () { mountPad(); })
      .observe(app, { childList: true, subtree: false });
    addEventListener('hashchange', function () { setTimeout(mountPad, 60); });
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', watch);
  else watch();
})();
