(()=>{'use strict';const menu=document.querySelector('[data-menu-button]'),nav=document.querySelector('[data-nav]');function close(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');menu.textContent='Menu'}menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');menu.textContent=open?'Close':'Menu'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));document.addEventListener('pointerdown',event=>{if(nav.classList.contains('open')&&!nav.contains(event.target)&&!menu.contains(event.target))close()});window.addEventListener('resize',()=>{if(window.innerWidth>760&&nav.classList.contains('open'))close()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){close();menu.focus()}});document.querySelector('[data-year]').textContent=new Date().getFullYear();function openTarget(){const id=location.hash.slice(1);if(!id)return;const el=document.getElementById(id);if(el?.tagName==='DETAILS')el.open=true}document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const el=document.getElementById(a.hash.slice(1));if(el?.tagName==='DETAILS')el.open=true}));window.addEventListener('hashchange',openTarget);openTarget();// Public romance, Christmas, and Fall Bingo tropes, synchronized from the
// standalone Bingo illustration registry. Horror and center-brand artwork
// remain excluded from the public Romantiverse field guide.
const tropes=["A barn party","A beloved business must be saved","A chance encounter","A chance to start over","A change of heart","A charming tree farm","A Christmas carol","A Christmas Eve deadline","A Christmas market","A Christmas miracle","A Christmas ornament","A Christmas wish","A coincidence","A cozy fireplace moment","A cozy sweater","A difficult choice","A dramatic exit","A fall romance","A fall tradition","A family holiday tradition","A farm stand meet-cute","A festival deadline","A festive fundraiser","A festive kiss","A festive party","A flannel-clad love interest","A happy ending","A harvest dance","A heartfelt apology","A holiday baking contest","A holiday parade","A last-minute Christmas gift","A leaf-peeping trip","A long-awaited kiss","A magical snowfall","A major change of plans","A meaningful gift","A meaningful photograph","A missed connection","A misunderstanding","A moment of honesty","A relative gives unsolicited love advice","A romantic confession","A romantic deadline approaches","A romantic gesture","A romantic getaway","A romantic realization","A scenic hayride","A secret crush","A secret is discovered","A sentimental family heirloom matters","A shared meal","A shared tradition","A snowstorm changes plans","A special celebration","A stranger knows exactly what to say","A supportive friend","A surprise announcement","A surprise invitation","A surprise present","A surprise visitor","A thoughtful surprise","A town Christmas tree lighting","A town event saves the day","A tree-decorating scene","An autumn sunset kiss","An awkward date","An awkward introduction","An emotional goodbye","An emotional holiday reunion","An emotional reunion","An important letter","An inconvenient romantic rival","An interruption","An old flame reappears","An overdecorated small town","An ugly Christmas sweater","An unexpected autumn storm","An unexpected date","An unexpected phone call","An unexpected sleigh ride","Apple cider conversation","Apple pie","Apple-picking date","Autumn leaves everywhere","Big-city life loses its appeal","Big-city person returns home","Bonfire heart-to-heart","Breaking down / stuck in town","Career versus love dilemma","Christmas cookies are plot-critical","Christmas lights everywhere","Corn maze mishap","Crisp autumn morning","Decorating turns into accidental flirting","Everyone knows the ending except the leads","Fall decorations montage","Family orchard crisis","Family pressure complicates everything","Family tragedy","First dance","First meeting","Free food","Harvest festival showdown","Hot cocoa fixes everything","Love is confessed in public","Meddling Santas","Mistletoe appears at the perfect time","Objects come to life","Pie contest rivalry","Pumpkin carving","Pumpkin patch encounter","Pumpkin spice is mentioned","Scarecrow sighting","Second chance at love","Small-town fall fair","Small-town magic fixes a real-world problem","Snow angels","Snowball fights","Someone arrives at the last possible moment","Someone changes their mind","Someone learns the true meaning of life","Someone overhears the wrong half of a conversation","Someone reveals a secret talent","The almost-kiss","The entire town gets involved","The love interest has no apparent flaws","Time travel / parallel-universe life","Two people are forced to spend time together","Unexpected reunion"];const input=document.getElementById('cheese-trope-search'),list=document.getElementById('cheese-trope-results'),count=document.getElementById('cheese-trope-count');function render(){const q=input.value.trim().toLowerCase(),matches=tropes.filter(t=>t.toLowerCase().includes(q));list.replaceChildren(...matches.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));count.textContent=matches.length+' tropes found'}input.addEventListener('input',render);render()})();
document.addEventListener("play",event=>{if(event.target.tagName==="AUDIO")document.querySelectorAll("audio").forEach(player=>{if(player!==event.target)player.pause()})},true);

function watchAudio(player) {
  const notice=document.createElement('p');
  notice.hidden=true;
  notice.setAttribute('role','status');
  player.after(notice);
  const showError=()=>{
    notice.textContent='This audio could not load. Try again, or ';
    const link=document.createElement('a');
    link.href=player.currentSrc||player.querySelector('source')?.src||player.src;
    link.textContent='open the audio directly';
    notice.append(link,'.');
    notice.hidden=false;
  };
  player.addEventListener('error',showError);
  player.querySelectorAll('source').forEach(source=>source.addEventListener('error',showError));
  player.addEventListener('loadeddata',()=>{notice.hidden=true;notice.replaceChildren()});
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
