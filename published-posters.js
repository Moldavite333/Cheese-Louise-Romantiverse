// Public HQ artwork only. This endpoint deliberately exposes titles with
// published Bingo cards, not HQ's private workspace or production notes.
(() => {
 const root=document.querySelector('[data-published-posters]');
 if(!root)return;
 const endpoint='https://wgvsnmukiaobcbyqhkkt.supabase.co/rest/v1/rpc/published_movie_posters';
 const key='sb_publishable_3xcqfNu-mJPuDWivmlBXug_3Tw60QoM';
 const bingo='https://moldavite333.github.io/Romantiverse-Bingo-App/';
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
 function show(rows){
  const movies=rows.filter(m=>m&&typeof m.title==='string'&&m.title.trim()).sort((a,b)=>String(b.published_at||'').localeCompare(String(a.published_at||''))).slice(0,3);
  const fragment=document.createDocumentFragment();
  if(!movies.length){
   const note=document.createElement('p');note.textContent='Featured Bingo movies will appear after publication from HQ.';fragment.append(note);
  }
  for(const movie of movies){
   const row=document.createElement('div');row.className='published-poster-row';
   const poster=approvedPoster(movie.poster_url);
   if(poster){
    const img=document.createElement('img');img.src=poster;img.alt='Poster for '+movie.title;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
    img.addEventListener('error',()=>{img.replaceWith(document.createTextNode('🎬'))},{once:true});
    row.append(img);
   }else{
    const fallback=document.createElement('span');fallback.className='published-poster-fallback';fallback.textContent='🎬';fallback.setAttribute('aria-hidden','true');row.append(fallback);
   }
   const info=document.createElement('div');
   const title=document.createElement('strong');title.textContent=movie.title.slice(0,250);
   const detail=document.createElement('small');detail.textContent=[movie.release_year,movie.season==='Unspecified'?'':movie.season].filter(Boolean).join(' · ')||'Published Bingo selection';
   const link=document.createElement('a');link.href=bingo;link.textContent='Play Bingo →';link.setAttribute('aria-label','Play Romantiverse Bingo for '+movie.title);
   info.append(title,detail,link);row.append(info);fragment.append(row);
  }
  root.replaceChildren(fragment);
 }
 async function refresh(){
  controller?.abort();const request=new AbortController();controller=request;
  try{
   const response=await fetch(endpoint,{headers:{apikey:key,Accept:'application/json'},cache:'no-store',signal:request.signal});
   if(!response.ok)throw Error('Public artwork unavailable: '+response.status);
   const rows=await response.json();if(!Array.isArray(rows))throw Error('Invalid public artwork feed');
   if(!request.signal.aborted)show(rows);
  }catch(error){
   if(request.signal.aborted)return;
   console.warn('Public HQ poster feed unavailable',error);
   if(!root.querySelector('.published-poster-row'))root.textContent='Featured Bingo movies are temporarily unavailable.';
  }
 }
 refresh();
 window.setInterval(refresh,300000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
})();
