// Merge verified public Bingo poster cache with the restricted published-HQ feed.
// Neither endpoint exposes private HQ workspace records or production notes.
(() => {
 const root=document.querySelector('[data-published-posters]');
 if(!root)return;
 const endpoint='https://wgvsnmukiaobcbyqhkkt.supabase.co/rest/v1/rpc/published_movie_posters';
 const posterEndpoint='https://wgvsnmukiaobcbyqhkkt.supabase.co/functions/v1/bingo-public-posters';
 const key='sb_publishable_3xcqfNu-mJPuDWivmlBXug_3Tw60QoM';
 const bingo='https://moldavite333.github.io/Romantiverse-Bingo-App/';
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
 const search=document.querySelector('[data-published-movie-search]');
 const expand=document.querySelector('[data-published-movie-expand]');
 const status=document.querySelector('[data-published-movie-status]');
 let allMovies=[];
 let expanded=false;
 function show(hqRows,cachedRows){
  // Automatic artwork fills gaps; only a deliberately HQ-locked poster can
  // replace a verified automatic image for an exact title and release year.
  const map=new Map();
  const movieKey=m=>m.title.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()+'|'+m.release_year;
  for(const m of cachedRows){
   if(typeof m?.title!=='string'||!m.title.trim()||!Number.isInteger(m.release_year))continue;
   const poster=approvedPoster(m.poster_url);if(!poster)continue;
   const movie={title:m.title.trim().slice(0,250),release_year:m.release_year,season:'Unspecified',
    poster_url:poster,poster_locked:false,is_hq:false};
   map.set(movieKey(movie),movie);
  }
  for(const m of hqRows){
   if(typeof m?.title!=='string'||!m.title.trim())continue;
   const title=m.title.trim().slice(0,250);
   const year=Number.isInteger(m.release_year)&&m.release_year>=1900&&m.release_year<=2100?m.release_year:null;
   const movie={title,release_year:year,season:['Christmas','Fall'].includes(m.season)?m.season:'Unspecified',
    poster_url:approvedPoster(m.poster_url),poster_locked:m.poster_locked===true,
    published_at:typeof m.published_at==='string'?m.published_at:'',is_hq:true};
   const key=movieKey(movie),prior=map.get(key);
   if(prior)movie.poster_url=movie.poster_locked&&movie.poster_url?movie.poster_url:prior.poster_url||movie.poster_url;
   map.set(key,movie);
  }
  allMovies=[...map.values()].sort((a,b)=>Number(b.is_hq)-Number(a.is_hq)||
   String(b.published_at||'').localeCompare(String(a.published_at||''))||a.title.localeCompare(b.title));
  render();
 }
 function render(){
  const term=(search?.value||'').trim().toLocaleLowerCase();
  const matches=term?allMovies.filter(m=>(m.title+' '+(m.release_year||'')).toLocaleLowerCase().includes(term)):allMovies;
  const movies=term||expanded?matches:matches.slice(0,3);
  const fragment=document.createDocumentFragment();
  if(!movies.length){
   const note=document.createElement('p');
   note.textContent=term?'No Bingo movies match that search.':'Bingo movie posters are temporarily unavailable.';
   fragment.append(note);
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
   const detail=document.createElement('small');detail.textContent=[movie.release_year,movie.season==='Unspecified'?'':movie.season].filter(Boolean).join(' · ')||(movie.is_hq?'Published Bingo selection':'Verified Bingo catalog poster');
   const link=document.createElement('a');link.href=movieInvitation(movie);link.textContent='Play Bingo →';link.setAttribute('aria-label','Play Romantiverse Bingo for '+movie.title+' with your own randomized card');
   link.addEventListener('click',()=>{link.href=movieInvitation(movie)});
   info.append(title,detail,link);row.append(info);fragment.append(row);
  }
  root.replaceChildren(fragment);
  if(expand){
   expand.hidden=allMovies.length<=3||Boolean(term);
   expand.textContent=expanded?'Show featured movies':'Show all '+allMovies.length+' Bingo movies';
   expand.setAttribute('aria-expanded',String(expanded));
  }
  if(status){
   const message=term?'Showing '+movies.length+' of '+allMovies.length+' Bingo movies matching your search.':'Showing '+movies.length+' of '+allMovies.length+' Bingo movies.';
   if(status.textContent!==message)status.textContent=message;
  }
 }
 search?.addEventListener('input',render);
 expand?.addEventListener('click',()=>{expanded=!expanded;render()});
 async function refresh(){
  controller?.abort();const request=new AbortController();controller=request;
  try{
   const [hq,cache]=await Promise.allSettled([
    fetch(endpoint,{headers:{apikey:key,Accept:'application/json'},cache:'no-store',signal:request.signal})
     .then(async response=>{if(!response.ok)throw Error('Published HQ feed '+response.status);const rows=await response.json();if(!Array.isArray(rows))throw Error('Invalid published HQ feed');return rows}),
    fetch(posterEndpoint,{headers:{Accept:'application/json'},cache:'no-store',signal:request.signal})
     .then(async response=>{if(!response.ok)throw Error('Public poster cache '+response.status);const body=await response.json();if(body?.version!==1||!Array.isArray(body.movies))throw Error('Invalid public poster cache');return body.movies})
   ]);
   if(request.signal.aborted)return;
   if(hq.status==='rejected'&&cache.status==='rejected')throw Error('Both public movie feeds unavailable');
   show(hq.status==='fulfilled'?hq.value:[],cache.status==='fulfilled'?cache.value:[]);
  }catch(error){
   if(request.signal.aborted)return;
   console.warn('Public Bingo poster feeds unavailable',error);
   if(!root.querySelector('.published-poster-row'))root.textContent='Bingo movie posters are temporarily unavailable.';
  }
 }
 refresh();
 window.setInterval(refresh,300000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
})();
