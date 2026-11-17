(() => {
  'use strict';
  const offers=new Map((window.FENIXA_LAPTOP_OFFERS||[]).map(o=>[o.id,o]));
  const safeUrl=url=>{try{return new URL(url).protocol==='https:';}catch{return false;}};
  const quantity=(value,unit)=>{const match=String(value||'').match(/(\d+(?:[.,]\d+)?)\s*(GB|TB)/i);return match?Number(match[1].replace(',','.'))*(match[2].toUpperCase()==='TB'?1000:1):null;};
  for(const p of window.FENIXA_LAPTOPS){
    const o=offers.get(p.id);if(!o||!Number.isFinite(o.price)||o.price<=0||!safeUrl(o.url))continue;
    p.originalReference={name:p.name,model:p.model,source:p.source,region:p.region,checkedAt:p.checkedAt,specs:p.specs};
    p.retailOffer=o;p.name=o.name||o.family;p.model=o.model||[o.family,o.processor,o.ram,o.storage].filter(Boolean).join(' · ');p.source=o.url;p.region=o.region;p.checkedAt=o.checkedAt.slice(0,10);p.retired=false;
    p.referenceKind='Configuración de tienda · referencia académica';
    p.specs=[['Procesador',o.processor],['Gráficos',o.gpu],['Memoria RAM',o.ram],['Almacenamiento',o.storage],['Pantalla',o.screen]].filter(([,value])=>value);
    if(!p.specs.length)p.specs=[['Referencia de tienda',p.model]];
    p.reason='Configuración publicada por '+o.store+'.';
    p.limits=[o.scope||'Consulta la configuración de la oferta antes de comprar.','Disponibilidad: '+o.availability+'.','Fotografía ilustrativa de la familia; confirma acabado, teclado y sufijo en la tienda.'];
    const values={};for(const [key,value]of [['ram',quantity(o.ram)],['storage',quantity(o.storage)]])if(value)values[key]=[value];
    p.retailFacts={source:o.url,checkedAt:p.checkedAt,scope:'Datos declarados de '+p.model+' en '+o.store+'. '+(o.scope||''),values};
  }
  const money=p=>{const o=p.retailOffer;return o?new Intl.NumberFormat('es-CO',{style:'currency',currency:o.currency,currencyDisplay:'code',maximumFractionDigits:o.currency==='COP'||o.currency==='IDR'?0:2}).format(o.price):'Sin precio';};
  const status=p=>{
    const o=p.retailOffer;if(!o)return 'Sin oferta verificada';
    const text=String(o.availability||'').toLowerCase();
    const state=/agotado|out_of_stock|sold.out/.test(text)?'Agotado':/special_order|backorder/.test(text)?'Por encargo':/refurb|usado|reacondicionado/.test(text+' '+o.scope)?'Reacondicionado':/in_stock|disponible|en stock/.test(text)?'Publicado':'Stock por confirmar';
    const tax=/sin iva|antes.*iva|excl.*vat/i.test(o.scope||'')?' · sin impuestos':o.currency!=='COP'?' · exterior':'';
    return state+tax+' · '+o.checkedAt.slice(8,10)+'/'+o.checkedAt.slice(5,7);
  };
  window.FENIXA_LAPTOP_PRICES={money,status,offer:p=>p.retailOffer||null};
})();
