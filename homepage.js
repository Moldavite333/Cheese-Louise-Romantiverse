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
fetch('podcast-promo.json?v=pearberry-brandy-1',{signal:AbortSignal.timeout(8000),cache:'no-store'})
.then(r=>{if(!r.ok)throw Error();return r.json()})
.then(p=>{
  const primary=document.getElementById('listen-first');
  const featured=renderEpisodes(p.episodes) || p.episode;
  renderNextWeek(p.episodes);
  const episodeUrl=safeHttps(featured?.listen);
  if(episodeUrl){
    primary.href=episodeUrl;
    primary.textContent='Listen to the Latest Episode';
    primary.dataset.episodeLink='';
  }
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
  if(!episodeUrl && primary){primary.href='#podcast-promo';primary.textContent='Hear the Trailer';}
}).catch(()=>{});

function renderNextWeek(episodes) {
  const section = document.getElementById('next-week');
  if (!section || !Array.isArray(episodes)) return;
  // Only the editorially approved upcoming entry appears here. A Yes vote or
  // Bingo-list flag alone never authorizes a public podcast announcement.
  const upcoming = episodes.find(episode =>
    episode && episode.upcoming === true &&
    typeof episode.movie === 'string' && episode.movie.trim() &&
    !safeHttps(episode.listen)
  );
  if (!upcoming) return;
  const movie = upcoming.movie.trim().slice(0,180);
  document.getElementById('next-week-movie').textContent = movie;
  document.getElementById('next-week-movie-copy').textContent =
    typeof upcoming.teaser === 'string' && upcoming.teaser.trim()
      ? upcoming.teaser.trim().slice(0,500)
      : 'Nick and Jenny are getting ready to give this movie the full Romantiverse treatment.';

  const drink = upcoming.drinkPreview;
  const drinkName = typeof drink?.name === 'string' && drink.name.trim()
    ? drink.name.trim().slice(0,100) : 'The reveal is coming';
  document.getElementById('next-week-drink').textContent = drinkName;
  document.getElementById('next-week-drink-copy').textContent =
    typeof drink?.description === 'string' && drink.description.trim()
      ? drink.description.trim().slice(0,400)
      : 'The next original Cheesy Concoction is in development. The full recipe will arrive with the episode.';

  // The Bingo app accepts ?search= as a public, title-only movie handoff.
  // This finds the right movie without fabricating a saved/generated card.
  const bingoSearch = new URL('https://bingo.cheeselouisepod.com/');
  bingoSearch.searchParams.set('search', movie);
  document.getElementById('next-week-bingo').href =
    safeHttps(upcoming.bingo) || bingoSearch.href;

  const footnote = document.getElementById('next-week-date');
  if (/^\d{4}-\d{2}-\d{2}$/.test(upcoming.releaseDate || '')) {
    const date = new Date(upcoming.releaseDate + 'T12:00:00Z');
    footnote.textContent = Number.isNaN(date.getTime())
      ? '' : 'Expected ' + new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'}).format(date);
  } else {
    footnote.textContent = 'Coming up next · Movie, cocktail, and Bingo in one place';
  }
  section.hidden = false;
}

function safeHttps(value){
  if(typeof value!=='string'||!value.trim())return null;
  try{const url=new URL(value,location.href);return url.protocol==='https:'?url.href:null;}catch{return null;}
}

const suggestion = document.getElementById('trope-suggestion');
suggestion?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = suggestion.querySelector('button');
  const status = suggestion.querySelector('[role="status"]');
  const fields = new FormData(suggestion);
  button.disabled = true;
  status.textContent = 'Sending…';
  try {
    await window.clSubmitTrope(fields.get('trope'),fields.get('movie'));
    suggestion.reset();
    status.textContent = 'Thanks! Your idea went to Nick and Jenny.';
  } catch {
    status.textContent = 'Couldn’t send your suggestion. Please try again.';
  } finally {
    button.disabled = false;
  }
});

function renderEpisodes(episodes) {
  const episodeList = document.querySelector('[data-episode-list]');
  const recipeList = document.querySelector('[data-recipe-list]');
  if (!episodeList || !recipeList || !Array.isArray(episodes)) return null;

  let featured = null;
  for (const episode of episodes) {
    if (!episode || typeof episode.id !== 'string' ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(episode.id) ||
        typeof episode.movie !== 'string' || !episode.movie.trim()) continue;

    const listen = safeHttps(episode.listen);
    if (!listen || document.getElementById('episode-' + episode.id)) continue;

    const card = document.createElement('article');
    card.className = 'track';
    card.id = 'episode-' + episode.id;
    appendEpisodeText(card, 'h3', episode.movie);
    if (episode.description) appendEpisodeText(card, 'p', episode.description);

    const audio = safeHttps(episode.audio);
    if (audio) {
      const player = document.createElement('audio');
      player.controls = true;
      player.preload = 'none';
      player.src = audio;
      player.setAttribute('aria-label', 'Play ' + episode.movie);
      card.append(player);
      watchAudio(player);
    }

    const bingo = safeHttps(episode.bingo) || 'https://bingo.cheeselouisepod.com/';
    const actions = document.createElement('div');
    actions.className = 'welcome-actions';
    const listenLink = appendEpisodeLink(actions, 'Listen to the Episode', listen);
    listenLink.dataset.episodeLink = '';
    appendEpisodeLink(actions, 'Play Bingo', bingo);

    const drink = episode.drink;
    let recipeUrl;
    if (drink?.name && Array.isArray(drink.ingredients) && drink.ingredients.length &&
        Array.isArray(drink.steps) && drink.steps.length) {
      const recipe = document.createElement('article');
      recipe.className = 'track';
      recipe.id = 'recipe-' + episode.id;
      recipeUrl = '#' + recipe.id;
      appendEpisodeText(recipe, 'h3', drink.name);
      appendEpisodeText(recipe, 'p', 'From ' + episode.movie + ' · Makes 1 cocktail');
      appendEpisodeText(recipe, 'h4', 'Ingredients');
      appendRecipeList(recipe, 'ul', drink.ingredients);
      if (drink.prep) {
        appendEpisodeText(recipe, 'h4', drink.prep.title);
        appendEpisodeText(recipe, 'p', drink.prep.text);
      }
      appendEpisodeText(recipe, 'h4', 'Directions');
      appendRecipeList(recipe, 'ol', drink.steps);
      appendEpisodeLink(recipe, 'Go to the Episode', '#' + card.id);
      recipeList.append(recipe);
      appendEpisodeLink(actions, 'Make ' + drink.name, recipeUrl);
    }

    card.append(actions);
    episodeList.append(card);
    featured = { movie: episode.movie, listen, bingo, recipe: recipeUrl, drinkName: drink?.name };
  }

  if (featured) {
    episodeList.closest('section').hidden = false;
    const launchLabel = document.querySelector('.launch-label');
    if (launchLabel) {
      const episodeLink = document.createElement('a');
      episodeLink.className = 'button';
      episodeLink.href = '#episodes';
      episodeLink.textContent = 'Browse Episodes';
      launchLabel.replaceWith(episodeLink);
    }
    document.querySelector('[data-recipe-placeholder]').hidden = recipeList.childElementCount > 0;
    // The first render can happen after the browser has already tried the fragment.
    const target = document.getElementById(location.hash.slice(1));
    if (target && (episodeList.contains(target) || recipeList.contains(target))) target.scrollIntoView();
  }
  return featured;
}

function appendEpisodeText(parent, tag, value) {
  const element = document.createElement(tag);
  element.textContent = value;
  parent.append(element);
}

function appendEpisodeLink(parent, label, url) {
  const link = document.createElement('a');
  link.className = 'button';
  link.href = url;
  link.textContent = label;
  parent.append(link);
  return link;
}

function appendRecipeList(parent, tag, items) {
  const list = document.createElement(tag);
  for (const item of items) appendEpisodeText(list, 'li', item);
  parent.append(list);
}

document.querySelectorAll('[data-submission-tab]').forEach(button=>button.addEventListener('click',()=>{
 const target=button.dataset.submissionTab;
 document.querySelectorAll('[data-submission-tab]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===button)));
 document.querySelectorAll('[data-submission-panel]').forEach(panel=>panel.hidden=panel.dataset.submissionPanel!==target);
}));
const cocktailForm=document.getElementById('cocktail-suggestion');
cocktailForm?.addEventListener('submit',async event=>{
 event.preventDefault();
 const button=cocktailForm.querySelector('button[type="submit"]');
 const status=cocktailForm.querySelector('[role="status"]');
 const fields=new FormData(cocktailForm);
 button.disabled=true;
 status.textContent='Sending…';
 try{
  await window.clSubmitCocktail(fields.get('name'),fields.get('movie'),fields.get('ingredients'),fields.get('method'));
  cocktailForm.reset();
  status.textContent='Thanks! Your drink idea went to Nick and Jenny for review.';
 }catch{
  status.textContent='Couldn’t send the drink idea. Please try again.';
 }finally{
  button.disabled=false;
 }
});
