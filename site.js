(() => {
 'use strict';
 const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const clamp = n => Math.min(1, Math.max(0,n));
 const phase = (p,a,b) => clamp((p-a)/(b-a));
 let dimensions = {}, queued = false, wordTimer, startTimer, toastTimer, lastMinute = -1;
 const fr=document.documentElement.lang==='fr';
 const message=(de,frText)=>fr?frText:de;
 const sections = $$('.act, .hero');
 const links = $$('.ribbon a');
 let words = $$('.spoken p span');
 function measure(){
  const y=scrollY;
  dimensions = {height:innerHeight, total:document.documentElement.scrollHeight-innerHeight, mobile:innerWidth<=820};
  sections.forEach(s=>{dimensions[s.id]={top:s.getBoundingClientRect().top+y,height:s.offsetHeight};});
  render();
 }
 function progress(id){const s=dimensions[id];return clamp((scrollY-s.top)/Math.max(1,s.height-dimensions.height));}
 function transform(el,value){el.style.transform=value;}
 const dev=document.querySelector('.hero-device');
 function render(){
  queued=false;
  const y=scrollY, vh=dimensions.height;
  let current=sections[0].id;
  sections.forEach(s=>{if(y+vh*.45>=dimensions[s.id].top)current=s.id;});
  links.forEach(l=>{if(l.hash==='#'+current)l.setAttribute('aria-current','location');else l.removeAttribute('aria-current');});
  transform($('.ribbon-progress'),`scale${dimensions.mobile?'X':'Y'}(${clamp(y/dimensions.total)})`);
  if(!reduced.matches){
   const h=progress('beginn'), fall=phase(h,0,.42), dive=phase(h,.55,1);
   transform($('.hero-name'),`translate3d(0,${-fall*vh*.06}px,0)`);$('.hero-name').style.opacity=1-phase(h,.18,.45);
   transform($('.city'),`translate3d(0,${-h*30}px,0) scale(${1+dive*.14})`);
   transform($('.foreground'),`scale(${1+phase(h,0,.9)*.06})`);if(dev){const k=phase(h,.35,1),e=k*k*(3-2*k);transform(dev,dimensions.mobile?`translate3d(-50%,${-e*vh*.2}px,0) rotate(${-4+4*e}deg) scale(${1+e*1.15})`:`translate3d(${-e*innerWidth*.14}px,${-e*vh*.22}px,0) rotate(${-5+5*e}deg) scale(${1+e*1.25})`);}
   $('.hero-intro').style.opacity=1-phase(h,.52,.65);
   $('.edition').style.opacity=1-phase(h,.50,.63);
   $('.dive-wash').style.opacity=phase(h,.83,.99);
   const p=progress('feed');
   const incoming=[0,phase(p,.27,.38),phase(p,.62,.73)];
   $$('.feed-card').forEach((c,i)=>transform(c,`translate3d(0,${i===0?0:(1-incoming[i])*105}%,0)`));
   $$('.large-verse').forEach((q,i)=>{
    const visibility=i===0?1-phase(p,.27,.36):i===1?phase(p,.30,.38)*(1-phase(p,.62,.70)):phase(p,.65,.73);
    q.style.opacity=visibility;
    transform(q,`translate3d(0,${(1-visibility)*20}px,0)`);
   });
   transform($('.live'),`scale(${1+(1-phase(p,0,.07))*.3})`);
  }
  const minute=demoMinutes(progress('feed'));
  if(minute!==lastMinute){$$('.minutes').forEach(m=>m.textContent=minute);$$('.minute-unit').forEach(m=>m.textContent=fr?(minute===1?'minute':'minutes'):(minute===1?'Minute':'Minuten'));lastMinute=minute;}
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
 function say(text){clearTimeout(toastTimer);$('.toast').textContent=text;$('.toast').classList.add('show');toastTimer=setTimeout(()=>$('.toast').classList.remove('show'),3000);}
 function selectedCard(button){
  if(!button.closest('.live'))return $('.hearing-phone .verse-card');
  const p=progress('feed');
  return $$('.feed-card')[p>=.73?2:p>=.38?1:0];
 }
 function listen(button){
  clearInterval(wordTimer);clearTimeout(startTimer);
  const card=selectedCard(button), text=card.querySelector('p').textContent, ref=card.querySelector('span').textContent;
  $('.hearing-phone .verse-card p').textContent=text;
  $('.hearing-phone .verse-card>span').textContent=ref;
  $('.spoken p').replaceChildren(...text.split(' ').flatMap((w,i)=>{
   const el=document.createElement('span');el.textContent=w;return i?[document.createTextNode(' '),el]:[el];
  }));
  $('.spoken cite').textContent=ref;
  words=$$('.spoken p span');words.forEach(w=>w.classList.remove('lit'));
  if(button.closest('.live'))$('#hoeren').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
  $$('.listen').forEach(b=>b.setAttribute('aria-pressed','true'));
  let n=0;
  const step=()=>{if(n<words.length)words[n++].classList.add('lit');else {clearInterval(wordTimer);$$('.listen').forEach(b=>b.setAttribute('aria-pressed','false'));}};
  if(reduced.matches){words.forEach(w=>w.classList.add('lit'));$$('.listen').forEach(b=>b.setAttribute('aria-pressed','false'));}
  else{startTimer=setTimeout(()=>{step();wordTimer=setInterval(step,470);},button.closest('.live')?700:0);}
 }
 $$('.listen').forEach(b=>b.addEventListener('click',()=>listen(b)));
 function save(button){
  const saved=!$('.saved-stack').classList.contains('saved');
  if(button.closest('.iphone')){
   const card=selectedCard(button);
   $('.stack-front p').textContent=card.querySelector('p').textContent;
   $('.stack-front>span').textContent=card.querySelector('span').textContent;
  }
  $('.saved-stack').classList.toggle('saved',saved);
  $$('.save, .save-main').forEach(b=>b.setAttribute('aria-pressed',String(saved)));
  $('.save-status').textContent=saved?message('Mit dem Herz gespeichert.','Verset gardé avec le cœur.'):message('Dein Vers. Zum Wiederlesen.','Ton verset. À relire.');
  say(saved?message('Vers in dieser Vorschau gemerkt.','Verset gardé dans cet aperçu.'):message('Vers aus der Vorschau entfernt.','Verset retiré de cet aperçu.'));
 }
 $$('.save, .save-main').forEach(b=>b.addEventListener('click',()=>save(b)));
 $$('.share').forEach(b=>b.addEventListener('click',()=>say(message('In Bibelfeed teilst du Verse als Bild.','Dans Bibelfeed, tu partages les versets en image.'))));
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',measure,{passive:true});
 addEventListener('load',measure);
 reduced.addEventListener('change',()=>location.reload());

 measure();
})();
