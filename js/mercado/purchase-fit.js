(() => {
  'use strict';
  const text=p=>`${p?.name||''} ${p?.summary||''}`.toUpperCase();
  const ram=s=>s.match(/\bDDR[345]\b/)?.[0]||'';
  const socket=s=>s.match(/\bAM[45]\b|\bLGA\s?\d{4}\b/)?.[0].replace(/\s/g,'')||'';
  const ambiguous=p=>window.FENIXA_SPECS?.facts(p).identityConflict===true;
  const memoryOf=p=>ambiguous(p)?'':p?.platform?.memory||window.FENIXA_SPECS?.facts(p).values.memory||ram(text(p));
  const socketOf=p=>ambiguous(p)?'':p?.platform?.socket||window.FENIXA_SPECS?.facts(p).values.socket||socket(text(p));
  const memoryKinds=value=>String(value||'').toUpperCase().match(/\bDDR[345]\b/g)||[];
  function context(parts) {
    if(parts) return {label:'Esta build',device:'desktop',ramType:memoryOf(parts.find(p=>p.category==='ram')),cpuRam:memoryOf(parts.find(p=>p.category==='cpu')),boardRam:memoryOf(parts.find(p=>p.category==='board')),boardSocket:socketOf(parts.find(p=>p.category==='board')),cpuSocket:socketOf(parts.find(p=>p.category==='cpu'))};
    try {
      const p=JSON.parse(localStorage.getItem('fenixa-pc-v2')||'null');
      if(p&&typeof p==='object')return {label:'Mi PC guardada',device:p.device==='desktop'?'desktop':p.device==='laptop'?'laptop':'',ramType:['DDR3','DDR4','DDR5'].includes(p.ramType)?p.ramType:'',boardSocket:socket(String(p.board||'').toUpperCase()),cpuSocket:socket(String(p.cpu||'').toUpperCase())};
    } catch { /* Missing or invalid profiles are unknown, not compatible. */ }
    return null;
  }
  function check(p,parts) {
    const c=context(parts);
    const pending=reason=>({status:'pending',label:'Falta comprobar',reason,context:c?.label||'Sin equipo de referencia'});
    if(ambiguous(p))return pending(window.FENIXA_SPECS.facts(p).warning);
    const uncertainPart=parts?.find(ambiguous);
    const identityWarning=uncertainPart?` Referencia de ${uncertainPart.name} pendiente: ${window.FENIXA_SPECS.facts(uncertainPart).warning}`:'';
    if(!c)return pending('Registra tu PC para contrastar la memoria y los datos de plataforma antes de comprar.');
    if(c.device==='laptop')return pending('En un portátil debes confirmar el modelo, las piezas soldadas y las ampliaciones permitidas en su manual.');
    if(c.device!=='desktop')return pending('Indica si tu equipo es de escritorio o portátil.');
    const candidate=text(p),checks=[];
    if(parts&&['board','case'].includes(p.category)) {
      const board=p.category==='board'?p:parts.find(part=>part.category==='board');
      const enclosure=p.category==='case'?p:parts.find(part=>part.category==='case');
      const boardFacts=window.FENIXA_SPECS?.facts(board).values||{};
      const box=window.FENIXA_SPECS?.facts(enclosure).values||{};
      const form=boardFacts.boardForm,knownForms=['mini-itx','micro-atx','atx','e-atx'];
      // Explicit, complete manufacturer lists only. Never match ATX inside Micro-ATX.
      if(knownForms.includes(form)&&Array.isArray(box.boardForms)&&box.boardForms.length&&box.boardForms.every(f=>knownForms.includes(f))&&box.boardFormsComplete===true) {
        if(!box.boardForms.includes(form))return {status:'conflict',label:'Conflicto de formato',reason:`${board.name} usa ${boardFacts.format||form}, un formato que ${enclosure.name} no admite según su ficha. Elige otra placa o gabinete.`,context:c.label};
        // E-ATX support is dimension-dependent: the label alone cannot confirm fit.
        if(form!=='e-atx')checks.push(`Formato ${boardFacts.format||form} de ${board.name} admitido por ${enclosure.name} (solo formato de placa)`);
      }
    }
    if(parts&&['gpu','case','cooler'].includes(p.category)) {
      const facts=part=>window.FENIXA_SPECS?.facts(part).values||{};
      const enclosure=p.category==='case'?p:parts.find(part=>part.category==='case');
      const box=facts(enclosure);
      const gpu=facts(p.category==='gpu'?p:parts.find(part=>part.category==='gpu'));
      const cooler=facts(p.category==='cooler'?p:parts.find(part=>part.category==='cooler'));
      const measures=[];
      if(p.category!=='cooler'){
        // A layout-dependent case limit is not an unconditional incompatibility.
        // Use the documented upper bound only to reject impossible lengths.
        if(box.gpuMaxConditional&&Number.isFinite(gpu.length)&&Number.isFinite(box.gpuMaxUpper)){
          if(gpu.length>box.gpuMaxUpper)measures.push([gpu.length,box.gpuMaxUpper,'Longitud de GPU']);
          else checks.push(`Longitud de GPU ${gpu.length} mm: límite condicionado al montaje de ventiladores (${box.gpuMax}–${box.gpuMaxUpper} mm); disposición exacta pendiente`);
        }else if(box.gpuMaxConditional&&Number.isFinite(gpu.length)){
          checks.push(`Longitud de GPU ${gpu.length} mm: el espacio publicado depende de la disposición; confirmar ventiladores, radiadores y bandejas en el manual`);
        }else measures.push([gpu.length,box.gpuMax,'Longitud de GPU']);
      }
      if(p.category!=='gpu'&&cooler.coolerType==='air'){
        if(box.coolerMaxConditional&&Number.isFinite(cooler.height)&&Number.isFinite(box.coolerMaxUpper)){
          if(cooler.height>box.coolerMaxUpper)measures.push([cooler.height,box.coolerMaxUpper,'Altura del disipador']);
          else checks.push(`Altura del disipador ${cooler.height} mm: límite ${box.coolerMax}–${box.coolerMaxUpper} mm condicionado a la disposición; grosor de GPU y posición exacta pendientes`);
        }else if(box.coolerMaxConditional&&Number.isFinite(cooler.height)){
          checks.push(`Altura del disipador ${cooler.height} mm: el espacio publicado depende de la disposición; confirmar posición y holguras en el manual`);
        }else measures.push([cooler.height,box.coolerMax,'Altura del disipador']);
      }
      for(const [size,limit,label] of measures) {
        if(!Number.isFinite(size)||!Number.isFinite(limit)||size<=0||limit<=0)continue;
        if(size>limit)return {status:'conflict',label:'Conflicto de espacio',reason:`${label}: ${size} mm; ${enclosure.name} publica un máximo de ${limit} mm. Supera el límite en ${size-limit} mm.`,context:c.label};
        checks.push(`${label}: ${size} mm frente al máximo publicado de ${limit} mm (solo esta medida)`);
      }
      if(checks.length)return {...pending(`${checks.join(' · ')}. ${box.clearanceNotes||''} Revisión parcial: faltan dimensiones especiales de placa, ancho y grosor de GPU, cables, posición de ventiladores, anclajes y alimentación. No garantiza el montaje completo.`),label:'Coincidencia parcial',matched:true};
    }
    // Check every relevant counterpart, never just the first populated field.
    // A replacement is compared with other categories, not the old RAM module.
    if(['cpu','board','ram'].includes(p.category)) {
      const kind=memoryOf(p),kinds=memoryKinds(kind);
      const targets=p.category==='cpu'?[[c.boardRam,'la placa'],[c.ramType,'la RAM']]
        :p.category==='board'?[[c.cpuRam,'el procesador'],[c.ramType,'la RAM']]
        :[[c.boardRam,'la placa'],[c.cpuRam,'el procesador'],[parts?'':c.ramType,'Mi PC guardada']];
      for(const [target,label] of targets) {
        const accepted=memoryKinds(target);
        if(!kinds.length||!accepted.length)continue;
        if(!kinds.some(k=>accepted.includes(k)))return {status:'conflict',label:'Conflicto de memoria',reason:`La pieza indica ${kind}, pero ${label} indica ${target}. Las generaciones no coinciden.`,context:c.label};
        checks.push(`Generación de memoria coincidente con ${label}`);
      }
    }
    if(parts&&['ram','board'].includes(p.category)) {
      const board=p.category==='board'?p:parts.find(part=>part.category==='board');
      const kit=p.category==='ram'?p:parts.find(part=>part.category==='ram');
      const b=window.FENIXA_SPECS?.facts(board).values||{},r=window.FENIXA_SPECS?.facts(kit).values||{};
      for(const [size,limit,label,unit,integer] of [[r.capacity,b.maxRam,'Capacidad del kit','GB',false],[r.modules,b.slots,'Módulos del kit','módulos / ranuras',true]]) {
        if(!Number.isFinite(size)||!Number.isFinite(limit)||size<=0||limit<=0||(integer&&(!Number.isInteger(size)||!Number.isInteger(limit))))continue;
        if(size>limit)return {status:'conflict',label:'Conflicto de RAM',reason:`${label}: ${size}; ${board.name} admite hasta ${limit} ${unit}. Elige otro kit o placa.`,context:c.label};
        checks.push(`${label}: ${size} frente al límite de ${limit} ${unit} de la placa (solo este límite)`);
      }
    }
    if(p.category==='ram') {
      if(/PORT[AÁ]TIL|SO-?DIMM/.test(candidate))return pending('Esta memoria se anuncia para portátil; confirma el formato de ranura de tu equipo.');
    }
    if(p.category==='cpu'||p.category==='board'){
      const candidateSocket=socketOf(p),target=p.category==='cpu'?c.boardSocket:c.cpuSocket;
      if(candidateSocket&&target){if(candidateSocket!==target)return {status:'conflict',label:'Conflicto de socket',reason:`La pieza indica ${candidateSocket}, pero el equipo de referencia indica ${target}.`,context:c.label};checks.push(`Socket ${target} coincidente`);}
    }
    return {...pending((checks.length?`${checks.join(' · ')}. Aún falta revisar BIOS, límites del procesador, frecuencia, formato y lista de soporte del modelo exacto.`:'Faltan especificaciones para comprobar encaje, conectores, potencia o soporte del modelo exacto. No asumimos compatibilidad por pertenecer a una categoría.')+identityWarning),label:checks.length?'Coincidencia parcial':'Falta comprobar', matched:checks.length>0};
  }
  window.FENIXA_FIT={check,context};
})();
