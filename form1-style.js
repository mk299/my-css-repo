(function () {
  'use strict';

  const ROOT_SELECTOR = '.kb-injector';
  const NAV_ID = 'kb-fab-nav';
  const SCROLL_MARGIN = 4;

  /** Boost!Injectorのルートが出るまで待つ */
  function waitForElement(selector, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) { clearInterval(timer); resolve(el); }
        if (Date.now() - start > timeoutMs) { clearInterval(timer); reject(); }
      }, 150);
    });
  }

  /** スクロールできる要素か？ */
  function isScrollable(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    const canScroll = (overflowY === 'auto' || overflowY === 'scroll');
    return canScroll && el.scrollHeight > el.clientHeight + 5;
  }

  /**
   * スクロール対象を決める
   * - まず .kb-injector から祖先方向に「スクロール可能」な要素を探す
   * - なければ window（documentElement）を使う
   */
  function detectScrollTarget(root) {
    // root自身〜祖先をたどる
    let el = root;
    while (el && el !== document.body) {
      if (isScrollable(el)) return el;
      el = el.parentElement;
    }

    // 画面全体スクロールがあるか
    const doc = document.documentElement;
    if (doc.scrollHeight > doc.clientHeight + 5) return window;

    // 最後の保険
    return window;
  }

  /** スクロール値取得 */
  function getScrollState(target) {
    const doc = document.documentElement;

    if (target === window) {
      const y = window.scrollY || doc.scrollTop || 0;
      const maxY = doc.scrollHeight - doc.clientHeight;
      return { y, maxY };
    } else {
      const y = target.scrollTop;
      const maxY = target.scrollHeight - target.clientHeight;
      return { y, maxY };
    }
  }

  /** スクロール実行 */
  function scrollToTop(target) {
    if (target === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      target.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function scrollToBottom(target) {
    if (target === window) {
      const doc = document.documentElement;
      window.scrollTo({ top: doc.scrollHeight, behavior: 'smooth' });
    } else {
      target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' });
    }
  }

  /** ボタン無効化 */
  function updateDisabledState(target, btnUp, btnDown) {
    const { y, maxY } = getScrollState(target);
    btnUp.classList.toggle('is-disabled', y <= SCROLL_MARGIN);
    btnDown.classList.toggle('is-disabled', (maxY - y) <= SCROLL_MARGIN);
  }

  function createFabNav(root) {
    // 二重生成防止
    if (document.getElementById(NAV_ID)) return;

    const target = detectScrollTarget(root);

    // body直下に出す（fixedを確実に）
    const nav = document.createElement('div');
    nav.id = NAV_ID;

    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.textContent = '↑';
    btnUp.title = '一番上へ';
    btnUp.setAttribute('aria-label', '一番上へ');

    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.textContent = '↓';
    btnDown.title = '一番下へ';
    btnDown.setAttribute('aria-label', '一番下へ');
    btnDown.className = 'kb-fab-down';

    btnUp.addEventListener('click', () => scrollToTop(target));
    btnDown.addEventListener('click', () => scrollToBottom(target));

    nav.appendChild(btnUp);
    nav.appendChild(btnDown);
    document.body.appendChild(nav);

    // スクロール対象が window か要素かで監視先を切り替え
    const onScroll = () => updateDisabledState(target, btnUp, btnDown);

    if (target === window) {
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      target.addEventListener('scroll', onScroll, { passive: true });
    }
    window.addEventListener('resize', onScroll);

    // 初期状態
    onScroll();
  }

  waitForElement(ROOT_SELECTOR)
    .then((root) => createFabNav(root))
    .catch(() => {});
})();
