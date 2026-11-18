(() => {
  'use strict';
  // Reuse the cart section: one set of ids, events and storage in either view.
  const root = document.getElementById('carrito');
  if (!root || typeof document.createElement !== 'function') return;
  const drawer = document.createElement('dialog');
  if (typeof drawer.showModal !== 'function') return;
  drawer.id = 'cartDrawer';
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-labelledby', 'cartDrawerTitle');
  drawer.innerHTML = '<header class="cart-drawer-header"><div><h2 id="cartDrawerTitle" tabindex="-1">Carrito</h2><p>Tu selección y las builds que quieres conservar.</p></div><button class="secondary-button cart-drawer-close" type="button" data-close-cart aria-label="Cerrar carrito" autofocus><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><div class="cart-drawer-content"></div><footer class="cart-drawer-footer"><a class="secondary-button" href="#carrito" data-cart-full>Ver carrito completo</a></footer>';
  document.body.append(drawer);
  const content = drawer.querySelector('.cart-drawer-content');
  const title = drawer.querySelector('#cartDrawerTitle');
  let session = null;
  let outsidePointer = false;

  function setExpanded(expanded) {
    document.querySelectorAll('[data-open-cart]').forEach(link => link.setAttribute('aria-expanded', String(expanded)));
  }
  function restoreStyle(style, name, value, priority) {
    if (value) style.setProperty(name, value, priority);
    else style.removeProperty(name);
  }
  function finishClose(restoreFocus) {
    if (!session) return;
    const saved = session;
    session = null;
    drawer.removeAttribute('data-closing');
    saved.marker.replaceWith(root);
    const routeChanged = location.hash !== saved.hash;
    root.hidden = routeChanged ? location.hash !== '#carrito' : saved.hidden;
    const pageActive = routeChanged ? String(!root.hidden) : saved.pageActive;
    if (pageActive === null) root.removeAttribute('data-page-active');
    else root.setAttribute('data-page-active', pageActive);
    restoreStyle(document.body.style, 'overflow', saved.overflow, saved.overflowPriority);
    restoreStyle(document.body.style, 'padding-right', saved.padding, saved.paddingPriority);
    setExpanded(false);
    if (!restoreFocus) return;
    window.scrollTo({ left: saved.scrollX, top: saved.scrollY, behavior: 'instant' });
    const trigger = saved.trigger;
    const usable = trigger?.isConnected && !trigger.closest('[inert], [hidden]') && trigger.getClientRects().length;
    const fallback = document.querySelector('.mobile-menu');
    const target = usable ? trigger : fallback?.getClientRects().length ? fallback : document.querySelector('[data-open-cart]');
    target?.focus({ preventScroll: true });
  }
  function close({ restoreFocus = true } = {}) {
    if (!session) return;
    const saved = session;
    const finish = () => {
      if (session !== saved) return;
      if (drawer.open) drawer.close();
      finishClose(restoreFocus);
    };
    // Navigation needs the cart section back before the router changes pages.
    if (!restoreFocus) { finish(); return; }
    if (drawer.hasAttribute('data-closing')) return;
    drawer.setAttribute('data-closing', '');
    const exit = drawer.getAnimations?.().find(a => a.transitionProperty === 'transform');
    if (!exit) { finish(); return; }
    saved.exit = exit;
    const afterExit = () => { if (saved.exit === exit && drawer.hasAttribute('data-closing')) finish(); };
    exit.finished.then(afterExit, afterExit);
  }
  function open(trigger = document.activeElement) {
    if (drawer.open) { drawer.removeAttribute('data-closing'); return true; }
    if (document.querySelector('dialog[open]')) return false;
    // The menu's existing scrim handler also restores its inert/expanded state.
    if (document.getElementById('siteMenu')?.classList.contains('menu-open')) document.querySelector('.menu-scrim')?.click();
    const style = document.body.style;
    const marker = root.hidden ? document.createComment('cart home') : document.createElement('div');
    if (!root.hidden) {
      marker.setAttribute('aria-hidden', 'true');
      marker.style.height = root.getBoundingClientRect().height + 'px';
      marker.style.marginTop = getComputedStyle(root).marginTop;
    }
    session = {
      trigger, marker, hash: location.hash, hidden: root.hidden, pageActive: root.getAttribute('data-page-active'),
      scrollX: window.scrollX, scrollY: window.scrollY,
      overflow: style.getPropertyValue('overflow'), overflowPriority: style.getPropertyPriority('overflow'),
      padding: style.getPropertyValue('padding-right'), paddingPriority: style.getPropertyPriority('padding-right')
    };
    root.before(marker);
    content.append(root);
    root.hidden = false;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbar > 0) style.paddingRight = (parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar) + 'px';
    style.overflow = 'hidden';
    try { drawer.showModal(); }
    catch { finishClose(false); return false; }
    drawer.scrollTop = 0;
    content.scrollTop = 0;
    setExpanded(true);
    drawer.querySelector('[data-close-cart]').focus({ preventScroll: true });
    return true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-open-cart]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!open(link)) return;
    event.preventDefault();
    // The shared menu click handler marks links active; the route stays current.
    document.querySelectorAll('.nav-link').forEach(item => item.classList.toggle('active', item.getAttribute('aria-current') === 'page'));
  });
  drawer.addEventListener('click', event => {
    if (drawer.hasAttribute('data-closing')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  drawer.addEventListener('click', event => {
    if (event.target.closest('[data-close-cart]')) { close(); return; }
    const link = event.target.closest('a[href]');
    if (link && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && (!link.target || link.target === '_self')) close({ restoreFocus: false });
  });
  function isOutside(event) {
    const box = drawer.getBoundingClientRect();
    return event.target === drawer && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
  }
  drawer.addEventListener('pointerdown', event => { outsidePointer = isOutside(event); });
  drawer.addEventListener('click', event => {
    if (outsidePointer && isOutside(event)) close();
    outsidePointer = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !drawer.open || document.querySelector('dialog[open]:not(#cartDrawer)')) return;
    const focusable = [...drawer.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]')].filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[hidden], [inert]') && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (!first) { event.preventDefault(); title.focus({ preventScroll: true }); return; }
    const current = document.activeElement;
    if (!focusable.includes(current) || (event.shiftKey ? current === first : current === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus({ preventScroll: true });
    }
  }, true);
  drawer.addEventListener('cancel', event => { event.preventDefault(); close(); });
  drawer.addEventListener('close', () => { if (!drawer.open) finishClose(true); });
  // Existing confirmation dialogs return here if rendering removed their opener.
  drawer.addEventListener('focusin', event => { if (event.target.id === 'cartTitle') title.focus({ preventScroll: true }); });
  window.addEventListener('hashchange', () => close({ restoreFocus: false }), true);
  window.addEventListener('pagehide', () => close({ restoreFocus: false }));
  window.FENIXA_CART_DRAWER = { open, close };
})();
