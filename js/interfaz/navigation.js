(() => {
  const routes = {
    inicio: { title: 'Inicio', sections: ['#welcome'] },
    componentes: { title: 'Componentes', sections: ['#componentes'] },
    'mi-build': { title: 'Mi build', sections: ['#mi-build'] },
    carrito: { title: 'Carrito', sections: ['#carrito'] },
    builds: { title: 'Builds completas', sections: ['#builds'] },
    laptops: { title: 'Laptops', sections: ['#laptops'] },
    configurador: { title: 'Armar mi PC', sections: ['#startBuild'] },
    'mi-pc': { title: 'Mejorar mi PC', sections: ['#mi-pc'] },
    ensamblaje: { title: 'Guía de ensamblaje', sections: ['#ensamblaje'] },
    ayuda: { title: 'Ayuda', sections: ['#ayuda'] }
  };
  let previousPage;
  function navigate() {
    let hash = location.hash.slice(1);
    if (hash === 'configuradorc') { history.replaceState(null, '', '#configurador'); hash = 'configurador'; }
    if (hash === 'catalogo') { history.replaceState(null, '', '#componentes'); hash = 'componentes'; }
    if (hash === 'compatibilidad') { history.replaceState(null, '', '#builds'); hash = 'builds'; }
    const requested = hash.startsWith('ayuda-') ? 'ayuda' : hash.startsWith('mi-pc/') ? 'mi-pc' : hash.startsWith('build/') ? 'builds' : hash.startsWith('componentes/') ? 'componentes' : hash === 'recomendacion' ? 'configurador' : hash === 'precios' ? 'inicio' : hash;
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
    // Temas de Ayuda (#ayuda-precios…): se abre Ayuda y se lleva el tema a la vista.
    if (hash.startsWith('ayuda-')) {
      const topic = document.getElementById(hash);
      if (topic) requestAnimationFrame(() => { topic.scrollIntoView({ block: 'start' }); const h = topic.querySelector('h3'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } });
    }
    previousPage = key;
  }
  window.addEventListener('hashchange', navigate);
  navigate();
})();
