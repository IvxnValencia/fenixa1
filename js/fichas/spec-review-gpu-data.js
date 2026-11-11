// Supplement missing manufacturer fields; no current offers or measured performance.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const dp21='3 × DisplayPort 2.1b + 1 × HDMI 2.1b';
  const dp14='3 × DisplayPort 1.4a + 1 × HDMI 2.1';
  const dp14a='3 × DisplayPort 1.4a + 1 × HDMI 2.1a';
  const rows=[
    ['GeForce-RTX-3060-VENTUS-2X-12G-OC','GeForce RTX 3060','GDDR6','PCIe 4.0','170 W','1 × 8 pines','3 × DisplayPort 1.4 + 1 × HDMI 2.1'],
    ['GeForce-RTX-3070-VENTUS-2X-OC','GeForce RTX 3070','GDDR6','PCIe 4.0','220 W','2 × 8 pines',dp14],
    ['GeForce-RTX-3070-Ti-VENTUS-3X-8G-OC','GeForce RTX 3070 Ti','GDDR6X','PCIe 4.0','290 W','2 × 8 pines',dp14],
    ['GeForce-RTX-3080-VENTUS-3X-10G-OC','GeForce RTX 3080','GDDR6X','PCIe 4.0','320 W','2 × 8 pines',dp14],
    ['GeForce-RTX-3080-Ti-VENTUS-3X-12G-OC','GeForce RTX 3080 Ti','GDDR6X','PCIe 4.0','350 W','2 × 8 pines',dp14],
    ['GeForce-RTX-3090-VENTUS-3X-24G-OC','GeForce RTX 3090','GDDR6X','PCIe 4.0','350 W','2 × 8 pines',dp14],
    ['GeForce-RTX-4060-VENTUS-2X-BLACK-8G-OC','GeForce RTX 4060','GDDR6','PCIe 4.0 ×8','115 W o 120 W según ficha MSI; confirmar revisión','1 × 8 pines',dp14a],
    ['GeForce-RTX-4060-Ti-GAMING-X-16G','GeForce RTX 4060 Ti','GDDR6','PCIe 4.0 ×16 físico · usa ×8','165 W','1 × 8 pines',dp14a],
    ['GeForce-RTX-4070-GAMING-X-TRIO-12G','GeForce RTX 4070','GDDR6X','PCIe 4.0','215 W','1 × 16 pines',dp14a],
    ['GeForce-RTX-4070-Ti-GAMING-X-TRIO-12G','GeForce RTX 4070 Ti','GDDR6X','PCIe 4.0','285 W','1 × 16 pines',dp14a],
    ['GeForce-RTX-4080-16GB-GAMING-X-TRIO','GeForce RTX 4080','GDDR6X','PCIe 4.0','320 W','1 × 16 pines',dp14a],
    ['GeForce-RTX-5080-16G-GAMING-TRIO-OC','GeForce RTX 5080','GDDR7','PCIe 5.0','360 W','1 × 16 pines · MSI recomienda fuente ATX 3.1',dp21],
    ['GeForce-RTX-5070-12G-GAMING-TRIO-OC','GeForce RTX 5070','GDDR7','PCIe 5.0','250 W','1 × 16 pines · MSI recomienda fuente ATX 3.1',dp21],
    ['GeForce-RTX-5090-32G-SUPRIM-SOC','GeForce RTX 5090','GDDR7','PCIe 5.0 ×16','Gaming: 600 W · Silent: 575 W','1 × 16 pines · MSI recomienda fuente ATX 3.1',dp21],
    ['GeForce-RTX-5070-Ti-16G-GAMING-TRIO-OC','GeForce RTX 5070 Ti','GDDR7','PCIe 5.0','300 W','1 × 16 pines · MSI recomienda fuente ATX 3.1',dp21],
    ['GeForce-RTX-4080-SUPER-16G-GAMING-X-SLIM','GeForce RTX 4080 SUPER','GDDR6X','PCIe 4.0','320 W','1 × 16 pines','2 × DisplayPort 1.4a + 2 × HDMI 2.1a'],
    ['GeForce-RTX-4070-SUPER-12G-GAMING-X-SLIM','GeForce RTX 4070 SUPER','GDDR6X','PCIe 4.0','245 W','1 × 16 pines',dp14a],
    ['GeForce-RTX-4060-Ti-VENTUS-2X-BLACK-16G-OC','GeForce RTX 4060 Ti','GDDR6','PCIe 4.0 ×16 físico · usa ×8','165 W','1 × 8 pines',dp14a],
    ['GeForce-RTX-3060-Ti-GAMING-X-8G-LHR','GeForce RTX 3060 Ti','GDDR6','PCIe 4.0','220 W','1 × 8 pines + 1 × 6 pines',dp14],
    ['GeForce-RTX-2060-VENTUS-6G-OC','GeForce RTX 2060','GDDR6','PCIe 3.0 ×16','160 W','1 × 8 pines','3 × DisplayPort 1.4a + 1 × HDMI 2.0b']
  ];
  for(const [model,chip,memory,pcie,power,connectors,outputs]of rows){
    const id='model-gpu-'+model.toLowerCase(),source=`https://www.msi.com/Graphics-Card/${model}/Specification`;
    const values={chip,memory,pcie,power,connectors,outputs},old=review[id]||{};
    review[id]={...old,values:{...old.values,...values},fieldSources:{...old.fieldSources,...Object.fromEntries(Object.keys(values).map(key=>[key,{source,checkedAt:'2026-10-22'}]))},scope:(old.scope?old.scope+' ':'')+'Se amplían chip, tipo de VRAM, interfaz, potencia, alimentación y salidas desde la ficha exacta de MSI consultada el 22/10/2026. La potencia declarada de tarjeta no es la recomendación de fuente ni consumo medido. Se conservan alternativas y modos publicados, sin sumarlos ni elegir una revisión. MHz, VRAM y conectores no equivalen a FPS. Los demás datos conservan su procedencia anterior; precio y stock pendientes.'};
  }
})();
