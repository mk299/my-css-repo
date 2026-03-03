(function () {
  'use strict';

  const NAV_ID = 'kb-fab-nav';
  const POPUP_SELECTOR = '.kb-echo-popup';
  const SCROLL_MARGIN = 4;

  function waitForElement(selector, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) { clearInterval(timer); resolve(el); }
        if (Date.now() - start > timeoutMs) { clearInterval(timer); reject(); }
      }, 150);
    });
  }

  function ensureNav() {
    if (document.getElementById(NAV_ID)) return document.getElementById(NAV_ID);

    const nav = document.createElement('div');
    nav.id = NAV_ID;

    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.textContent = '↑';
    btnUp.title = '一番上へ';

    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.textContent = '↓';
    btnDown.title = '一番下へ';
    btnDown.className = 'kb-fab-down';

    nav.appendChild(btnUp);
    nav.appendChild(btnDown);
    document.body.appendChild(nav);

    return nav;
  }

  function updateDisabled(popup, btnUp, btnDown) {
    const y = popup.scrollTop;
    const maxY = popup.scrollHeight - popup.clientHeight;

    btnUp.classList.toggle('is-disabled', y <= SCROLL_MARGIN);
    btnDown.classList.toggle('is-disabled', (maxY - y) <= SCROLL_MARGIN);
  }

  function bind(popup) {
    const nav = ensureNav();
    const btnUp = nav.querySelector('button:nth-child(1)');
    const btnDown = nav.querySelector('button:nth-child(2)');

    btnUp.onclick = () => popup.scrollTo({ top: 0, behavior: 'smooth' });
    btnDown.onclick = () => popup.scrollTo({ top: popup.scrollHeight, behavior: 'smooth' });

    const onScroll = () => updateDisabled(popup, btnUp, btnDown);
    popup.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    onScroll();
  }

  // popupが出現してから紐付け
  waitForElement(POPUP_SELECTOR)
    .then((popup) => bind(popup))
    .catch(() => {});
})();
