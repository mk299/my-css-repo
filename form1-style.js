(function () {
  'use strict';

  // ====== 設定 ======
  const ROOT_SELECTOR = '.kb-injector';      // Boost!Injectorのルート
  const NAV_ID = 'kb-fab-nav';               // 追従ボタンコンテナID
  const SCROLL_MARGIN = 4;                   // 末端判定の誤差吸収

  // ルート要素を待つ（Boost!Injectorが後から描画されるケース対策）
  function waitForElement(selector, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        }
        if (Date.now() - start > timeoutMs) {
          clearInterval(timer);
          reject(new Error('Element not found: ' + selector));
        }
      }, 150);
    });
  }

  // スクロール先（上 / 下）
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function scrollToBottom() {
    const doc = document.documentElement;
    const bottom = doc.scrollHeight;
    window.scrollTo({ top: bottom, behavior: 'smooth' });
  }

  // 端っこ判定（ボタン無効化用）
  function updateDisabledState(btnUp, btnDown) {
    const doc = document.documentElement;
    const y = window.scrollY || doc.scrollTop;
    const maxY = doc.scrollHeight - doc.clientHeight;

    // 上端/下端判定
    const atTop = y <= SCROLL_MARGIN;
    const atBottom = (maxY - y) <= SCROLL_MARGIN;

    btnUp.classList.toggle('is-disabled', atTop);
    btnDown.classList.toggle('is-disabled', atBottom);
  }

  function createFabNav(root) {
    // 二重生成防止
    if (document.getElementById(NAV_ID)) return;

    const nav = document.createElement('div');
    nav.id = NAV_ID;
    nav.className = 'kb-fab-nav';

    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.className = 'kb-fab-up';
    btnUp.title = '一番上へ';
    btnUp.setAttribute('aria-label', '一番上へ');
    btnUp.textContent = '↑';

    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.className = 'kb-fab-down';
    btnDown.title = '一番下へ';
    btnDown.setAttribute('aria-label', '一番下へ');
    btnDown.textContent = '↓';

    btnUp.addEventListener('click', scrollToTop);
    btnDown.addEventListener('click', scrollToBottom);

    nav.appendChild(btnUp);
    nav.appendChild(btnDown);

    // どこに入れてもfixedなのでOK。管理しやすいようにroot配下へ。
    root.appendChild(nav);

    // 初期状態更新＋スクロールに追従して無効化
    const onScroll = () => updateDisabledState(btnUp, btnDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    onScroll();
  }

  // 実行
  waitForElement(ROOT_SELECTOR)
    .then((root) => createFabNav(root))
    .catch(() => {
      // Boost!Injectorが無い画面では何もしない
    });
})();
