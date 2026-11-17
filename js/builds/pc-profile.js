(() => {
  'use strict';
  const { normalize, migrate, advise } = window.FENIXA_PC;
  const key = 'fenixa-pc-v2';
  const section = document.getElementById('mi-pc');
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const field = (id, label, options) => `<label><span>${label}</span><select name="${id}" id="profile-${id}"><option value="">Sin indicar</option>${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;
  const input = (id, label, placeholder) => `<label><span>${label}</span><input id="profile-${id}" name="${id}" maxlength="100" placeholder="${placeholder}" autocomplete="off"></label>`;
  const categoryLabels = {
    storage: 'Ver discos en el catálogo',
    ram: 'Ver memorias RAM',
    gpu: 'Ver tarjetas gráficas'
  };

  let saved = null, migrated = false, storageUnavailable = false;
  try {
    const existing = localStorage.getItem(key);
    if (existing) {
      const value = normalize(JSON.parse(existing));
      if (Object.values(value).some(Boolean)) saved = value;
    } else {
      const old = localStorage.getItem('fenixa-pc');
      if (old) {
        const value = migrate(JSON.parse(old));
        if (Object.values(value).some(Boolean)) {
          saved = value;
          migrated = true;
        }
      }
    }
  } catch { storageUnavailable = true; }

  section.innerHTML = `
    <div class="section-heading">
      <div>
        <h2 id="pc-title">Mi PC y mejoras</h2>
        <p>Registra tu equipo actual y descubre qué revisar antes de actualizarlo.</p>
      </div>
    </div>
    <div class="profile-layout">
      <article class="profile-panel" aria-labelledby="profileTeamTitle">
        <div class="profile-heading">
          <h3 id="profileTeamTitle">Mi equipo</h3>
          <button type="button" class="secondary-button" id="profileEdit" aria-controls="profileForm">Editar equipo</button>
        </div>
        <div id="profileSummary"></div>
        <form id="profileForm">
          <p class="profile-hint">Indica al menos un dato. Puedes dejar en blanco lo que desconozcas.</p>
          <fieldset class="profile-group profile-priority">
            <legend>Uso y equipo</legend>
            <div class="profile-fields">
              ${field('use', 'Uso principal', [['study', 'Estudio y trabajo'], ['gaming', 'Juegos'], ['creative', 'Edición y creación']])}
              ${field('symptom', '¿Qué quieres mejorar?', [['none', 'Nada por ahora'], ['slow', 'Lentitud'], ['memory', 'Me falta memoria'], ['space', 'Me falta espacio'], ['fps', 'FPS en juegos']])}
              ${field('device', 'Tipo de equipo', [['desktop', 'Escritorio'], ['laptop', 'Portátil']])}
              ${input('name', 'Nombre del equipo', 'Ej.: Mi PC de estudio')}
            </div>
          </fieldset>
          <details class="profile-hardware">
            <summary>Componentes y almacenamiento</summary>
            <div class="profile-hardware-body">
              <fieldset class="profile-group">
                <legend>Modelo y procesador</legend>
                <div class="profile-fields">
                  ${input('cpu', 'Procesador', 'Ej.: Ryzen 5 3600')}
                  ${input('board', 'Placa base o modelo del portátil', 'Modelo exacto')}
                </div>
              </fieldset>
              <fieldset class="profile-group">
                <legend>Memoria y gráficos</legend>
                <div class="profile-fields">
                  ${field('ramGb', 'Cantidad de RAM', ['4', '8', '16', '32', '64', '128'].map(v => [v, `${v} GB`]))}
                  ${field('ramType', 'Generación de RAM', ['DDR3', 'DDR4', 'DDR5'].map(v => [v, v]))}
                  ${field('graphics', 'Tipo de gráficos', [['integrated', 'Integrados'], ['dedicated', 'Tarjeta dedicada']])}
                  ${input('gpu', 'Modelo de la gráfica', 'Ej.: GeForce GTX 1660')}
                </div>
              </fieldset>
              <fieldset class="profile-group">
                <legend>Almacenamiento</legend>
                <div class="profile-fields">
                  ${field('storageType', 'Disco del sistema', [['hdd', 'HDD mecánico'], ['sata', 'SSD SATA'], ['nvme', 'SSD NVMe'], ['ssd', 'SSD sin identificar']])}
                  ${input('storageGb', 'Capacidad de almacenamiento', 'Ej.: 512 GB o 1 TB')}
                </div>
              </fieldset>
            </div>
          </details>
          <div class="profile-actions">
            <button class="primary-button" type="submit">Guardar y ver orientación</button>
            <button class="secondary-button" type="button" id="profileCancel">Cancelar</button>
          </div>
        </form>
        <p id="profileStatus" class="profile-hint" role="status"></p>
        <details class="profile-help">
          <summary>Cómo identificar mi PC</summary>
          <div>
            <p>En Windows, abre el <strong>Administrador de tareas → Rendimiento</strong> para consultar el procesador, la memoria, el disco y la gráfica.</p>
            <p>Abre <strong>Información del sistema</strong> desde Inicio para buscar el modelo del equipo o de la placa base. Confirma la generación de la RAM y los conectores en el manual del modelo exacto.</p>
            <p>En otros sistemas, consulta la información de hardware y el manual del fabricante. Evita introducir números de serie, claves o datos personales.</p>
          </div>
        </details>
      </article>
      <article class="profile-panel profile-results" aria-labelledby="profileAdviceTitle">
        <h3 id="profileAdviceTitle" tabindex="-1">Orientación de mejoras</h3>
        <div id="profileAdvice"></div>
        <p class="profile-purchase-note" id="profilePurchaseNote" hidden>Confirma la compatibilidad con el modelo exacto antes de comprar.</p>
      </article>
    </div>`;

  const form = $('profileForm');

  function setForm(profile) {
    for (const element of form.elements) {
      if (element.name) element.value = profile?.[element.name] || '';
    }
  }

  function setEditing(editing) {
    $('profileEdit').hidden = !saved || editing;
    $('profileCancel').hidden = !saved;
    $('profileSummary').hidden = !saved || editing;
    form.hidden = Boolean(saved) && !editing;
  }

  function status(message = '', error = false) {
    const feedback = $('profileStatus');
    feedback.toggleAttribute('data-error', error);
    feedback.textContent = message;
  }

  function renderSummary() {
    if (!saved) return;
    const facts = Array.from(form.querySelectorAll('[name]')).filter(control => control.name !== 'name' && control.value).map(control => {
      const label = control.labels[0].firstElementChild.textContent;
      const value = control.selectedOptions?.[0].textContent || control.value;
      return `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
    });
    $('profileSummary').innerHTML = `
      <div class="profile-saved">
        <h4>${esc(saved.name || 'Mi PC')}</h4>
        <p class="profile-hint">Guardado en este navegador.</p>
      </div>
      ${facts.length ? `<dl>${facts.join('')}</dl>` : ''}`;
  }

  function renderAdvice() {
    $('profileAdviceTitle').textContent = saved ? 'Qué revisar antes de comprar' : 'Orientación de mejoras';
    $('profilePurchaseNote').hidden = !saved;
    if (!saved) {
      $('profileAdvice').innerHTML = '<p class="profile-empty">Guarda los datos que conozcas para ver qué revisar en tu equipo según el uso y la mejora que buscas.</p>';
      return;
    }
    const items = advise(saved).map(item => `
      <li class="profile-advice">
        <h4>${esc(item.title)}</h4>
        <p>${esc(item.reason)}</p>
        <p class="profile-check">${esc(item.check)}</p>
        ${item.category ? `<button type="button" class="secondary-button" data-pc-category="${esc(item.category)}" data-pc-query="${esc(item.query)}">${esc(categoryLabels[item.category] || 'Ver en el catálogo')}</button>` : ''}
      </li>`);
    $('profileAdvice').innerHTML = `<ul class="profile-advice-list">${items.join('')}</ul>`;
  }

  function render() {
    setEditing(false);
    renderSummary();
    renderAdvice();
    if (storageUnavailable) {
      status('No se pudo leer el perfil guardado. Puedes registrarlo de nuevo.', true);
    } else if (migrated) {
      status('Recuperamos tu perfil anterior. Revisa los datos y completa lo que falte.');
    } else {
      status();
    }
  }

  $('profileEdit').addEventListener('click', () => {
    setEditing(true);
    status('La orientación se actualizará al guardar.');
    $('profile-use').focus();
  });
  $('profileCancel').addEventListener('click', () => {
    setForm(saved);
    render();
    $('profileEdit').focus();
  });
  form.addEventListener('input', () => {
    status(saved ? 'Cambios sin guardar.' : '');
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = normalize(Object.fromEntries(new FormData(form)));
    if (!Object.values(value).some(Boolean)) {
      status('Indica al menos un dato para guardar tu equipo.', true);
      return;
    }
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {
      status('No se pudo guardar. Revisa si el navegador permite el almacenamiento local. Tus cambios siguen en el formulario.', true);
      return;
    }
    saved = value;
    migrated = false;
    storageUnavailable = false;
    setForm(saved);
    render();
    window.dispatchEvent(new Event('fenixa-profile-changed'));
    $('profileAdviceTitle').focus();
  });
  $('profileAdvice').addEventListener('click', event => {
    const button = event.target.closest('[data-pc-category]');
    if (!button) return;
    $('categoryFilter').value = button.dataset.pcCategory;
    $('catalogSearch').value = button.dataset.pcQuery;
    $('catalogMax').value = '';
    const route = 'componentes/' + button.dataset.pcCategory;
    window.addEventListener('hashchange', () => {
      requestAnimationFrame(() => {
        if (location.hash === '#' + route) $('catalog-title')?.focus({ preventScroll: true });
      });
    }, { once: true });
    location.hash = route;
  });
  setForm(saved);
  render();
})();
