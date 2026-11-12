(() => {
  const sidebar = document.getElementById('siteMenu'), toggle = document.querySelector('.sidebar-toggle');
  const desktop = window.matchMedia('(min-width: 1024px)'), KEY = 'fenixa-sidebar-collapsed';
  function setCollapsed(collapsed, save) {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!collapsed));
      const label = collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral';
      toggle.setAttribute('aria-label', label); toggle.title = label;
    }
    if (save) { try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch (error) {} }
  }
  function syncSidebar() {
    if (!sidebar) return;
    if (desktop.matches) { sidebar.inert = false; sidebar.classList.remove('menu-open'); const scrim = document.querySelector('.menu-scrim'); if (scrim) scrim.hidden = true; }
    else if (!sidebar.classList.contains('menu-open')) sidebar.inert = true;
  }
  let stored = null; try { stored = localStorage.getItem(KEY); } catch (error) {}
  setCollapsed(stored === '1', false);
  toggle?.addEventListener('click', () => setCollapsed(!document.body.classList.contains('sidebar-collapsed'), true));
  desktop.addEventListener?.('change', syncSidebar);
  syncSidebar();
})();
