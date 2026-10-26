(() => {
  const routes = {
    inicio: { title: 'Armar mi PC', sections: ['#startBuild'] },
    componentes: { title: 'Componentes', sections: ['#componentes', '#catalogo'] },
    'mi-build': { title: 'Mi build', sections: ['#mi-build'] },
    builds: { title: 'Builds completas', sections: ['#builds'] },
    laptops: { title: 'Laptops', sections: ['#laptops'] },
    configurador: { title: 'Mi configuración', sections: ['#startBuild'] },
    'mi-pc': { title: 'Mi PC y mejoras', sections: ['#mi-pc'] },
    ensamblaje: { title: 'Guía de ensamblaje', sections: ['#ensamblaje'] }
  };
  let previousPage;
  function navigate() {
    let hash = location.hash.slice(1);
    if (hash === 'catalogo') { history.replaceState(null, '', '#componentes'); hash = 'componentes'; }
    if (hash === 'compatibilidad') { history.replaceState(null, '', '#builds'); hash = 'builds'; }
    const requested = hash.startsWith('build/') ? 'builds' : hash === 'recomendacion' ? 'configurador' : hash === 'precios' ? 'inicio' : hash;
    const key = Object.hasOwn(routes, requested) ? requested : 'inicio';
    const page = routes[key];
    const visible = new Set(page.sections.map(selector => document.querySelector(selector)));
    document.querySelectorAll('.content > section').forEach(section => { section.hidden = !visible.has(section); section.dataset.pageActive = String(!section.hidden); });
    document.querySelectorAll('.nav-link').forEach(link => {
      const active = link.getAttribute('href') === `#${key}`;
      link.classList.toggle('active', active);
      active ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
    });
    const crumb = document.querySelector('.topbar-search span');
    if (crumb) crumb.textContent = `Tu espacio / ${page.title}`;
    document.title = `${page.title} · FENIXA`;
    if (previousPage !== key) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (previousPage && !hash.startsWith('build/')) {
        const heading = [...visible].find(Boolean)?.querySelector('h1, h2, h3');
        if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      }
    }
    previousPage = key;
  }
  window.addEventListener('hashchange', navigate);
  navigate();
})();
