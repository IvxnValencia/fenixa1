// Presentation only: scoped highlighting never changes data, prices or build selection.
(() => {
  'use strict';
  const states=new WeakMap();
  const control=node=>node?.closest?.('[data-radar-highlight]');
  const scope=button=>button?.closest('.component-dialog,.laptop-comparison')||button?.closest('[data-radar-section]');
  function state(owner) {
    if(!states.has(owner))states.set(owner,{hover:null,focus:null,pinned:null});
    return states.get(owner);
  }
  function index(button) {
    const value=button?.dataset.radarHighlight;
    return /^[0-3]$/.test(value||'')?value:null;
  }
  function render(owner) {
    const s=state(owner), active=s.hover??s.focus??s.pinned;
    if(active===null)owner.removeAttribute('data-radar-highlighted');
    else owner.setAttribute('data-radar-highlighted',active);
    owner.querySelectorAll('[data-radar-plot]').forEach(plot=>plot.classList.toggle('is-highlighted',plot.dataset.radarPlot===active));
    owner.querySelectorAll('[data-radar-highlight]').forEach(button=>{
      button.classList.toggle('is-highlighted',button.dataset.radarHighlight===active);
      button.setAttribute('aria-pressed',String(button.dataset.radarHighlight===s.pinned));
    });
  }
  for(const type of ['pointerover','pointerout','focusin','focusout','click'])document.addEventListener(type,event=>{
    const button=control(event.target),owner=scope(button), value=index(button);
    if(!owner||value===null)return;
    const s=state(owner), next=control(event.relatedTarget), nextValue=scope(next)===owner?index(next):null;
    if(type.startsWith('pointer')&&event.pointerType==='touch')return;
    if(type==='pointerover')s.hover=value;
    if(type==='pointerout')s.hover=nextValue;
    if(type==='focusin')s.focus=value;
    if(type==='focusout')s.focus=nextValue;
    if(type==='click'){
      s.pinned=s.pinned===value?null:value;
      if(event.pointerType==='touch')s.focus=null;
    }
    render(owner);
  });
  // Drop stale indexes when a renderer changes the comparison or chosen version.
  const reset=()=>{
    document.querySelectorAll('[data-radar-highlighted]').forEach(owner=>{
      states.delete(owner); render(owner);
    });
  };
  document.addEventListener('change',event=>{
    if(event.target.matches?.('#compareOther,[data-laptop-version]'))reset();
  });
  document.addEventListener('click',event=>{
    if(event.target.closest?.('[data-close-comparison],[data-laptop-view],#laptopCompareClose,[data-laptop-remove],[data-laptop-queue-remove],[data-laptop-compare],[data-compare],#openRealComparison,#clearCompare,#laptopCompareToggle,#laptopCompareClear,.compare-restore'))reset();
  });
  document.addEventListener('close',event=>{if(event.target.matches?.('.component-dialog'))reset();},true);
  window.addEventListener('hashchange',reset);
})();
