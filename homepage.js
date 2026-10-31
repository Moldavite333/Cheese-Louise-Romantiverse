(()=>{'use strict';const menu=document.querySelector('[data-menu-button]'),nav=document.querySelector('[data-nav]');function close(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');menu.textContent='Menu'}menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');menu.textContent=open?'Close':'Menu'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){close();menu.focus()}});document.querySelector('[data-year]').textContent=new Date().getFullYear();function openTarget(){const id=location.hash.slice(1);if(!id)return;const el=document.getElementById(id);if(el?.tagName==='DETAILS')el.open=true}document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const el=document.getElementById(a.hash.slice(1));if(el?.tagName==='DETAILS')el.open=true}));window.addEventListener('hashchange',openTarget);openTarget();const tropes=["Cute first meeting","Career versus love dilemma","Big-city person returns home","An old flame reappears","A beloved business must be saved","Avoidable misunderstanding","Timed interruption","Romantic gesture","A relative gives unsolicited love advice","The almost-kiss","The entire town gets involved","A romantic deadline approaches","Someone learns the true meaning of life","Convenient coincidence","Romantic rival","Decorating turns into accidental flirting","An awkward date","Two people are forced to spend time together","A town event saves the day","Someone reveals a secret talent","Late romantic realization","Someone arrives at the last possible moment","Someone overhears the wrong half of a conversation","Family pressure complicates everything","Big-city life is terrible","A stranger knows exactly what to say","Love is confessed in public","The love interest has no flaws","Small-town magic fixes a real-world problem","Everyone knows the ending except the leads","A sentimental family heirloom matters","Breaking down / stuck in town","Meddling Santas","Family tragedy","Objects come to life","Time travel / parallel-universe life","Snowball fights","Snow angels","Free food"];const input=document.getElementById('cheese-trope-search'),list=document.getElementById('cheese-trope-results'),count=document.getElementById('cheese-trope-count');function render(){const q=input.value.trim().toLowerCase(),matches=tropes.filter(t=>t.toLowerCase().includes(q));list.replaceChildren(...matches.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));count.textContent=matches.length+' tropes found'}input.addEventListener('input',render);render()})();
document.addEventListener("play",event=>{if(event.target.tagName==="AUDIO")document.querySelectorAll("audio").forEach(player=>{if(player!==event.target)player.pause()})},true);

function watchAudio(player) {
  const notice=document.createElement('p');
  notice.hidden=true;
  notice.setAttribute('role','status');
  player.after(notice);
  player.addEventListener('error',()=>{
    notice.textContent='This audio could not load. Try again, or ';
    const link=document.createElement('a');
    link.href=player.currentSrc||player.querySelector('source')?.src||player.src;
    link.textContent='open the audio directly';
    notice.append(link,'.');
    notice.hidden=false;
  });
}
document.querySelectorAll('audio').forEach(watchAudio);
fetch('podcast-promo.json',{signal:AbortSignal.timeout(8000)})
.then(r=>{if(!r.ok)throw Error();return r.json()})
.then(p=>{
  if(typeof p.audio!=='string'||!/^audio\/[a-zA-Z0-9_-]+\.(mp3|m4a|wav)$/.test(p.audio))return;
  const slot=document.getElementById('podcast-promo');
  const title=document.createElement('h3'),player=document.createElement('audio');
  title.textContent=String(p.title||'Meet Cheese Louise').slice(0,100);
  player.controls=true;player.preload='none';player.src=p.audio;
  player.setAttribute('aria-label','Play podcast promo');
  slot.append(title,player);
  watchAudio(player);
  if(typeof p.transcript==='string'&&p.transcript.trim()){
    const details=document.createElement('details'),summary=document.createElement('summary'),copy=document.createElement('p');
    summary.textContent='Read the promo transcript';copy.textContent=p.transcript.slice(0,10000);
    details.append(summary,copy);slot.append(details);
  }
  slot.hidden=false;
}).catch(()=>{});
