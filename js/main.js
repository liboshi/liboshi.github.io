/* ==========================================================================
   Boush Li — site behaviour
   1. theme toggle (dark by default, warm-paper light theme)
   2. home card wall: endless drift + wheel + focus management
   3. home filtering: tag chips + text search
   Everything degrades gracefully without JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  // Browsers without `inert` support: keep the duplicated wall copy out of the
  // tab order so keyboard users only reach the visible cards.
  var hiddenSeqs = document.querySelectorAll('[aria-hidden="true"]');
  for (var hs = 0; hs < hiddenSeqs.length; hs++) {
    var focusables = hiddenSeqs[hs].querySelectorAll('a, button, input, select, textarea');
    for (var hf = 0; hf < focusables.length; hf++) {
      focusables[hf].setAttribute('tabindex', '-1');
    }
  }

  /* ------------------------------------------------------------------ theme */
  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function themeColor() {
    return currentTheme() === 'light' ? '#F2EFE6' : '#070706';
  }

  function syncThemeUi() {
    var isDark = currentTheme() === 'dark';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themeColor());
    var buttons = document.querySelectorAll('.js-theme-toggle');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(!isDark));
      buttons[i].setAttribute(
        'aria-label',
        isDark ? '切换到浅色模式' : '切换到深色模式'
      );
    }
  }

  // Disable all transitions for two frames while the theme changes. Without
  // this, elements whose colours are mid-transition can show light-theme text
  // on a dark background (or the reverse) for a moment.
  function withoutTransitions(fn) {
    root.classList.add('theme-switching');
    fn();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        root.classList.remove('theme-switching');
      });
    });
  }

  function applyTheme(theme) {
    withoutTransitions(function () {
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
      }
      syncThemeUi();
    });
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      /* private mode */
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('.js-theme-toggle');
    if (!button) return;
    event.preventDefault();
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  syncThemeUi();

  /* --------------------------------------------------------- filtering state */
  var state = { tag: 'all', q: '' };
  var tiles = [].slice.call(document.querySelectorAll('[data-tile]'));
  var chips = [].slice.call(document.querySelectorAll('.chip[data-filter]'));
  var inputs = [].slice.call(document.querySelectorAll('[data-search-input]'));
  var statuses = [].slice.call(document.querySelectorAll('[data-status]'));
  var empties = [].slice.call(document.querySelectorAll('[data-empty]'));
  var wall = document.querySelector('[data-wall]');
  var results = document.querySelector('[data-results]');

  function matches(tile) {
    var tags = (tile.getAttribute('data-tags') || '').split(/\s+/);
    var tagOk = state.tag === 'all' || tags.indexOf(state.tag) !== -1;
    var q = state.q.trim().toLowerCase();
    var qOk = !q || (tile.getAttribute('data-search') || '').indexOf(q) !== -1;
    return tagOk && qOk;
  }

  function applyFilters() {
    var active = state.tag !== 'all' || state.q.trim() !== '';
    var count = 0;
    var seen = {};

    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];
      var utility = tile.hasAttribute('data-utility');
      var show = active ? !utility && matches(tile) : true;
      tile.classList.toggle('is-hidden', !show);
      if (show && tile.hasAttribute('data-article') && !tile.hasAttribute('data-dup')) {
        var url = tile.getAttribute('data-url') || '';
        if (url && !seen[url]) {
          seen[url] = true;
          count++;
        }
      }
    }

    for (var c = 0; c < chips.length; c++) {
      var on = chips[c].getAttribute('data-filter') === state.tag;
      chips[c].setAttribute('aria-pressed', String(on));
      chips[c].classList.toggle('is-active', on);
    }

    for (var s = 0; s < statuses.length; s++) {
      statuses[s].textContent = active
        ? count + ' 篇匹配'
        : statuses[s].getAttribute('data-default');
    }

    for (var e = 0; e < empties.length; e++) {
      empties[e].hidden = !(active && count === 0);
    }

    for (var n = 0; n < inputs.length; n++) {
      if (inputs[n].value !== state.q) inputs[n].value = state.q;
    }

    if (wall && results) {
      wall.classList.toggle('is-filtered', active);
      if (active) {
        while (results.firstChild) results.removeChild(results.firstChild);
        var shown = {};
        for (var t = 0; t < tiles.length; t++) {
          var source = tiles[t];
          if (
            !source.hasAttribute('data-utility') &&
            !source.hasAttribute('data-dup') &&
            matches(source)
          ) {
            var key = source.getAttribute('data-url') || '';
            if (key && !shown[key]) {
              shown[key] = true;
              var clone = source.cloneNode(true);
              clone.classList.remove('is-hidden');
              clone.removeAttribute('data-dup');
              results.appendChild(clone);
            }
          }
        }
        results.hidden = false;
      } else {
        results.hidden = true;
        while (results.firstChild) results.removeChild(results.firstChild);
      }
    }

    if (window.__wallRefresh) window.__wallRefresh();
  }

  for (var ci = 0; ci < chips.length; ci++) {
    chips[ci].addEventListener('click', function () {
      state.tag = this.getAttribute('data-filter');
      applyFilters();
    });
  }

  for (var ii = 0; ii < inputs.length; ii++) {
    inputs[ii].addEventListener('input', function () {
      state.q = this.value;
      applyFilters();
    });
  }

  var searchForms = [].slice.call(document.querySelectorAll('.search'));
  for (var fi = 0; fi < searchForms.length; fi++) {
    searchForms[fi].addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });
  }

  function visibleInput() {
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].offsetParent !== null) return inputs[i];
    }
    return inputs[0];
  }

  document.addEventListener('keydown', function (event) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA';

    if (event.key === '/' && !typing) {
      var input = visibleInput();
      if (input) {
        event.preventDefault();
        input.focus();
        input.select();
      }
    }

    if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
      var quick = visibleInput();
      if (quick) {
        event.preventDefault();
        quick.focus();
        quick.select();
      }
    }

    if (event.key === 'Escape' && typing) {
      state.q = '';
      state.tag = 'all';
      applyFilters();
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    }
  });

  /* --------------------------------------------------------------- card wall */
  function initWall() {
    var wall = document.querySelector('[data-wall]');
    if (!wall) return;

    var blocks = wall.querySelectorAll('.wall__cols');
    if (!blocks.length) return;

    var reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {}

    var hover = false;
    var focused = false;
    var last = 0;
    var raf = 0;
    var period = 0;
    var accum = 0;

    function measure() {
      period = blocks[0].offsetHeight || 0;
    }

    // The wall renders three identical columns blocks. Moving between them is
    // invisible, so scroll positions can be normalised back into the first
    // block at any time and the content stays seamless.
    function normalize() {
      if (!period) return;
      if (wall.scrollTop >= period) wall.scrollTop -= period;
      if (wall.scrollTop < 0) wall.scrollTop += period;
    }

    window.__wallRefresh = function () {
      measure();
      normalize();
    };

    function step(now) {
      if (!last) last = now;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reduced && !focused) {
        accum += 9 * (hover ? 0.12 : 1) * dt;
        if (accum >= 1) {
          var stepPx = Math.floor(accum);
          accum -= stepPx;
          wall.scrollTop += stepPx;
        }
      }
      normalize();
      raf = window.requestAnimationFrame(step);
    }

    measure();
    if (!reduced) {
      raf = window.requestAnimationFrame(step);
    }

    wall.addEventListener('pointerenter', function () {
      hover = true;
    });
    wall.addEventListener('pointerleave', function () {
      hover = false;
    });

    wall.addEventListener('focusin', function (event) {
      focused = true;
      var tile = event.target.closest('[data-tile]');
      if (tile && tile.scrollIntoView) {
        tile.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    });
    wall.addEventListener('focusout', function () {
      focused = false;
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
      } else if (!reduced) {
        last = 0;
        raf = window.requestAnimationFrame(step);
      }
    });

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        measure();
        normalize();
      }, 150);
    });

    window.addEventListener('load', function () {
      measure();
      normalize();
    });
  }

  initWall();
  applyFilters();
})();
