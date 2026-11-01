// Merge verified public Bingo poster cache with the restricted published-HQ feed.
// Neither endpoint exposes private HQ workspace records or production notes.
(() => {
 const root=document.querySelector('[data-published-posters]');
 if(!root)return;
 const endpoint='https://wgvsnmukiaobcbyqhkkt.supabase.co/rest/v1/rpc/published_movie_posters';
 const posterEndpoint='https://wgvsnmukiaobcbyqhkkt.supabase.co/functions/v1/bingo-public-posters';
 // The standalone game's static catalog is public and contains titles only;
 // never query private HQ tables or import unverified story claims.
 const catalogEndpoint='https://bingo.cheeselouisepod.com/catalog/movies.json';
 // Only explicitly verified, public catalog metadata can be used for studio
 // discovery. Never read or display arbitrary HQ or catalog notes/fields.
 const approvedNetworks=new Set(['Hallmark Channel','Hallmark Mystery','Lifetime','CBS']);
 const approvedStudios=new Set(['MarVista Entertainment','Reel One Entertainment']);
 const key='sb_publishable_3xcqfNu-mJPuDWivmlBXug_3Tw60QoM';
 const bingo='https://bingo.cheeselouisepod.com/';
 // Same public v3 invitation contract as the standalone Bingo game. Generate
 // an independent secure invitation for every movie link, without HQ notes,
 // poster URLs, or the host player's card/marks in the URL.
 function movieInvitation(movie){
  try{
   const title=typeof movie.title==='string'?movie.title.trim().slice(0,250):'';
   if(!title||!globalThis.crypto?.getRandomValues)return bingo;
   const season=['Christmas','Fall'].includes(movie.season)?movie.season:'Unspecified';
   const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
   const invite_id=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
   const year=Number.isInteger(movie.release_year)&&movie.release_year>=1900&&movie.release_year<=2100?{release_year:movie.release_year}:{};
   const payload={v:3,invite_id,movie:{title,season,...year},
    ...(season==='Unspecified'?{cardTheme:'Christmas'}:{}),
    free:true,mode:'classic',difficulty:'balanced',ratio:50};
   const data=new TextEncoder().encode(JSON.stringify(payload));
   let binary='';for(const byte of data)binary+=String.fromCharCode(byte);
   return bingo+'#invite='+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }catch{return bingo}
 }

 let controller=null;
 let lastHqRows=[],lastCachedRows=[],lastCatalogRows=[];
 function approvedPoster(value){
  if(typeof value!=='string')return null;
  try{
   const u=new URL(value);
   if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
   if(u.hostname==='image.tmdb.org'&&/^\/t\/p\/(?:w\d+|original)\/[A-Za-z0-9_.-]+$/.test(u.pathname))return u.href;
   if(u.hostname==='upload.wikimedia.org'&&u.pathname.startsWith('/wikipedia/commons/'))return u.href;
  }catch{}
  return null;
 }
 const normalizeSearch=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const search=document.querySelector('[data-published-movie-search]');
 // A public ?search= link can reopen the same movie lookup without a login.
 // Only the visitor's search text enters the URL; never HQ or catalog fields.
 const initialParams=new URL(location.href).searchParams;
 const initialSearch=initialParams.get('search');
 if(search&&initialSearch)search.value=initialSearch.trim().slice(0,120);
 function syncSearchUrl(){
  const url=new URL(location.href);
  const term=(search?.value||'').trim().slice(0,120);
  if(term)url.searchParams.set('search',term);
  else url.searchParams.delete('search');
  if(selectedSeason)url.searchParams.set('season',selectedSeason);
  else url.searchParams.delete('season');
  if(url.href!==location.href)history.replaceState(history.state,'',url);
 }
 const expand=document.querySelector('[data-published-movie-expand]');
 const status=document.querySelector('[data-published-movie-status]');
 let allMovies=[];
 let expanded=false;
 let selectedSeason=['Christmas','Fall'].includes(initialParams.get('season'))?initialParams.get('season'):'';
 const filters=[...document.querySelectorAll('[data-season]')];
 filters.forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.season===selectedSeason));
  button.addEventListener('click',()=>{selectedSeason=button.dataset.season;expanded=false;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));syncSearchUrl();render()});
 });
 function show(hqRows,cachedRows,catalogRows){
  // Automatic artwork fills gaps; only a deliberately HQ-locked poster can
  // replace a verified automatic image for an exact title and release year.
  const map=new Map();
  // Match accent variants from independently sourced catalog and published HQ rows,
  // without merging different release years or exposing any private HQ fields.
  const movieKey=m=>m.title.normalize('NFKD').replace(/\p{M}/gu,'').trim().replace(/\s+/g,' ').toLowerCase()+'|'+m.release_year;
  for(const m of cachedRows){
   if(typeof m?.title!=='string'||!m.title.trim()||!Number.isInteger(m.release_year))continue;
   if(m.season==='Horror')continue;
   const poster=approvedPoster(m.poster_url);
   const movie={title:m.title.trim().slice(0,250),release_year:m.release_year,season:['Christmas','Fall','Horror'].includes(m.season)?m.season:'Unspecified',
    poster_url:poster,poster_locked:false,is_hq:false};
   map.set(movieKey(movie),movie);
  }
  for(const m of hqRows){
   if(typeof m?.title!=='string'||!m.title.trim()||m.season==='Horror')continue;
   const title=m.title.trim().slice(0,250);
   const year=Number.isInteger(m.release_year)&&m.release_year>=1900&&m.release_year<=2100?m.release_year:null;
   const movie={title,release_year:year,season:['Christmas','Fall'].includes(m.season)?m.season:'Unspecified',
    poster_url:approvedPoster(m.poster_url),poster_locked:m.poster_locked===true,
    published_at:typeof m.published_at==='string'?m.published_at:'',is_hq:true};
   const key=movieKey(movie),prior=map.get(key);
   if(prior)movie.poster_url=movie.poster_locked&&movie.poster_url?movie.poster_url:prior.poster_url||movie.poster_url;
   map.set(key,movie);
  }
  // Search-only listings make every public Bingo title discoverable even when
  // the poster cache has not resolved artwork. Import only title/year/season;
  // reject demos and horror, and never surface catalog story facts or notes.
  for(const m of catalogRows){
   if(typeof m?.title!=='string'||!m.title.trim()||m.is_demo===true||m.season==='Horror')continue;
   if(!Number.isInteger(m.release_year)||m.release_year<1900||m.release_year>2100)continue;
   const movie={title:m.title.trim().slice(0,250),release_year:m.release_year,
    season:['Christmas','Fall'].includes(m.season)?m.season:'Unspecified',
    poster_url:null,poster_locked:false,is_hq:false,catalog_only:true};
   const key=movieKey(movie);
   const verified=m.verification_status==='metadata_verified';
   const network=verified&&approvedNetworks.has(m.network)?m.network:'';
   const studio=verified&&approvedStudios.has(m.production_company)?m.production_company:'';
   const existing=map.get(key);
   if(existing){
    // Enrich a cached or HQ-published movie without changing its poster,
    // locked-artwork precedence, title, season, or published visibility.
    if(network)existing.network=network;
    if(studio)existing.studio=studio;
   }else map.set(key,{...movie,network,studio});
  }
  allMovies=[...map.values()].sort((a,b)=>Number(b.is_hq)-Number(a.is_hq)||
   String(b.published_at||'').localeCompare(String(a.published_at||''))||a.title.localeCompare(b.title));
  render();
 }
 function render(){
  const term=normalizeSearch(search?.value||'');
  const tokens=term.split(' ').filter(Boolean);
  // Match title/year terms in any order, as in the standalone Bingo search.
  // Never broaden a non-Latin query into an empty, match-everything search.
  const matches=allMovies.filter(m=>(tokens.length||selectedSeason||!m.catalog_only)&& (tokens.length||normalizeSearch(m.title)!=='christmas in the rockies')&&(!selectedSeason||m.season===selectedSeason)&&(!tokens.length||tokens.every(token=>normalizeSearch([m.title,m.release_year,m.network,m.studio].filter(Boolean).join(' ')).includes(token))));
  // Keep the homepage's three featured picks, but show more useful results
  // immediately when someone searches or selects a season.
  const visibleLimit=term||selectedSeason?9:3;
  const movies=expanded?matches:matches.slice(0,visibleLimit);
  const fragment=document.createDocumentFragment();
  if(!movies.length){
   const note=document.createElement('p');
   note.textContent=term||selectedSeason?'No Bingo movies match that search. Try another title or season.':'Movie selections are temporarily unavailable. You can still open Romantiverse Bingo above.';
   fragment.append(note);
   if(term){
    const action=document.createElement('p');
    action.className='movie-empty-action';
    const link=document.createElement('a');
    link.href=bingoSearchUrl();
    link.textContent='Try this search in the full Bingo catalog';
    action.append(link);
    fragment.append(action);
   }
  }
  for(const movie of movies){
   const row=document.createElement('div');row.className='published-poster-row';
   const poster=approvedPoster(movie.poster_url);
   if(poster){
    const img=document.createElement('img');img.src=poster;img.alt='Poster for '+movie.title;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
    img.addEventListener('error',()=>{const fallback=document.createElement('span');fallback.className='published-poster-fallback';fallback.textContent='🧀';fallback.setAttribute('aria-hidden','true');img.replaceWith(fallback)},{once:true});
    row.append(img);
   }else{
    const fallback=document.createElement('span');fallback.className='published-poster-fallback';fallback.textContent='🧀';fallback.setAttribute('aria-hidden','true');row.append(fallback);
   }
   const info=document.createElement('div');
   const title=document.createElement('strong');title.textContent=movie.title.slice(0,250);
   const detail=document.createElement('small');const metadata=[movie.release_year,movie.season==='Unspecified'?'':movie.season,movie.network,movie.studio].filter(Boolean).join(' · ');detail.textContent=movie.catalog_only?'Bingo catalog · '+metadata:metadata||(movie.is_hq?'Published Bingo selection':'Verified Bingo catalog poster');
   const link=document.createElement('a');link.href=movieInvitation(movie);link.textContent='Play Bingo →';link.setAttribute('aria-label','Play Romantiverse Bingo for '+movie.title+' with your own randomized card');
   link.addEventListener('click',()=>{link.href=movieInvitation(movie)});
   info.append(title,detail,link);row.append(info);fragment.append(row);
  }
  root.replaceChildren(fragment);
  if(expand){
   expand.hidden=matches.length<=visibleLimit;
   expand.textContent=expanded?(term||selectedSeason?'Show fewer matching movies':'Show featured movies'):'Show all '+matches.length+' matching movies';
   expand.setAttribute('aria-expanded',String(expanded));
  }
  if(status){
   const message='Showing '+movies.length+' of '+matches.length+' Bingo movies'+(term||selectedSeason?' matching your filters.':'.');
   if(status.textContent!==message)status.textContent=message;
  }
 }
 // Carry only the visitor's search text to the complete public Bingo catalog.
 // This avoids making people retype a movie missing from the homepage's curated list.
 const fullCatalogLink=document.querySelector('.movie-section .free-note a');
 function bingoSearchUrl(){
  const title=(search?.value||'').trim().slice(0,120);
  const url=new URL(bingo);
  if(title)url.searchParams.set('search',title);
  return url.href;
 }
 function updateFullCatalogLink(){
  if(fullCatalogLink)fullCatalogLink.href=bingoSearchUrl();
 }
 search?.addEventListener('input',()=>{expanded=false;syncSearchUrl();updateFullCatalogLink();render()});
 updateFullCatalogLink();
 expand?.addEventListener('click',()=>{expanded=!expanded;render()});
 async function refresh(){
  if(root.contains(document.activeElement))return;
  controller?.abort();const request=new AbortController();controller=request;
  const timeout=setTimeout(()=>request.abort('timeout'),12000);
  try{
   const retry=document.querySelector('[data-movie-retry]');
   if(retry)retry.hidden=true;
   const accept=(kind,rows)=>{
    if(request!==controller||request.signal.aborted)return rows;
    if(kind==='hq')lastHqRows=rows;else if(kind==='cache')lastCachedRows=rows;else lastCatalogRows=rows;
    show(lastHqRows,lastCachedRows,lastCatalogRows);
    return rows;
   };
   const [hq,cache,catalog]=await Promise.allSettled([
    fetch(endpoint,{headers:{apikey:key,Accept:'application/json'},cache:'no-store',signal:request.signal})
     .then(async response=>{if(!response.ok)throw Error('Published HQ feed '+response.status);const rows=await response.json();if(!Array.isArray(rows))throw Error('Invalid published HQ feed');return rows}).then(rows=>accept('hq',rows)),
    fetch(posterEndpoint,{headers:{Accept:'application/json'},cache:'no-store',signal:request.signal})
     .then(async response=>{if(!response.ok)throw Error('Public poster cache '+response.status);const body=await response.json();if(body?.version!==1||!Array.isArray(body.movies))throw Error('Invalid public poster cache');return body.movies}).then(rows=>accept('cache',rows)),
    fetch(catalogEndpoint,{headers:{Accept:'application/json'},cache:'no-store',signal:request.signal})
     .then(async response=>{if(!response.ok)throw Error('Public Bingo catalog '+response.status);const body=await response.json();if(body?.version!==1||!Array.isArray(body.movies))throw Error('Invalid public Bingo catalog');return body.movies.slice(0,3000)}).then(rows=>accept('catalog',rows))
   ]);
   if(request!==controller||(request.signal.aborted&&request.signal.reason!=='timeout'))return;
   if(hq.status==='rejected'&&cache.status==='rejected'&&catalog.status==='rejected')throw Error('All public movie feeds unavailable');
   show(lastHqRows,lastCachedRows,lastCatalogRows);
   if(retry)retry.hidden=hq.status==='fulfilled'&&cache.status==='fulfilled'&&catalog.status==='fulfilled';
  }catch(error){
   if(request!==controller||(request.signal.aborted&&request.signal.reason!=='timeout'))return;
   console.warn('Public Bingo poster feeds unavailable',error);
   if(!root.querySelector('.published-poster-row'))root.textContent='Movie selections are temporarily unavailable. You can still play Romantiverse Bingo above.';
   const retry=document.querySelector('[data-movie-retry]');if(retry)retry.hidden=false;
  }finally{clearTimeout(timeout)}
 }
 document.querySelector('[data-movie-retry]')?.addEventListener('click',event=>{event.currentTarget.hidden=true;refresh()});
 refresh();
 window.setInterval(()=>{if(document.visibilityState==='visible')refresh()},300000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
})();
