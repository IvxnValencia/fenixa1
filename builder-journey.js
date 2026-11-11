(() => {
  'use strict';
  const root = document.getElementById('startBuild');
  const nav = document.getElementById('builderProgress');
  const use = root.querySelector('.start-uses').closest('fieldset');
  const profile = root.querySelector('.planner-level-field');
  const budget = root.querySelector('.planner-budget-field');
  use.id = 'plannerUse'; profile.id = 'plannerProfile'; budget.id = 'plannerBudget';
  const hint = document.createElement('p');
  hint.className = 'builder-step-help';
  hint.textContent = 'Empieza por el uso principal de tu PC. Los siguientes pasos están más abajo y puedes revisarlos cuando quieras.';
  use.querySelector('.start-uses').before(hint);
  const next = document.createElement('button');
  next.type = 'button'; next.className = 'secondary-button builder-continue';
  next.dataset.builderStep = 'plannerProfile'; next.textContent = 'Ver perfiles';
  use.append(next);
  const sections = [use, profile, budget, document.getElementById('autoBuildResult')];
  const progressSections = sections.slice(0, 3);
  const controls = [...nav.querySelectorAll('[data-builder-step]')];
  let scheduled = false;
  function update() {
    scheduled = false;
    if (root.hidden) return;
    const threshold = Math.min(window.innerHeight * .45, nav.getBoundingClientRect().bottom + 80);
    let current = 0;
    progressSections.forEach((section, index) => { if (section.getBoundingClientRect().top <= threshold) current = index; });
    controls.forEach((button, index) => {
      if (index === current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    sections.forEach((section, index) => section.classList.toggle('is-current', index === current || (index === 3 && current === 2)));
    document.getElementById('plannerWorkspace')?.classList.toggle('is-current', current === 2);
  }
  function schedule() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(update); }
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-builder-step]');
    if (!button || !root.contains(button)) return;
    const section = sections.find(section => section.id === button.dataset.builderStep);
    if (!section) return;
    section.scrollIntoView({ block: 'start', behavior: event.detail === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    const heading = section.querySelector('legend, h2');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  schedule();
})();
