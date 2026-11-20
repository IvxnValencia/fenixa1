// Mejorar mi PC: rellenar el perfil desde una captura de pantalla.
//
// Overlay clásico de subida: zona para arrastrar, botón «Examinar» y pegado con
// Ctrl+V (o desde el menú contextual). La imagen se lee en el propio navegador
// con Tesseract.js (OCR); no se envía a ningún servidor. Del texto se extraen el
// procesador, la RAM, la gráfica, el disco y la placa, y el usuario confirma qué
// datos aplica antes de tocar su perfil.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const OCR_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  const LABELS = { device: 'Tipo de equipo', cpu: 'Procesador', board: 'Placa o modelo', ramGb: 'Cantidad de RAM', ramType: 'Generación de RAM', ramModules: 'Módulos de RAM', graphics: 'Tipo de gráficos', gpu: 'Modelo de la gráfica', storageType: 'Disco del sistema', storageGb: 'Capacidad del disco' };
  const SHOW = { ramGb: Object.fromEntries(['4', '8', '16', '32', '64', '128'].map(v => [v, v + ' GB'])), ramModules: { 1: '1 módulo', 2: '2 módulos', 4: '4 módulos' }, device: { desktop: 'PC de escritorio', laptop: 'Laptop' }, graphics: { integrated: 'Integrados', dedicated: 'Tarjeta dedicada' }, storageType: { hdd: 'HDD mecánico', sata: 'SSD SATA', nvme: 'SSD NVMe', ssd: 'SSD' } };

  // ---------- Lectura del texto ----------
  const clean = s => s.replace(/\(R\)|\(TM\)|®|™/gi, '').replace(/\s+/g, ' ').trim();
  function parse(raw) {
    const text = raw.replace(/\r/g, ''), flat = text.replace(/\n/g, ' '), out = {};
    let m = /(AMD\s+Ryzen\s+(?:AI\s+)?\d\s+(?:PRO\s+)?\w{3,6}\w*(?:\s*X3D)?)/i.exec(flat) ||
      /(Intel\s*(?:\(R\))?\s*Core\s*(?:\(TM\))?\s*(?:Ultra\s*\d\s*\d{3}\w*|i[3579][\s-]*\d{4,5}\w*))/i.exec(flat) ||
      /(Core\s*(?:Ultra\s*\d\s*\d{3}\w*|i[3579][\s-]*\d{4,5}\w*))/i.exec(flat) || /(Ryzen\s+\d\s+\d{4}\w*)/i.exec(flat);
    if (m) out.cpu = clean(m[1]).replace(/\s+with\s+.*$/i, '');
    m = /(NVIDIA\s+GeForce\s+(?:RTX|GTX)\s*\d{3,4}\s*(?:Ti|SUPER)?(?:\s*Laptop\s*GPU)?)/i.exec(flat) || /(GeForce\s+(?:RTX|GTX)\s*\d{3,4}\s*(?:Ti|SUPER)?(?:\s*Laptop\s*GPU)?)/i.exec(flat) ||
      /(AMD\s+Radeon\s+RX\s*\d{3,4}\s*(?:XT|GRE)?)/i.exec(flat) || /(Intel\s+Arc\s+[AB]\d{3})/i.exec(flat);
    if (m) { out.gpu = clean(m[1]); out.graphics = 'dedicated'; }
    else if (/(Radeon\s*\(?TM\)?\s*Graphics|Radeon\s+\d{3}M|UHD Graphics|Iris\s*Xe|Intel\s*Graphics)/i.test(flat)) out.graphics = 'integrated';
    // RAM: «Memoria física instalada 16,0 GB», «Memoria 16.0 GB», «16384MB RAM».
    m = /(?:memoria f[ií]sica instalada|installed physical memory|memoria instalada|installed ram|memoria|memory)[^\d\n]{0,25}(\d{1,3})(?:[.,]\d+)?\s*GB/i.exec(text) || /(\d{4,6})\s*MB\s*RAM/i.exec(flat);
    if (m) {
      let n = Number(m[1]); if (n > 1000) n = Math.round(n / 1024);
      const sizes = [4, 8, 16, 32, 64, 128], near = sizes.reduce((a, b) => Math.abs(b - n) < Math.abs(a - n) ? b : a);
      if (Math.abs(near - n) <= 2) out.ramGb = String(near);
    }
    m = /\b(DDR[345])\b/i.exec(flat); if (m) out.ramType = m[1].toUpperCase();
    m = /(?:ranuras usadas|slots used)[:\s]*(\d)\s*(?:de|of)\s*\d/i.exec(flat); if (m && ['1', '2', '4'].includes(m[1])) out.ramModules = m[1];
    // Disco: NVMe / SSD / HDD y su capacidad.
    if (/NVM\s?e/i.test(flat)) out.storageType = 'nvme';
    else if (/\bSSD\b/i.test(flat)) out.storageType = /SATA/i.test(flat) ? 'sata' : 'ssd';
    else if (/\bHDD\b|disco duro|hard disk/i.test(flat)) out.storageType = 'hdd';
    m = /(?:capacidad|capacity|tama[nñ]o|size)[^\d\n]{0,15}(\d+(?:[.,]\d+)?)\s*(TB|GB)/i.exec(text) || /(?:SSD|NVMe|HDD)[^\n]{0,40}?(\d+(?:[.,]\d+)?)\s*(TB|GB)/i.exec(text);
    if (m) {
      let n = parseFloat(m[1].replace(',', '.')) * (/TB/i.test(m[2]) ? 1000 : 1);
      // Windows muestra GiB (un disco de 512 GB aparece como 477 GB): se prueba también la conversión.
      const sizes = [128, 256, 480, 500, 512, 1000, 2000, 4000];
      const best = [n, n * 1.073741824].flatMap(v => sizes.map(size => ({ size, err: Math.abs(size - v) / size }))).sort((a, b) => a.err - b.err)[0];
      if (best.err < 0.06) out.storageGb = best.size >= 1000 ? best.size / 1000 + ' TB' : best.size + ' GB';
    }
    m = /(?:producto de placa base|baseboard product|placa base|motherboard)[:\s]+([^\n]{3,40})/i.exec(text) || /\b((?:ROG|TUF|PRIME|MAG|MPG|PRO|B\d{3}M?|X\d{3}|Z\d{3})[\w\- ]*(?:A520|B450|B550|X570|B650|X670|A620|H610|B660|B760|Z690|Z790|B860|Z890)[\w\- ]*)/i.exec(flat);
    if (m) out.board = clean(m[1]).slice(0, 60);
    // Laptop: gráfica «Laptop GPU», procesador móvil, SO-DIMM o batería.
    if (/Laptop\s*GPU|SODIMM|SO-DIMM|bater[ií]a|battery/i.test(flat) || /Ryzen\s+\d\s+\d{4}(H|HS|HX|U)\b|i[3579]-\d{4,5}(H|HX|U|P)\b|Ultra\s*\d\s*\d{3}(H|U|V)\b/i.test(out.cpu || '')) out.device = 'laptop';
    else if (/\bDIMM\b/i.test(flat) || out.cpu) out.device = 'desktop';
    return out;
  }

  // ---------- OCR ----------
  let ocrLoading = null;
  function loadOcr() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    return ocrLoading ||= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = OCR_URL; script.async = true;
      script.onload = () => resolve(window.Tesseract);
      script.onerror = () => { ocrLoading = null; reject(new Error('No se pudo cargar el lector de imágenes.')); };
      document.head.appendChild(script);
    });
  }

  // ---------- Overlay ----------
  const dialog = document.createElement('dialog');
  dialog.className = 'pc-import-dialog';
  dialog.setAttribute('aria-labelledby', 'pcImportTitle');
  dialog.innerHTML = `
    <header class="pc-import-header"><div><h2 id="pcImportTitle">Leer mis componentes desde una captura</h2><p>Sirve una captura del Administrador de tareas (pestaña Rendimiento), de «Información del sistema», de DxDiag o de CPU-Z.</p></div>
      <button type="button" class="pc-import-close" data-import-close aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header>
    <div class="pc-import-drop" id="pcImportDrop" tabindex="0" role="button" aria-describedby="pcImportDropHelp">
      <svg class="pc-import-cloud" viewBox="0 0 120 80" aria-hidden="true"><defs><linearGradient id="pcImportGrad" x1="0" x2="1"><stop offset="0" stop-color="var(--purple)"/><stop offset="1" stop-color="color-mix(in srgb, var(--purple) 35%, #9fd3ff)"/></linearGradient></defs><path d="M30 70a20 20 0 0 1-2-40 26 26 0 0 1 50-6 18 18 0 0 1 14 34 12 12 0 0 1-4 12z" fill="url(#pcImportGrad)" stroke="currentColor" stroke-width="1"/><path d="M60 58V34m-9 9 9-9 9 9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <button type="button" class="primary-button" data-import-browse>Examinar</button>
      <p id="pcImportDropHelp">o arrastra la imagen aquí, o pégala con <kbd>Ctrl</kbd> + <kbd>V</kbd></p>
      <input type="file" id="pcImportFile" accept="image/*" hidden>
    </div>
    <div class="pc-import-work" id="pcImportWork" hidden>
      <img id="pcImportPreview" alt="Captura cargada">
      <div class="pc-import-status"><p id="pcImportStatus" role="status" aria-live="polite"></p><div class="pc-import-bar"><span id="pcImportBar"></span></div></div>
    </div>
    <form class="pc-import-result" id="pcImportResult" hidden>
      <h3>Esto es lo que encontramos</h3><p class="profile-hint">Desmarca lo que no sea correcto. Puedes corregir cualquier dato después.</p>
      <ul id="pcImportFields"></ul>
      <div class="pc-import-actions"><button type="button" class="secondary-button" data-import-again>Probar otra imagen</button><button type="submit" class="primary-button">Aplicar a mi perfil</button></div>
    </form>
    <p class="pc-import-privacy">La imagen se lee en tu navegador y no se sube a ningún servidor. Evita capturas con datos personales o números de serie.</p>`;
  document.body.appendChild(dialog);
  const drop = dialog.querySelector('#pcImportDrop'), file = dialog.querySelector('#pcImportFile');
  let found = {}, previewUrl = '', opener = null;

  function reset() {
    found = {};
    drop.hidden = false; $('pcImportWork').hidden = true; $('pcImportResult').hidden = true;
    if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = '';
  }
  function open(trigger) {
    opener = trigger || document.activeElement;
    reset();
    dialog.showModal();
    drop.focus();
  }
  function status(text, progress) {
    $('pcImportStatus').textContent = text;
    if (progress !== undefined) $('pcImportBar').style.width = Math.round(progress * 100) + '%';
  }
  async function read(blob) {
    if (!blob || !/^image\//.test(blob.type)) { status('Ese archivo no es una imagen. Usa PNG, JPG o una captura pegada.'); $('pcImportWork').hidden = false; drop.hidden = false; return; }
    drop.hidden = true; $('pcImportWork').hidden = false; $('pcImportResult').hidden = true;
    previewUrl = URL.createObjectURL(blob); $('pcImportPreview').src = previewUrl;
    status('Preparando el lector…', 0.05);
    try {
      const T = await loadOcr();
      const worker = await T.createWorker('spa+eng', 1, { logger: m => { if (m.status === 'recognizing text') status('Leyendo la captura…', 0.2 + m.progress * 0.8); else if (/loading/.test(m.status)) status('Cargando el idioma del lector…', 0.1 + (m.progress || 0) * 0.1); } });
      const { data } = await worker.recognize(blob);
      await worker.terminate();
      found = parse(data.text || '');
      show();
    } catch (error) {
      status((error?.message || 'No se pudo leer la imagen.') + ' Revisa tu conexión o completa los datos a mano.', 0);
      drop.hidden = false;
    }
  }
  function show() {
    const keys = Object.keys(LABELS).filter(k => found[k]);
    $('pcImportWork').hidden = !keys.length;
    if (!keys.length) { status('No reconocimos componentes en esta imagen. Prueba con la pestaña «Rendimiento» del Administrador de tareas o con «Información del sistema».', 0); drop.hidden = false; $('pcImportWork').hidden = false; return; }
    status('Lectura terminada.', 1);
    $('pcImportFields').innerHTML = keys.map(k => `<li><label><input type="checkbox" name="${k}" checked><span>${esc(LABELS[k])}</span><strong>${esc(SHOW[k]?.[found[k]] || found[k])}</strong></label></li>`).join('');
    $('pcImportResult').hidden = false;
    $('pcImportResult').querySelector('[type="submit"]').focus();
  }
  // Aplica los datos marcados al formulario del perfil (el usuario guarda con «Ver mis mejoras»).
  function apply(event) {
    event.preventDefault();
    const form = $('profileForm'), chosen = [...$('pcImportFields').querySelectorAll('input:checked')].map(i => i.name);
    for (const key of chosen) {
      if (key === 'device') { const d = $('profile-device'); if (d) d.value = found.device; continue; }
      const control = form.elements[key];
      if (!control) continue;
      control.value = found[key];
      control.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if ($('profileHardware')) $('profileHardware').open = true;
    dialog.close();
    if (typeof window.showToast === 'function') window.showToast(`${chosen.length} ${chosen.length === 1 ? 'dato aplicado' : 'datos aplicados'}. Revisa y pulsa «Ver mis mejoras».`);
  }

  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-import-close]') || event.target === dialog) { dialog.close(); return; }
    if (event.target.closest('[data-import-browse]')) { file.click(); return; }
    if (event.target.closest('[data-import-again]')) { reset(); drop.focus(); return; }
    if (event.target === drop || event.target.closest('#pcImportDrop p, .pc-import-cloud')) file.click();
  });
  drop.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && event.target === drop) { event.preventDefault(); file.click(); } });
  file.addEventListener('change', () => { if (file.files[0]) read(file.files[0]); file.value = ''; });
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', e => read([...(e.dataTransfer?.files || [])].find(f => /^image\//.test(f.type))));
  // Pegar: con el overlay abierto, Ctrl+V lee la imagen del portapapeles.
  document.addEventListener('paste', event => {
    if (!dialog.open) return;
    const item = [...(event.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
    if (!item) { status('El portapapeles no tiene una imagen. Haz la captura con Win + Shift + S y vuelve a pegar.'); $('pcImportWork').hidden = false; return; }
    event.preventDefault();
    read(item.getAsFile());
  });
  $('pcImportResult').addEventListener('submit', apply);
  dialog.addEventListener('close', () => { if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = ''; if (opener?.isConnected) opener.focus({ preventScroll: true }); });
  document.addEventListener('click', event => { const t = event.target.closest('#profileImportOpen'); if (t) open(t); });

  window.FENIXA_PC_IMPORT = { open, parse };
})();
