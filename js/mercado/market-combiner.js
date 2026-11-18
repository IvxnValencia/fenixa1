(() => {
  'use strict';
  const market = window.FENIXA_MARKET;
  const round = value => Math.round(value * 100) / 100;
  const sum = values => round(values.reduce((total,value)=>total+(value ?? 0),0));

  function groupFor(store, items) {
    const subtotal = sum(items.map(({offer})=>offer.price));
    const perOrder = store.shippingModel === 'per-order';
    const free = Number.isFinite(store.freeShippingOverCOP) && store.freeShippingOverCOP >= 0 && subtotal >= store.freeShippingOverCOP;
    const quotes = items.map(({offer})=>offer.shippingCOP);
    // Keep the highest observed amount as a provisional value if order quotes disagree.
    const shipping = free ? 0 : perOrder ? Math.max(0,...quotes) : sum(quotes);
    const importFees = sum(items.map(({offer})=>offer.importFeesCOP));
    const incomplete = [];
    if (!free && perOrder && (quotes.includes(null) || quotes.some(amount=>amount!==shipping))) {
      incomplete.push({kind:'shipping',storeId:store.id});
    }
    for (const {product,offer} of items) {
      if (!free && !perOrder && offer.shippingCOP===null) incomplete.push({kind:'shipping',storeId:store.id,productId:product.id});
      if (offer.importFeesCOP===null) incomplete.push({kind:'importFees',storeId:store.id,productId:product.id});
      if (offer.status==='listed') incomplete.push({kind:'stock',storeId:store.id,productId:product.id});
    }
    return {store,items,subtotal,shipping,importFees,total:sum([subtotal,shipping,importFees]),incomplete};
  }

  function groupsBySubset(store, offersByPart) {
    const subsets = Array.from({length:1<<offersByPart.length},()=>[]);
    const items = [];
    function visit(index, mask) {
      if (index === offersByPart.length) {
        if (mask) {
          const group = groupFor(store,items.slice());
          const pending = Number(group.incomplete.length>0);
          const current = subsets[mask][pending];
          if (!current || group.total<current.total) subsets[mask][pending] = group;
        }
        return;
      }
      visit(index+1,mask);
      for (const item of offersByPart[index]) {
        items.push(item);
        visit(index+1,mask | (1<<index));
        items.pop();
      }
    }
    visit(0,0);
    return subsets;
  }

  function best(parts) {
    const incomplete = [];
    const covered = [];
    for (const product of parts) {
      const offers = market.shoppingOffers(product);
      if (offers.length) covered.push({product,offers});
      else incomplete.push({kind:'offer',productId:product.id});
    }
    if (!covered.length) return {groups:[],total:null,savings:null,incomplete};
    const stores = new Map(covered.flatMap(({offers})=>offers.map(o=>[o.storeId,o.storeInfo])));
    const full = (1<<covered.length)-1;
    let plans = Array.from({length:full+1},()=>[]);
    plans[0][0] = {groups:[],total:0,incomplete:[]};
    let singleStore = null;

    // Each store can take any subset of the unassigned parts. Tracking disjoint
    // subsets preserves exact totals when shipping or free delivery changes the winner.
    for (const [id,store] of stores) {
      const offersByPart = covered.map(({product,offers})=>offers.filter(o=>o.storeId===id).map(offer=>({product,offer})));
      const groups = groupsBySubset(store,offersByPart);
      const individual = groups[full][0];
      if (individual && (!singleStore || individual.total<singleStore.total)) {
        singleStore = {store,total:individual.total};
      }
      const next = plans.map(pair=>pair.slice());
      for (let assigned=0; assigned<=full; assigned++) {
        if (!plans[assigned].length) continue;
        const remaining = full ^ assigned;
        for (let subset=remaining; subset; subset=(subset-1)&remaining) {
          for (const group of groups[subset]) {
            if (!group) continue;
            for (const plan of plans[assigned]) {
              if (!plan) continue;
              const pending = Number(plan.incomplete.length+group.incomplete.length>0);
              const total = round(plan.total+group.total);
              const current = next[assigned|subset][pending];
              if (current && (current.total<total || (current.total===total && current.groups.length<=plan.groups.length+1))) continue;
              next[assigned|subset][pending] = {
                groups:[...plan.groups,group],
                total,
                incomplete:[...plan.incomplete,...group.incomplete]
              };
            }
          }
        }
      }
      plans = next;
    }
    const solution = plans[full][0] || plans[full][1];
    const pending = [...incomplete,...solution.incomplete];
    return {...solution,incomplete:pending,singleStore:incomplete.length ? null : singleStore,
      savings:!pending.length && singleStore ? round(singleStore.total-solution.total) : null};
  }

  window.FENIXA_STORE_COMBINER = {best};
})();
