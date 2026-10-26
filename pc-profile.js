(() => {
  'use strict';
  const { normalize, migrate, advise } = window.FENIXA_PC;
  const key = 'fenixa-pc-v2', section = document.getElementById('mi-pc');
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const field = (id, label, options) => `<label>${label}<select name="${id}" id="profile-${id}"><option value="">No lo sé / sin indicar</option>${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;
  const input = (id, label, placeholder) => `<label>${label}<input id="profile-${id}" name="${id}" maxlength="100" placeholder="${placeholder}" autocomplete="off"></label>`;
  let saved = null, migrated = false, storageUnavailable = false;
  try {
    const existing = localStorage.getItem(key);
    if (existing) {
      const value = normalize(JSON.parse(existing));
      if (Object.values(value).some(Boolean)) saved = value;
    } else {
      const old = localStorage.getItem('fenixa-pc');
      if (old) { const value = migrate(JSON.parse(old)); if (Object.values(value).some(Boolean)) { saved = value; migrated = true; } }
    }
  } catch { storageUnavailable = true; }
  section.innerHTML = `
    <div class="section-heading"><div><span class="eyebrow">CONOCE TU PUNTO DE PARTIDA</span><h2 id="pc-title">Tu PC. Tu siguiente paso.</h2><p>Registra tu equipo y decide qué merece una mejora, sin cambiarlo todo.</p></div><span class="saved-badge">Solo en este navegador</span></div>
    <details class="profile-help"><summary>¿Cómo identificar mi PC?</summary><div><p>El navegador no puede detectar todos tus componentes. Puedes introducirlos manualmente; no necesitas instalar nada desde FENIXA.</p><ol><li>En Windows abre el <strong>Administrador de tareas → Rendimiento</strong>: revisa CPU, memoria, disco y GPU.</li><li>Busca <strong>Información del sistema</strong> en Inicio: anota el modelo del equipo y de la placa base si aparece.</li><li>Confirma el tipo de RAM, conectores y posibilidades de ampliación en el manual del modelo exacto. Si un dato no aparece, déjalo sin indicar.</li></ol><p>No compartas números de serie, claves ni datos personales. En otros sistemas, consulta la información de hardware y el manual del fabricante.</p></div></details>
    <div class="profile-layout">
      <article class="profile-panel"><div class="profile-heading"><h3>Mi equipo</h3><button type="button" class="section-link" id="profileEdit">Editar</button></div>
        <p id="profileStatus" role="status"></p><div id="profileSummary"></div>
        <form id="profileForm"><p class="profile-hint">Completa lo que conozcas. Los campos son opcionales.</p><div class="profile-fields">
          ${input('name', 'Nombre del equipo', 'Ej.: Mi PC de estudio')}
          ${field('device', 'Tipo de equipo', [['desktop','Escritorio'],['laptop','Portátil']])}
          ${input('cpu', 'Procesador', 'Ej.: AMD Ryzen 5 3600')}
          ${input('board', 'Placa base / modelo de portátil', 'Modelo exacto, si lo conoces')}
          ${field('ramGb', 'Cantidad de RAM', ['4','8','16','32','64','128'].map(v => [v,`${v} GB`]))}
          ${field('ramType', 'Generación de RAM', ['DDR3','DDR4','DDR5'].map(v => [v,v]))}
          ${field('graphics', 'Tipo de gráficos', [['integrated','Integrados'],['dedicated','Tarjeta dedicada']])}
          ${input('gpu', 'Modelo de gráfica', 'Ej.: NVIDIA GeForce GTX 1660')}
          ${field('storageType', 'Disco del sistema', [['hdd','HDD · disco mecánico'],['sata','SSD SATA'],['nvme','SSD NVMe'],['ssd','SSD · conexión desconocida']])}
          ${input('storageGb', 'Capacidad de almacenamiento', 'Ej.: 512 GB o 1 TB')}
          ${field('use', 'Uso principal', [['study','Estudio y trabajo'],['gaming','Juegos'],['creative','Edición y creación']])}
          ${field('symptom', '¿Qué quieres mejorar?', [['none','Nada por ahora'],['slow','Arranque o programas lentos'],['memory','Se llena la memoria'],['space','Me falta espacio'],['fps','Rendimiento en juegos']])}
        </div><div class="profile-actions"><button class="primary-button" type="submit">Guardar y ver orientación</button><button class="secondary-button" type="button" id="profileCancel">Cancelar</button></div></form>
      </article>
      <article class="profile-panel profile-results" aria-labelledby="profileAdviceTitle"><span class="eyebrow">PLAN DE MEJORA</span><h3 id="profileAdviceTitle" tabindex="-1">Primero conoce tu equipo</h3><p class="profile-hint">Orientación según los datos que registres. No es detección de hardware, una medición de rendimiento ni una garantía de compatibilidad.</p><div id="profileAdvice"></div></article>
    </div>`;
  const form = $('profileForm');
  const labels = { cpu: 'Procesador', board: 'Placa / equipo', gpu: 'Gráfica', ramGb: 'RAM (GB)', ramType: 'Generación', storageGb: 'Capacidad' };
  function setForm(profile) {
    for (const element of form.elements) if (element.name) element.value = profile?.[element.name] || '';
  }
  function render() {
    $('profileEdit').hidden = !saved;
    $('profileCancel').hidden = !saved;
    form.hidden = Boolean(saved);
    $('profileStatus').textContent = storageUnavailable ? 'No se pudo leer el perfil guardado. Puedes registrarlo de nuevo.' : migrated ? 'Perfil anterior recuperado. Confirma los datos y completa lo que falta.' : saved ? 'Perfil guardado en este navegador. No se sincroniza con otros dispositivos.' : 'Aún no registraste tu PC.';
    $('profileSummary').innerHTML = saved ? `<h4>${esc(saved.name || 'Mi PC')}</h4><dl>${Object.entries(labels).map(([id, label]) => `<div><dt>${label}</dt><dd>${esc(saved[id] || 'Sin indicar')}</dd></div>`).join('')}${['device','graphics','storageType','use','symptom'].map(id => `<div><dt>${esc($(`profile-${id}`).parentElement.firstChild.textContent)}</dt><dd>${esc($(`profile-${id}`).selectedOptions[0].textContent)}</dd></div>`).join('')}</dl>` : '<div class="profile-empty">Tu configuración aparecerá aquí.<br>No asignamos componentes de ejemplo a tu equipo.</div>';
    $('profileAdviceTitle').textContent = saved ? 'Qué revisar antes de comprar' : 'Primero conoce tu equipo';
    $('profileAdvice').innerHTML = saved ? advise(saved).map((item, index) => `<div class="profile-advice"><span class="eyebrow">PASO ${String(index + 1).padStart(2,'0')}</span><h4>${esc(item.title)}</h4><p>${esc(item.reason)}</p><small>${esc(item.check)}</small>${item.category ? `<button type="button" class="section-link" data-pc-category="${item.category}" data-pc-query="${item.query}">Explorar categoría · sin compatibilidad verificada →</button>` : ''}</div>`).join('') : '<div class="profile-empty">Guarda los datos que conozcas para recibir una ruta de revisión. Puedes empezar aunque no sepas todos los modelos.</div>';
  }
  $('profileEdit').addEventListener('click', () => { setForm(saved); form.hidden = false; $('profileStatus').textContent = 'Editando: guarda para actualizar la orientación.'; $('profile-name').focus(); });
  $('profileCancel').addEventListener('click', () => { setForm(saved); render(); $('profileEdit').focus(); });
  form.addEventListener('input', () => { $('profileStatus').textContent = 'Cambios sin guardar. La orientación aún corresponde al perfil anterior.'; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = normalize(Object.fromEntries(new FormData(form)));
    if (!Object.values(value).some(Boolean)) { $('profileStatus').textContent = 'Indica al menos un dato para guardar tu equipo.'; return; }
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { $('profileStatus').textContent = 'No se pudo guardar. Revisa si el navegador permite almacenamiento local; tus cambios siguen en el formulario.'; return; }
    saved = value; migrated = false; storageUnavailable = false;
    setForm(saved); render(); window.dispatchEvent(new Event('fenixa-profile-changed')); $('profileAdviceTitle').focus();
  });
  $('profileAdvice').addEventListener('click', event => {
    const button = event.target.closest('[data-pc-category]');
    if (!button) return;
    $('categoryFilter').value = button.dataset.pcCategory;
    $('catalogSearch').value = button.dataset.pcQuery;
    $('catalogMin').value = ''; $('catalogMax').value = '';
    document.querySelectorAll('[data-price-filter]').forEach(b => b.classList.toggle('active', b.dataset.priceFilter === 'all'));
    window.renderProductCatalog(); location.hash = 'catalogo';
  });
  setForm(saved); render();
})();
