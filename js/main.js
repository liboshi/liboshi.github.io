/* 站点交互：主题切换 + 移动端导航 */
(function () {
  'use strict';

  var root = document.documentElement;
  var topbar = document.querySelector('.topbar');
  var themeToggle = document.getElementById('theme-toggle');
  var menuToggle = document.getElementById('menu-toggle');
  var siteNav = document.getElementById('site-nav');

  function prefersDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit === 'light' || explicit === 'dark') return explicit;
    return prefersDark() ? 'dark' : 'light';
  }

  function syncThemeUi() {
    var isDark = currentTheme() === 'dark';
    var themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (themeColor) {
      themeColor.setAttribute('content', isDark ? '#18191A' : '#FFFFFF');
    }
  }

  // 切换主题的一瞬间先关掉所有过渡，避免出现“浅色文字停在深色底上”
  // 或反之的闪烁（顶部导航栏的品牌名尤其明显）。
  function withoutTransitions(fn) {
    root.classList.add('theme-switching');
    fn();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        root.classList.remove('theme-switching');
      });
    });
  }

  function applyTheme(next) {
    withoutTransitions(function () {
      root.setAttribute('data-theme', next);
      syncThemeUi();
    });
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* 隐私模式下忽略 */
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
    syncThemeUi();
  }

  if (menuToggle && siteNav && topbar) {
    var closeMenu = function () {
      topbar.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', function () {
      var isOpen = topbar.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && topbar.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  if (window.matchMedia) {
    var media = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () {
      if (!root.hasAttribute('data-theme')) {
        withoutTransitions(syncThemeUi);
      }
    };
    if (media.addEventListener) {
      media.addEventListener('change', onChange);
    } else if (media.addListener) {
      media.addListener(onChange);
    }
  }
})();
