(() => {
  const hero = document.querySelector('#welcome .fenixa-hero');
  const scene = hero.querySelector('.hero-showcase');
  const button = scene.querySelector('.hero-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layers = [...scene.querySelectorAll('canvas')].map(canvas => canvas.getContext('2d'));
  if (layers.some(ctx => !ctx) || !('IntersectionObserver' in window)) return;

  const tau = Math.PI * 2;
  const clamp = t => Math.min(1, Math.max(0, t));
  const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  // Curves in figure coordinates. The first plume goes behind the tower.
  const routes = [
    [[.025,.87],[.13,.93],[.53,.87],[.83,.74],[.95,.54],[.93,.29],[.78,.16],[.54,.15],[.31,.18],[.16,.11],[.13,.01]],
    [[.29,.87],[.48,.83],[.64,.77],[.77,.68],[.87,.59],[.94,.47],[.98,.38]]
  ];
  function curve(route, u) {
    const t = clamp(u) * (route.length - 1);
    const i = Math.min(Math.floor(t), route.length - 2), f = t - i;
    const a = route[Math.max(i - 1, 0)], b = route[i], c = route[i + 1], d = route[Math.min(i + 2, route.length - 1)];
    return b.map((v,k) => v + .5*f*((c[k]-a[k])+f*((2*a[k]-5*v+4*c[k]-d[k])+f*(3*v-3*c[k]+d[k]-a[k]))));
  }
  const paths = routes.map(route => Array.from({length: 135}, (_, i) => {
    const u = i/134, [x,y] = curve(route,u), a = curve(route,u-.002), b = curve(route,u+.002);
    const angle = Math.atan2(b[1]-a[1], b[0]-a[0]);
    return {u,x,y,nx:-Math.sin(angle),ny:Math.cos(angle)};
  }));

  // Cache the light falloff once. Drawing uses only small transformed bitmaps.
  function brush(rgb) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 96;
    const ctx = tile.getContext('2d');
    const falloff = ctx.createRadialGradient(48,48,0,48,48,48);
    for (const [radius,alpha] of [[0,1],[.18,.89],[.42,.52],[.69,.13],[1,0]]) {
      falloff.addColorStop(radius,'rgba('+rgb+','+alpha+')');
    }
    ctx.fillStyle = falloff;
    ctx.fillRect(0,0,96,96);
    return tile;
  }
  const midnight = {haze:brush('94,44,201'),color:brush('151,82,252'),core:brush('241,213,255')};
  const daylight = {haze:brush('175,124,220'),color:brush('135,74,195'),core:brush('111,58,159')};
  let width = 1, height = 1, visible = false, paused = false;
  let frame = 0, lastDraw = null, elapsed = .55;
  try { paused = localStorage.getItem('fenixa-hero-paused') === 'true'; } catch {}
  if (paused) elapsed = 5.4;
  let light = document.body.classList.contains('light');

  function renderPlume(ctx, path, time, age, seed, front) {
    const reach = front ? 4.5 : 5.4;
    const tip = age / reach, tail = (age - 6.8) / reach;
    if (tip <= 0 || tail >= 1) return;
    const start = Math.max(0, Math.floor(tail*134));
    const end = Math.min(134, Math.ceil(tip*134));
    const phase = time*tau/16, widthFactor = front ? .47 : 1;
    const points = [];
    for (let i=start; i<=end; i++) {
      const p=path[i], u=p.u;
      const edge = smooth((tip-u)/.14)*smooth((u-tail)/.25)
                 * smooth((1-u)/.16)*smooth(u/.1);
      const wave = u*13 - phase*2 + seed;
      const drift = widthFactor*(.018*Math.sin(wave)+.011*Math.sin(u*24-phase*3-seed));
      const spread = widthFactor*(.012 + .026*Math.pow(Math.sin(u*7-phase+seed),2) + .02*u);
      points.push({x:p.x+p.nx*drift,y:p.y+p.ny*drift,nx:p.nx,ny:p.ny,u,edge,spread,wave});
    }
    // Overlapping feathered marks make a continuous filament with soft edges.
    // The thin light and its wider wake travel on slightly different curves.
    const palette = light ? daylight : midnight;
    const glint = (age / 6.1) % 1.45;
    ctx.save();
    for (const p of points) {
      if (p.edge < .005) continue;
      const bend = Math.sin(p.wave * .68 + seed);
      const fork = p.spread * (.43 + .52 * bend) * Math.sin(p.wave + phase);
      const gleam = Math.exp(-Math.pow((p.u - glint) / .13, 2));
      const breadth = widthFactor * (.66 + .36 * bend + .45 * (1 - p.u));
      const exposure = p.edge * (front ? .57 : 1);
      ctx.save();
      ctx.translate(p.x * width, p.y * height);
      ctx.rotate(Math.atan2(-p.nx * height, p.ny * width));
      function dab(brush, length, thickness, offset, alpha) {
        ctx.globalAlpha = alpha * exposure;
        ctx.drawImage(brush, -length * width / 2, (offset - thickness / 2) * height,
                      length * width, thickness * height);
      }
      dab(palette.haze, .19, .22 * breadth, fork * .36, .12);
      dab(palette.color, .12, .10 * breadth, fork * .62, .17);
      dab(palette.color, .10, .042 * breadth, -fork * .58, .15);
      dab(palette.core, .086, (.018 + .012 * gleam) * breadth, fork, .19 + .38 * gleam);
      ctx.restore();
    }
    ctx.restore();
  }
  function draw(t) {
    layers.forEach((ctx,index)=>{
      ctx.clearRect(0,0,width,height);
      const localTime=t+(index ? -.7 : 0);
      if (localTime<0) return;
      const pulse=Math.floor(localTime/8);
      for(let n=Math.max(0,pulse-1);n<=pulse;n++) {
        renderPlume(ctx,paths[index],t,localTime-n*8,(n%2)*2.6+index*.9,index===1);
      }
    });
  }
  function resize() {
    const box=scene.getBoundingClientRect();
    if (!box.width || !box.height) return;
    width=box.width; height=box.height;
    const ratio=Math.min(devicePixelRatio || 1,1.5,1100/width);
    for(const ctx of layers) {
      ctx.canvas.width=Math.round(width*ratio); ctx.canvas.height=Math.round(height*ratio);
      ctx.setTransform(ctx.canvas.width/width,0,0,ctx.canvas.height/height,0,0);
    }
    draw(reduced.matches ? 5.4 : elapsed);
  }
  function tick(now) {
    if(lastDraw===null) lastDraw=now;
    const delta=now-lastDraw;
    if(delta>=1000/30-1) {
      elapsed+=Math.min(delta,100)/1000; lastDraw=now; draw(elapsed);
    }
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    const run=visible && !document.hidden && !reduced.matches && !paused;
    hero.dataset.moving=String(run);
    if(run && !frame) { lastDraw=null; frame=requestAnimationFrame(tick); }
    if(!run && frame) { cancelAnimationFrame(frame); frame=0; lastDraw=null; }
    draw(reduced.matches ? 5.4 : elapsed);
    button.hidden=reduced.matches;
    button.classList.toggle('is-paused',paused);
    button.title=paused?'Reanudar la estela':'Pausar la estela';
    button.setAttribute('aria-label',button.title);
  }
  hero.classList.add('has-vapor');
  resize(); sync();
  new ResizeObserver(resize).observe(scene);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting; sync();}).observe(scene);
  new MutationObserver(()=>{
    const next=document.body.classList.contains('light');
    if(next!==light) { light=next; draw(reduced.matches ? 5.4 : elapsed); }
  }).observe(document.body,{attributes:true,attributeFilter:['class']});
  button.addEventListener('click',()=>{
    paused=!paused;
    try { localStorage.setItem('fenixa-hero-paused',String(paused)); } catch {}
    sync();
  });
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
})();
