(() => {
  'use strict';
  const budget = window.FENIXA_BUDGET;
  const $ = id => document.getElementById(id);
  const root = $('startBuild');
  const uses = {
    estudio:['Estudio y trabajo','Prioriza una base equilibrada para tus programas y deja margen para memoria y almacenamiento.'],
    gaming:['Gaming','Compara la gráfica y el procesador según tus juegos. Las especificaciones solas no garantizan FPS.'],
    creativo:['Diseño y creación','Piensa en tus programas y proyectos: memoria, almacenamiento y aceleración gráfica pueden cambiar la elección.']
  };
  let use = 'estudio';
  try { const old = JSON.parse(localStorage.getItem('fenixa-builder') || '{}'); if (Object.hasOwn(uses, old.use)) use = old.use; } catch {}
  let selectedBudget = budget.get() || 2500000;
  let contextSaved = true;
  function render() {
    const focusedBudget = document.activeElement?.name === 'startBudget' ? document.activeElement.value : null;
    root.querySelectorAll('[name="startUse"]').forEach(r => { r.checked = r.value === use; });
    const values = budget.amounts.includes(selectedBudget) ? budget.amounts : [selectedBudget, ...budget.amounts];
    $('startBudgets').innerHTML = values.map(n => `<label><input type="radio" name="startBudget" value="${n}" ${n === selectedBudget ? 'checked' : ''}><span>${budget.money(n)}${!budget.amounts.includes(n)?'<small>Objetivo anterior</small>':''}</span></label>`).join('');
    $('startUseLabel').textContent = uses[use][0];
    $('startAmount').textContent = budget.money(selectedBudget);
    $('startAdvice').textContent = uses[use][1];
    const count = window.FENIXA_MY_BUILD.ids().length;
    $('startResume').textContent = count ? `Continuar Mi build · ${count} piezas →` : 'Ver Mi build →';
    $('startSaveStatus').textContent = contextSaved && budget.saved() ? 'Al elegir, tu selección se guarda en este navegador.' : 'No se pudo guardar; tu selección solo se conserva en esta pestaña.';
    if (focusedBudget) root.querySelector(`[name="startBudget"][value="${Number(focusedBudget)}"]`)?.focus({preventScroll:true});
  }
  function remember() {
    // Existing profile and guided configuration remain intact.
    try { document.querySelector(`[data-group="use"][data-value="${use}"]`)?.click(); } catch { contextSaved = false; }
    try {
      const old = JSON.parse(localStorage.getItem('fenixa-builder') || '{}');
      localStorage.setItem('fenixa-builder', JSON.stringify({...old, use})); contextSaved = true;
    } catch { contextSaved = false; }
    if (budget.amounts.includes(selectedBudget)) budget.set(selectedBudget);
    render();
  }
  root.addEventListener('change', e => {
    if (e.target.name === 'startUse') use = e.target.value;
    else if (e.target.name === 'startBudget') selectedBudget = Number(e.target.value);
    else return;
    remember();
  });
  $('startParts').addEventListener('click', () => { remember(); location.hash = 'componentes'; });
  $('startProposals').addEventListener('click', () => {
    remember();
    window.dispatchEvent(new CustomEvent('fenixa-find-builds', {detail:{use, max:selectedBudget}}));
    location.hash = 'builds';
  });
  window.addEventListener('fenixa-budget-changed', () => { selectedBudget = budget.get() || 2500000; render(); });
  window.addEventListener('fenixa-build-changed', render);
  window.addEventListener('hashchange', () => { if (!location.hash || location.hash === '#inicio') render(); });
  render();
})();
