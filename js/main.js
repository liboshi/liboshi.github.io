(function () {
  'use strict';

  var root = document.documentElement;
  var topbar = document.querySelector('.topbar');
  var menuToggle = document.getElementById('menu-toggle');
  var siteNav = document.getElementById('site-nav');
  var themeToggle = document.getElementById('theme-toggle');

  /* -----------------------------------------------------------------------
     Theme
     ----------------------------------------------------------------------- */
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function syncThemeUi() {
    var isDark = currentTheme() === 'dark';
    var color = isDark ? '#18191A' : '#FFFFFF';

    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i += 1) {
      metas[i].setAttribute('content', color);
      metas[i].removeAttribute('media');
    }

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', isDark ? '切换到浅色模式' : '切换到深色模式');
      themeToggle.setAttribute('title', isDark ? '切换到浅色模式' : '切换到深色模式');
    }
  }

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
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    withoutTransitions(syncThemeUi);
  }

  function initTheme() {
    syncThemeUi();

    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      });
    }

    if (window.matchMedia) {
      var query = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () {
        if (!root.getAttribute('data-theme')) syncThemeUi();
      };
      if (query.addEventListener) query.addEventListener('change', onChange);
      else if (query.addListener) query.addListener(onChange);
    }
  }

  /* -----------------------------------------------------------------------
     Mobile menu: focus moves into the menu, Escape restores it
     ----------------------------------------------------------------------- */
  function menuIsOpen() {
    return topbar && topbar.classList.contains('is-open');
  }

  function menuFocusables() {
    if (!topbar) return [];
    var nodes = topbar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    return Array.prototype.slice.call(nodes).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  var lastFocused = null;

  function openMenu() {
    if (!topbar || !menuToggle) return;
    lastFocused = document.activeElement;
    topbar.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', '关闭导航');
    var first = siteNav ? siteNav.querySelector('a[href]') : null;
    if (first) first.focus();
  }

  function closeMenu(restoreFocus) {
    if (!topbar || !menuToggle || !menuIsOpen()) return;
    topbar.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航');
    if (restoreFocus) {
      var target = lastFocused && document.contains(lastFocused) ? lastFocused : menuToggle;
      target.focus();
    }
  }

  function initMenu() {
    if (!topbar || !menuToggle || !siteNav) return;

    menuToggle.addEventListener('click', function () {
      if (menuIsOpen()) closeMenu(false);
      else openMenu();
    });

    siteNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('click', function (event) {
      if (menuIsOpen() && !topbar.contains(event.target)) closeMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (!menuIsOpen()) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== 'Tab') return;
      var focusables = menuFocusables();
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if (window.matchMedia) {
      var desktop = window.matchMedia('(min-width: 761px)');
      var onDesktop = function () {
        if (desktop.matches) closeMenu(false);
      };
      if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
      else if (desktop.addListener) desktop.addListener(onDesktop);
    }
  }

  /* -----------------------------------------------------------------------
     Home search: filter the post cards without a page reload
     ----------------------------------------------------------------------- */
  function initSearch() {
    var input = document.querySelector('[data-post-search]');
    if (!input) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('.feed .post-card'));
    var status = document.querySelector('[data-post-search-status]');
    var empty = document.querySelector('[data-post-search-empty]');
    var total = cards.length;

    function applySearch() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.textContent || '').toLowerCase();
        var match = !query || haystack.indexOf(query) !== -1;
        card.hidden = !match;
        if (match) visible += 1;
      });

      if (status) {
        status.textContent = query
          ? (visible > 0 ? '找到 ' + visible + ' 篇文章' : '没有匹配的文章')
          : total + ' 篇文章';
      }
      if (empty) empty.hidden = !query || visible > 0;
    }

    input.addEventListener('input', applySearch);

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var typing = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );

      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        input.focus();
        input.select();
        return;
      }

      if (event.key === 'Escape' && document.activeElement === input) {
        if (input.value) {
          input.value = '';
          applySearch();
        } else {
          input.blur();
        }
      }
    });
  }

  /* -----------------------------------------------------------------------
     Table of contents for long posts
     ----------------------------------------------------------------------- */
  function slugifyHeading(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  }

  function initToc() {
    var article = document.querySelector('.article');
    var prose = article ? article.querySelector('.prose') : null;
    if (!article || !prose || article.querySelector('.article-toc')) return;

    var headings = Array.prototype.slice.call(prose.querySelectorAll('h2, h3'));
    if (headings.length < 3) return;

    var nav = document.createElement('nav');
    nav.className = 'article-toc';
    nav.setAttribute('aria-label', '文章目录');

    var details = document.createElement('details');
    details.className = 'article-toc__details';
    details.open = window.matchMedia('(min-width: 761px)').matches;

    var summary = document.createElement('summary');
    summary.className = 'article-toc__summary';
    summary.textContent = '目录';
    details.appendChild(summary);

    var body = document.createElement('div');
    body.className = 'article-toc__body';

    var list = document.createElement('ol');
    var used = {};

    headings.forEach(function (heading) {
      var text = (heading.textContent || '').trim();
      if (!text) return;

      if (!heading.id) {
        var base = slugifyHeading(text);
        var id = base;
        var n = 2;
        while (document.getElementById(id) || used[id]) {
          id = base + '-' + n;
          n += 1;
        }
        heading.id = id;
      }
      used[heading.id] = true;

      var item = document.createElement('li');
      item.className = 'article-toc__item' + (heading.tagName === 'H3' ? ' article-toc__item--h3' : '');

      var link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = text;
      item.appendChild(link);
      list.appendChild(item);
    });

    body.appendChild(list);
    details.appendChild(body);
    nav.appendChild(details);

    var head = article.querySelector('.article__head');
    if (head && head.parentNode) head.insertAdjacentElement('afterend', nav);
    else prose.parentNode.insertBefore(nav, prose);
  }

  /* -----------------------------------------------------------------------
     Copy button for code blocks
     ----------------------------------------------------------------------- */
  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-9999px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(area);
    return ok;
  }

  function initCodeCopy() {
    var prose = document.querySelector('.article .prose');
    if (!prose) return;

    var live = document.createElement('span');
    live.className = 'sr-only';
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);

    var blocks = Array.prototype.slice.call(prose.querySelectorAll('pre'));
    blocks.forEach(function (pre) {
      var parent = pre.parentElement;
      var container = parent && parent !== pre && parent.classList.contains('highlight') ? parent : null;

      if (!container) {
        container = document.createElement('div');
        container.className = 'code-wrap';
        pre.parentNode.insertBefore(container, pre);
        container.appendChild(pre);
      }

      if (container.getAttribute('data-copy-ready') === '1') return;
      container.setAttribute('data-copy-ready', '1');
      container.classList.add('has-copy');

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy';
      button.textContent = '复制';
      button.setAttribute('aria-label', '复制代码');

      button.addEventListener('click', function () {
        var text = pre.textContent || '';
        var finish = function (ok) {
          button.textContent = ok ? '已复制' : '复制失败';
          live.textContent = ok ? '代码已复制到剪贴板' : '复制失败，请手动选择代码';
          window.setTimeout(function () {
            button.textContent = '复制';
            live.textContent = '';
          }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () {
            finish(true);
          }, function () {
            finish(fallbackCopy(text));
          });
        } else {
          finish(fallbackCopy(text));
        }
      });

      container.appendChild(button);
    });
  }

  function init() {
    initTheme();
    initMenu();
    initSearch();
    initToc();
    initCodeCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
