// Manufacturer-declared maximum noise, not measurements of a complete PC.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const rows=[
    ['noctua-nf-a12x25-pwm',22.6,'nf-a12x25-pwm'],
    ['noctua-nf-a12x15-pwm',23.9,'nf-a12x15-pwm'],
    ['noctua-nf-a14-pwm',24.6,'nf-a14-pwm'],
    ['noctua-nf-f12-pwm',22.4,'nf-f12-pwm'],
    ['noctua-nf-s12a-pwm',17.8,'nf-s12a-pwm'],
    ['noctua-nf-a12x25-g2-pwm',22.5,'nf-a12x25-g2-pwm'],
    ['noctua-nf-a14x25-g2-pwm',24.8,'nf-a14x25-g2-pwm'],
    ['noctua-nf-f12-industrialppc-3000-pwm',43.5,'nf-f12-industrialppc-3000-pwm'],
    ['noctua-nf-a14-industrialppc-3000-pwm',41.3,'nf-a14-industrialppc-3000-pwm'],
    ['noctua-nf-p12-redux-1700-pwm',25.1,'nf-p12-redux-1700-pwm'],
    ['noctua-nf-p14s-redux-1500-pwm',25.8,'nf-p14s-redux-1500-pwm'],
    ['noctua-nf-s12b-redux-1200-pwm',18.1,'nf-s12b-redux-1200-pwm'],
    ['bl093',18.9,'3700'],['bl094',31.2,'3701'],
    ['bl096',13.6,'3703'],['bl097',29.3,'3704']
  ];
  for(const [slug,noise,ref]of rows){
    const noctua=slug.startsWith('noctua-'),id='model-fan-'+slug;
    const source=noctua?'https://www.noctua.at/en/products/'+ref+'/specifications':'https://www.bequiet.com/en/casefans/'+ref;
    const old=review[id]||{},scope=noctua
      ?'Ruido acústico máximo declarado por Noctua para este modelo PWM de 12 V, sin adaptador LNA. No se usa el valor reducido con LNA, fan stop ni una versión ULN/FLX/industrial de distinta velocidad o tensión.'
      :'Ruido declarado por be quiet! a 100 % PWM y 12 V para esta referencia BL exacta; corresponde a máxima velocidad, no a carga parcial ni a otro tamaño o versión high-speed.';
    review[id]={...old,values:{...old.values,noise},fieldSources:{...old.fieldSources,noise:{source,checkedAt:'2026-10-22',scope}},
      additionalSources:[...(old.additionalSources||[]),{source,label:'Fabricante — ruido máximo y condiciones'}],
      scope:(old.scope?old.scope+' ':'')+scope+' Es una especificación del fabricante, no una medición independiente ni el ruido del sistema montado. Las condiciones de laboratorio pueden diferir entre marcas. Los demás campos conservan su procedencia previa; precio y stock siguen pendientes.'};
  }
})();
