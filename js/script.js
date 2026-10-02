/* Krisha's birthday site - shared script. Every page loads this file. */
const PAGES=[['index','Home'],['memories','Memory'],['gallery','Gallery'],['letter','Letter'],['cake','Cake'],['surprise','Surprise']];
const COLORS=['#f7c8d8','#d98ba8','#e8c77b','#d9c7e8','#ffd3b8','#fff8ef'];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const page=document.body.dataset.page,idx=PAGES.findIndex(p=>p[0]===page);
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;return e}

/* Falling / rising particles. once=true makes a one-time burst. */
function fx(chars,n,{fall=false,once=false,dur=[8,16],size=[14,30]}={}){
  const c=el('div','fx'+(fall?' fall':'')+(once?' once':''));
  for(let i=0;i<n;i++){const b=el('b','',pick(chars));
    b.style.cssText=`left:${rnd(0,100)}%;font-size:${rnd(...size)}px;color:${pick(COLORS)};--d:${rnd(...dur)}s;--w:${once?rnd(0,2):-rnd(0,dur[1])}s`;c.appendChild(b)}
  document.body.appendChild(c);
  if(once)setTimeout(()=>c.remove(),(dur[1]+3)*1000);
}

/* Nav, fairy lights, prev/next */
function chrome(){
  const links=PAGES.map(([p,t],i)=>`<li><a href="${p}.html"${i===idx?' class="on"':''}>${t}</a></li>`).join('');
  document.body.prepend(el('div','lights','<i></i>'.repeat(16)));
  document.body.prepend(el('nav','nav',`<a class="brand" href="index.html">For Krisha ♡</a><ul>${links}</ul><button class="music">♪ Music</button><button class="burger" aria-label="Menu">☰</button>`));
  $('.burger').onclick=()=>$('.nav ul').classList.toggle('open');
  if(idx>0){const pv=PAGES[idx-1],nx=PAGES[idx+1];
    document.body.appendChild(el('div','pn',`<a href="${pv[0]}.html">← ${pv[1]}</a>${nx?`<a href="${nx[0]}.html">${nx[1]} →</a>`:'<span></span>'}`))}
}
/* Music: starts only when clicked (browsers block autoplay) */
function music(){
  const song='assets/music/videoplayback.m4a';
  const a=new Audio(song),b=$('.music');a.loop=true;
  const set=on=>{b.classList.toggle('on',on);b.textContent=on?'♪ Playing':'♪ Music';try{localStorage.setItem('krishaMusic',on?1:0)}catch(e){};};
  const start=()=>a.play().then(()=>set(true)).catch(()=>{set(false);});
  b.onclick=()=>a.paused?start():(a.pause(),set(false));
  let saved=false;try{saved=localStorage.getItem('krishaMusic')==='1'}catch(e){}
  if(saved)addEventListener('pointerdown',e=>{if(!e.target.closest('.music'))start()},{once:true});
}
/* Scroll reveal */
function reveals(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach(e=>io.observe(e));
}
/* Text sequence: steps = [text, milliseconds, extra classes]. 'keep' stays on screen. */
function play(stage,steps,done){
  let t=0;const timers=[];
  steps.forEach(([txt,ms,cls=''])=>{
    timers.push(setTimeout(()=>{$$('.tmp',stage).forEach(x=>x.remove());
      const p=el('p','line '+cls+(cls.includes('keep')?'':' tmp'),txt);p.style.setProperty('--ms',ms+'ms');stage.appendChild(p)},t));t+=ms});
  timers.push(setTimeout(done,t));
  return()=>{timers.forEach(clearTimeout);const l=steps[steps.length-1];stage.innerHTML='';stage.appendChild(el('p','line '+l[2],l[0]));done()};
}

/* Page 1 */
function home(){
  const stage=$('.stage');let finished=false;
  const done=()=>{if(finished)return;finished=true;$('.btn').classList.remove('hid');fx(['✿','❀','♡'],10,{fall:true,once:true,dur:[7,12]})};
  const skip=play(stage,[['Hey Krisha...',2600],['I made something just for you.',3200],["Because today isn't just another day...",3400],["It's YOUR DAY.",2800],['Happy Birthday, Krisha',1200,'big keep']],done);
  stage.onclick=()=>{if(!finished)skip()};
}
/* Page 3: lightbox */
function buildPhotoGrid(containerId, captions, ratios){
  const container=document.getElementById(containerId);
  if(!container)return [];
  const limit=6;
  const items=Array.from({length:limit},(_,index)=>{
    const n=index+1;
    return {
      src:`assets/photos/p${n}.png`,
      fallback:`assets/photos/p${n}.jpg`,
      alt:`Krisha Memory ${n}`,
      title:captions[index]||`Memory ${n}`,
      ratio:ratios[index]||'4/5'
    };
  });
  container.innerHTML=items.map(item=>`
    <figure class="pol reveal">
      <div class="ph" style="--ar:${item.ratio}">
        <img src="${item.src}" alt="${item.alt}" onerror="this.onerror=null;this.src='${item.fallback}';this.onerror=()=>this.remove()">
      </div>
      <figcaption class="cap">${item.title}</figcaption>
    </figure>
  `).join('');
  return [...container.querySelectorAll('.pol')];
}

function lightbox(){
  const items=$$('#gal .pol');let i=0;
  if(!items.length)return;
  const lb=el('div','lb','<button class="x" aria-label="Close">×</button><button class="pv" aria-label="Previous">‹</button><div class="ph"></div><p></p><button class="nx" aria-label="Next">›</button>');
  document.body.appendChild(lb);
  const show=n=>{i=(n+items.length)%items.length;const it=items[i],img=$('img',it),ph=$('.ph',lb);
    ph.style.setProperty('--ar',it.querySelector('.ph').style.getPropertyValue('--ar')||it.style.getPropertyValue('--ar')||'4/5');
    ph.innerHTML=img?`<img src="${img.getAttribute('src')}" alt="${img.alt}" onerror="this.remove()">`:'';
    $('p',lb).textContent=$('.cap',it).textContent;lb.classList.add('on')};
  items.forEach((it,n)=>it.onclick=()=>show(n));
  $('.x',lb).onclick=()=>lb.classList.remove('on');$('.pv',lb).onclick=()=>show(i-1);$('.nx',lb).onclick=()=>show(i+1);
  lb.onclick=e=>{if(e.target===lb)lb.classList.remove('on')};
  addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;
    if(e.key==='Escape')lb.classList.remove('on');if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});
}
/* Page 4: envelope */
function letter(){
  const e=$('.env');
  e.onclick=()=>{e.classList.add('open');$('.hint').classList.add('hid');
    setTimeout(()=>{e.classList.add('gone');$('.paper').classList.add('show');fx(['♡','✿'],12,{once:true,dur:[6,10]})},900)};
}
/* Page 5: cake */
function cake(){
  const cs=$$('.candle');let out=0;
  cs.forEach(c=>c.onclick=()=>{if(c.classList.contains('out'))return;c.classList.add('out');
    const s=el('i','smoke');c.appendChild(s);setTimeout(()=>s.remove(),2400);
    if(++out===cs.length)setTimeout(()=>{
      document.body.classList.add('bright');$('.hint').classList.add('hid');$('.msg').classList.add('on');
      fx(['■','●','▮','◆'],90,{fall:true,once:true,dur:[5,9],size:[8,16]});
      fx(['♡','♥'],30,{once:true,dur:[5,9]});
      fx(['✦','✧','•'],40,{once:true,dur:[4,8],size:[10,24]})},700)});
}
/* Page 6: final surprise */
function finale(){
  const stage=$('.stage');
  play(stage,[['Wait...',2500],["There's one more thing.",3200],['',1200],['You deserve all the happiness in the world.',4200,'keep'],['Happy Birthday, Krisha ❤️',1500,'big keep glow']],()=>{
    $('.veil').classList.add('off');document.body.classList.add('bright');
    fx(['❀','✿','❁'],26,{fall:true,dur:[8,14]});
    fx(['■','●','▮'],80,{fall:true,once:true,dur:[5,9],size:[8,16]});
    fx(['♡','♥'],24,{dur:[7,12]});fx(['✦','✧'],24,{dur:[5,10],size:[10,24]});
    const g=$('.garden');g.innerHTML='🌸🌷🌼🌹🌺🌻🌸'.match(/./gu).map((f,i)=>`<b style="animation-delay:${i*.35}s">${f}</b>`).join('');
    setTimeout(()=>$('.sign').classList.remove('hid'),2500)});
}

/* Start */
chrome();music();fx(['♡','✿','✦','❀'],14,{size:[12,26]});
if(page==='gallery'){
  buildPhotoGrid('gal', ['Golden hour','Us, always','Pure joy','Remember this day?','My favorite person','Never a dull moment'], ['4/5','1/1','3/4','4/3','4/5','1/1']);
}
if(page==='memories'){
  buildPhotoGrid('memories-grid', ['That smile...','One of my favorite memories.','Some moments deserve to stay forever.','Just you being you.','Laughing for no reason ♡','I\'m so glad it\'s you.'], ['4/5','4/5','4/5','4/5','4/5','4/5']);
}
reveals();
({index:home,gallery:lightbox,letter,cake,surprise:finale})[page]?.();
/* Page transition */
document.addEventListener('click',e=>{const a=e.target.closest('a[href$=".html"]');
  if(a&&!e.metaKey&&!e.ctrlKey){e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>location.href=a.href,350)}});
addEventListener('pageshow',()=>document.body.classList.remove('leaving'));
