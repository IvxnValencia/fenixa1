(() => {
  'use strict';
  const root = document.getElementById('startBuild');
  const use = root.querySelector('.start-uses').closest('fieldset');
  const profile = root.querySelector('.planner-level-field');
  const budget = root.querySelector('.planner-budget-field');
  const paths = root.querySelector('.planner-paths');
  use.id = 'plannerUse'; profile.id = 'plannerProfile'; budget.id = 'plannerBudget';
  const text = selector => (root.querySelector(selector)?.textContent || '').replace(/\s+/g, ' ').trim();
  const steps = [
    { el: use, label: 'Uso', value: () => (root.querySelector('[name="startUse"]:checked')?.closest('label')?.querySelector('strong')?.textContent || '').trim() },
    { el: profile, label: 'Perfil', value: () => text('#startLevels [aria-pressed="true"] .planner-level-title') },
    { el: budget, label: 'Presupuesto', value: () => text('#startBudgetOutput') }
  ];
  const hint = document.createElement('p');
  hint.className = 'builder-step-help';
  hint.textContent = 'Empieza por el uso principal de tu PC. Avanzas un paso a la vez y puedes volver a cambiar lo que elegiste.';
  use.querySelector('.start-uses').before(hint);
  const nav = document.createElement('div');
  nav.className = 'builder-nav';
  nav.innerHTML = '<button type="button" class="primary-button" data-builder-next>Siguiente</button>';
  use.append(nav);
  steps.forEach((step, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'builder-summary'; button.dataset.builderOpen = String(index);
    step.el.before(button);
    step.summary = button;
  });
  let active = 0, reached = 0;
  function render() {
    steps.forEach((step, index) => {
      step.el.hidden = index !== active;
      step.el.classList.toggle('is-current', index === active);
      const show = index !== active && index <= reached;
      step.summary.hidden = !show;
      if (show) step.summary.innerHTML = '<span>' + step.label + ':</span> <strong></strong> <em>Cambiar</em>';
      if (show) step.summary.querySelector('strong').textContent = steps[index].value();
      step.summary.setAttribute('aria-label', 'Cambiar ' + step.label.toLowerCase() + ': ' + step.value());
    });
    if (paths) paths.hidden = active !== 2;
  }
  function go(index, focus = true) {
    active = Math.max(0, Math.min(steps.length - 1, index));
    reached = Math.max(reached, active);
    render();
    if (!focus) return;
    const heading = steps[active].el.querySelector('legend');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: false }); }
  }
  root.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('[data-builder-next]')) { go(active + 1); return; }
    if (target.closest('[data-builder-back]')) { go(active - 1); return; }
    const open = target.closest('[data-builder-open]');
    if (open) go(Number(open.dataset.builderOpen));
  });
  render();
})();
