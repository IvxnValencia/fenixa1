(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function prepareScrollLock() {
    const root = document.documentElement;
    root.style.setProperty('--panel-gutter', window.innerWidth > root.clientWidth ? 'stable' : 'auto');
  }
  document.addEventListener('beforetoggle', event => {
    if (event.newState === 'open' && event.target.matches('dialog')) prepareScrollLock();
  }, true);

  function play(element, name) {
    if (!element || reduced.matches) return;
    if (element.classList.contains(name)) {
      const current = element.getAnimations().find(animation => animation.animationName === name);
      if (current) { current.currentTime = 0; return; }
    }
    element.classList.add(name);
  }

  document.addEventListener('animationend', event => {
    if (event.animationName === 'fx-mark') event.target.classList.remove('fx-mark');
    if (event.animationName === 'fx-reveal' || event.animationName === 'fx-pulse') {
      event.target.classList.remove(event.animationName);
    }
  });

  window.FENIXA_MOTION = {
    prepareScrollLock,
    reveal: element => play(element, 'fx-reveal'),
    pulse: element => play(element, 'fx-pulse')
  };
})();
