(() => {
  'use strict';
  const { normalize, migrate, advise } = window.FENIXA_PC;
  const key = 'fenixa-pc-v2';
  const section = document.getElementById('mi-pc');
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const field = (id, label, options) => `<label><span>${label}</span><select name="${id}" id="profile-${id}"><option value="">Sin indicar</option>${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;
  const input = (id, label, placeholder) => `<label><span>${label}</span><input id="profile-${id}" name="${id}" maxlength="100" placeholder="${placeholder}" autocomplete="off"></label>`;
  const devices = { desktop: 'PC de escritorio', laptop: 'Laptop' };
  const categoryLabels = {
    storage: 'Ver todos los discos',
    ram: 'Ver todas las memorias',
    gpu: 'Ver todas las gráficas',
    cooler: 'Ver toda la refrigeración'
  };
  const goalLabels = { slow: 'Va lento en general', boot: 'Tarda en encender o abrir programas', memory: 'Me falta memoria (se traba con muchas pestañas o apps)', space: 'Me falta espacio', fps: 'Más FPS en juegos', heat: 'Se calienta o hace ruido', none: 'Nada por ahora' };
  const goalsField = `<fieldset class="profile-goals" id="profileGoals" aria-describedby="profileGoalsHelp"><legend>¿Qué quieres mejorar? <small>(puedes elegir varias)</small></legend><p class="profile-hint" id="profileGoalsHelp">Marca todo lo que notes; combinamos las recomendaciones.</p><div class="profile-goal-options">${Object.entries(goalLabels).map(([value, text]) => `<label class="profile-goal"><input type="checkbox" name="symptoms" value="${value}"><span>${text}</span></label>`).join('')}</div></fieldset>`;

  let saved = null, migrated = false, storageUnavailable = false, sessionOnly = false;
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
        <h2 id="pc-title">Mejorar mi PC</h2>
        <p id="profileIntro">Elige tu equipo para encontrar las mejoras que encajan con tu uso.</p>
      </div>
    </div>
    <div class="profile-layout" id="profileLayout">
      <article class="profile-panel" id="profileDevicePanel" aria-labelledby="profileDeviceTitle">
        <h3 id="profileDeviceTitle" tabindex="-1">¿Qué equipo quieres mejorar?</h3>
        <div class="profile-device-options">
          <button type="button" class="secondary-button" data-device="desktop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M12 17v4m-5 0h10"/></svg>PC de escritorio</button>
          <button type="button" class="secondary-button" data-device="laptop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="12" rx="2"/><path d="m4 16-2 4h20l-2-4"/></svg>Laptop</button>
        </div>
      </article>
      <article class="profile-panel profile-results" id="profileResults" aria-labelledby="profileAdviceTitle" hidden>
        <h3 id="profileAdviceTitle" tabindex="-1">Tus mejoras</h3>
        <div id="profileAdvice"></div>
        <p class="profile-purchase-note" id="profilePurchaseNote" hidden>Confirma la compatibilidad con el modelo exacto antes de comprar.</p>
      </article>
      <article class="profile-panel" id="profileTeamPanel" aria-labelledby="profileTeamTitle" hidden>
        <div class="profile-heading">
          <h3 id="profileTeamTitle" tabindex="-1">Tu perfil</h3>
          <a href="#mi-pc/equipo" id="profileDeviceChange">Cambiar equipo</a>
          <button type="button" class="secondary-button" id="profileEdit" aria-controls="profileForm">Editar equipo</button>
        </div>
        <div id="profileSummary"></div>
        <form id="profileForm">
          <input type="hidden" name="device" id="profile-device">
          <fieldset class="profile-group profile-priority">
            <legend>Uso y objetivo</legend>
            <div class="profile-fields">
              ${field('use', 'Uso principal', [['study', 'Estudio y trabajo'], ['gaming', 'Juegos'], ['creative', 'Edición y creación']])}
            </div>
            ${goalsField}
          </fieldset>
          <details class="profile-hardware">
            <summary>Componentes y almacenamiento (opcional)</summary>
            <div class="profile-hardware-body">
              <fieldset class="profile-group">
                <legend>Modelo y procesador</legend>
                <div class="profile-fields">
                  ${input('name', 'Nombre del equipo', 'Ej.: Mi PC de estudio')}
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
            <button class="primary-button" type="submit">Ver mis mejoras</button>
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
    </div>`;

  const form = $('profileForm');
  const device = $('profile-device');
  const use = $('profile-use');
  const goalBoxes = () => [...form.querySelectorAll('[name="symptoms"]')];
  const goalText = profile => (profile?.symptoms || []).map(g => goalLabels[g]?.replace(/ \(.*\)$/, '')).filter(Boolean).join(' · ');
  use.required = true;
  // «Nada por ahora» es excluyente con el resto.
  form.addEventListener('change', event => {
    if (event.target.name !== 'symptoms' || !event.target.checked) return;
    goalBoxes().forEach(box => { if (event.target.value === 'none' ? box !== event.target : box.value === 'none') box.checked = false; });
  });
  let step = null;

  function restoreForm() {
    setForm(saved);
    if (use.value) return;
    try {
      const builder = JSON.parse(localStorage.getItem('fenixa-builder') || '{}');
      use.value = { estudio:'study', trabajo:'study', gaming:'gaming', creativo:'creative' }[builder.use] || '';
    } catch { /* A profile can be completed without browser storage. */ }
  }

  function setForm(profile) {
    for (const element of form.elements) {
      if (element.name === 'symptoms') element.checked = (profile?.symptoms || []).includes(element.value);
      else if (element.name) element.value = profile?.[element.name] || '';
    }
  }

  function status(message = '', error = false) {
    const feedback = $('profileStatus');
    feedback.toggleAttribute('data-error', error);
    feedback.textContent = message;
  }

  function renderSummary() {
    if (!saved) return;
    const facts = Array.from(form.querySelectorAll('[name]')).filter(control => !['name', 'device', 'symptoms'].includes(control.name) && control.value).map(control => {
      const label = control.labels[0].firstElementChild.textContent;
      const value = control.selectedOptions?.[0].textContent || control.value;
      return `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
    });
    $('profileSummary').innerHTML = `
      <div class="profile-saved">
        <h4>${esc(saved.name || devices[saved.device])}</h4>
        <p class="profile-hint">${sessionOnly ? 'Disponible en esta pestaña.' : 'Guardado en este navegador.'}</p>
      </div>
      <dl>${facts.join('')}<div class="profile-summary-goals"><dt>Quieres mejorar</dt><dd>${esc(goalText(saved))}</dd></div></dl>`;
  }

  function renderAdvice() {
    $('profileAdviceTitle').textContent = saved.device === 'laptop' ? 'Mejoras para tu laptop' : 'Mejoras para tu PC de escritorio';
    const advice = advise(saved);
    $('profilePurchaseNote').hidden = !advice.some(item => ['ssd','ram','space','gpu'].includes(item.id));
    const upgrades = window.FENIXA_PC_UPGRADES, money = window.FENIXA_MARKET.money;
    const thumb = src => window.FENIXA_THUMB ? window.FENIXA_THUMB(src) : src;
    const product = ({ p, note }) => {
      const r = upgrades.reference(p), o = upgrades.offer(p);
      const price = r ? (r.low === r.high ? money(r.low) : money(r.low) + '–' + money(r.high)) : 'Precio por confirmar';
      return `<li class="profile-pick"><img src="${esc(thumb(p.image))}" alt="" width="56" height="56" loading="lazy"><div class="profile-pick-text"><strong title="${esc(p.name)}">${esc(window.FENIXA_SHORT_NAME ? window.FENIXA_SHORT_NAME(p) : p.name)}</strong><small>${esc(note)}</small><span class="profile-pick-price">${esc(price)}${o?.store ? ' · ' + esc(o.store) : ''}</span></div><div class="profile-pick-actions"><button type="button" class="secondary-button" data-pc-category="${esc(p.category)}" data-pc-query="${esc(p.name)}">Ver ficha</button>${o ? `<a class="primary-button" href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">Comprar ↗</a>` : ''}</div></li>`;
    };
    const items = advice.map(item => {
      const picks = item.category && upgrades && !(item.id === 'ram' && !saved.ramType) ? upgrades.suggest(saved, item.id) : [];
      const hint = item.id === 'ram' && !saved.ramType ? '<p class="profile-hint">Indica la generación de tu RAM (DDR3, DDR4 o DDR5) en «Editar equipo» para ver módulos compatibles.</p>' : '';
      return `
      <li class="profile-advice">
        <h4>${esc(item.title)}</h4>
        <p>${esc(item.reason)}</p>
        <p class="profile-check">${esc(item.check)}</p>
        ${hint}
        ${picks.length ? `<h5 class="profile-picks-title">Opciones del catálogo</h5><ul class="profile-picks">${picks.map(product).join('')}</ul>` : ''}
        ${item.category ? `<button type="button" class="text-button profile-see-all" data-pc-category="${esc(item.category)}" data-pc-query="${esc(item.query)}">${esc(categoryLabels[item.category] || 'Ver en el catálogo')} →</button>` : ''}
      </li>`;
    });
    $('profileAdvice').innerHTML = `<ul class="profile-advice-list">${items.join('')}</ul>`;
  }

  function syncStep() {
    const match = /^#mi-pc(?:\/(equipo|perfil|mejoras))?$/.exec(location.hash);
    if (!match) { step = null; return; }
    if (!step || !match[1]) restoreForm();
    const complete = Boolean(saved?.device && saved.use && saved.symptoms?.length);
    const entry = complete ? 'mejoras' : device.value ? 'perfil' : 'equipo';
    let next = match[1] || entry;
    if (next === 'mejoras' && !complete) next = entry;
    if (next === 'perfil' && !device.value) next = 'equipo';
    const route = '#mi-pc/' + next;
    if (location.hash !== route) history.replaceState(null, '', route);
    step = next;
    const editing = step === 'perfil', results = step === 'mejoras';
    $('profileDevicePanel').hidden = step !== 'equipo';
    $('profileTeamPanel').hidden = step === 'equipo';
    $('profileResults').hidden = !results;
    $('profileLayout').dataset.step = step;
    $('profileSummary').hidden = !results;
    $('profileEdit').hidden = !results;
    $('profileDeviceChange').hidden = !editing;
    $('profileCancel').hidden = !complete;
    form.hidden = !editing;
    $('profileTeamPanel').querySelector('.profile-help').hidden = !editing;
    if (results) setForm(saved);
    $('profileTeamTitle').textContent = results ? 'Tu perfil' : 'Tu perfil de ' + (device.value === 'laptop' ? 'laptop' : 'escritorio');
    $('profile-board').labels[0].firstElementChild.textContent = device.value === 'laptop' ? 'Modelo exacto de la laptop' : 'Modelo de placa base';
    if (results) { renderSummary(); renderAdvice(); }
    $('profileIntro').textContent = results ? use.selectedOptions[0].textContent + ' · ' + goalText(saved) :
      editing ? 'Elige tu uso principal y qué quieres mejorar. Puedes añadir los componentes que conozcas.' :
      'Elige tu equipo para encontrar las mejoras que encajan con tu uso.';
    status(storageUnavailable ? 'No se pudo leer el perfil guardado.' : migrated ? 'Recuperamos tus datos anteriores. Completa tu perfil para ver las mejoras.' : '', storageUnavailable);
    const panel = results ? $('profileResults') : editing ? $('profileTeamPanel') : $('profileDevicePanel');
    requestAnimationFrame(() => {
      if (location.hash !== route) return;
      const heading = panel.querySelector('h3');
      heading.focus({preventScroll:true});
      heading.scrollIntoView({block:'nearest', behavior:'instant'});
      window.FENIXA_MOTION?.reveal(results ? $('profileAdvice') : panel);
    });
  }

  $('profileDevicePanel').addEventListener('click', event => {
    const choice = event.target.closest('[data-device]');
    if (!choice) return;
    const nextDevice = choice.dataset.device;
    if (device.value && device.value !== nextDevice) {
      const hardware = saved?.device === nextDevice ? saved : {};
      setForm({ ...hardware, use: use.value, symptoms: goalBoxes().filter(box => box.checked).map(box => box.value) });
    }
    device.value = nextDevice;
    location.hash = 'mi-pc/perfil';
  });
  $('profileEdit').addEventListener('click', () => { restoreForm(); location.hash = 'mi-pc/perfil'; });
  $('profileCancel').addEventListener('click', () => { restoreForm(); location.hash = 'mi-pc/mejoras'; });
  form.addEventListener('input', () => {
    goalBoxes()[0].setCustomValidity('');
    status(saved ? 'Cambios sin guardar.' : '');
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form), raw = Object.fromEntries(data);
    raw.symptoms = data.getAll('symptoms');
    const value = normalize(raw);
    if (!value.device) { location.hash = 'mi-pc/equipo'; return; }
    const first = goalBoxes()[0];
    first.setCustomValidity(value.symptoms.length ? '' : 'Elige al menos una opción de «¿Qué quieres mejorar?».');
    if (!form.reportValidity()) return;
    try { localStorage.setItem(key, JSON.stringify(value)); sessionOnly = false; }
    catch { sessionOnly = true; }
    saved = value;
    migrated = false;
    storageUnavailable = false;
    window.dispatchEvent(new Event('fenixa-profile-changed'));
    location.hash = 'mi-pc/mejoras';
  });
  $('profileAdvice').addEventListener('click', event => {
    const button = event.target.closest('[data-pc-category]');
    if (!button) return;
    window.FENIXA_BROWSE_CATEGORY(button.dataset.pcCategory, button.dataset.pcQuery);
  });
  window.addEventListener('hashchange', syncStep);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncStep, {once:true});
  else syncStep();
})();
