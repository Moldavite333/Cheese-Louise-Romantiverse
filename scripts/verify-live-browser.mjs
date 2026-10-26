// Real-browser end-to-end check against both deployed public sites and the
// actual anonymous HQ poster feed. No private credentials or test mutations.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const rpc='https://wgvsnmukiaobcbyqhkkt.supabase.co/rest/v1/rpc/published_movie_posters';
const key='sb_publishable_3xcqfNu-mJPuDWivmlBXug_3Tw60QoM';
const cacheUrl='https://wgvsnmukiaobcbyqhkkt.supabase.co/functions/v1/bingo-public-posters';
const response=await fetch(rpc,{headers:{apikey:key,Accept:'application/json'},signal:AbortSignal.timeout(15000)});
assert.equal(response.ok,true,'Anonymous HQ poster endpoint must respond successfully');
const movies=await response.json();
const cacheResponse=await fetch(cacheUrl,{signal:AbortSignal.timeout(15000)});
assert.equal(cacheResponse.ok,true,'Public Bingo poster cache must respond successfully');
const cache=await cacheResponse.json();
assert.equal(cache.version,1);
assert.ok(Array.isArray(cache.movies)&&cache.movies.length>=38,'All 38 bundled posters must be cached');
const allSources=[...movies,...cache.movies];
const locked=movies.find(m=>m.poster_locked===true&&m.poster_url&&m.title);
assert.ok(locked,'At least one deliberately published HQ-locked poster is needed for live verification');
const browser=await chromium.launch({headless:true});
try{
 const site=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];
 site.on('pageerror',e=>errors.push(e.message));
 await site.goto('https://cheeselouisepod.com/',{waitUntil:'domcontentloaded',timeout:30000});
 await site.waitForFunction(()=>document.querySelectorAll('[data-published-posters] .published-poster-row').length>0,null,{timeout:30000});
 const visible=await site.locator('[data-published-posters] .published-poster-row').evaluateAll(nodes=>nodes.map(node=>({
  title:node.querySelector('strong')?.textContent||'',
  poster:node.querySelector('img')?.src||null
 })));
 assert.ok(visible.length>0,'Website must show published HQ movie titles');
 for(const item of visible){
  const hq=movies.find(m=>m.title===item.title);
  const auto=cache.movies.find(m=>m.title===item.title);
  assert.ok(hq||auto,'Website displayed a title not in either public movie feed');
  const expected=hq?.poster_locked&&hq.poster_url?hq.poster_url:auto?.poster_url||hq?.poster_url;
  if(expected)assert.equal(item.poster,expected,'Website poster differs from public cache / HQ lock precedence');
 }
 // Browse/search all deliberately published titles; never query HQ's private watchlist.
 const search=site.locator('[data-published-movie-search]');
 assert.equal(await search.count(),1,'Published movie search must be accessible');
 if(allSources.length>3){
  const expand=site.locator('[data-published-movie-expand]');
  await expand.click();
  assert.equal(await expand.getAttribute('aria-expanded'),'true');
  const shown=await site.locator('[data-published-posters] .published-poster-row').count();
  const identity=m=>m.title.normalize('NFKC').trim().toLowerCase()+'|'+(m.release_year??'null');
  const unique=new Set(allSources.map(identity));
  assert.equal(shown,unique.size,'Browse all must show every unique public Bingo title');
  const target=movies.find(m=>!visible.some(v=>v.title===m.title))||movies[movies.length-1];
  await search.fill(target.title);
  const found=await site.locator('[data-published-posters] .published-poster-row strong').allTextContents();
  assert.ok(found.includes(target.title),'Published title must be searchable');
  assert.ok(found.every(title=>allSources.some(m=>m.title===title)),'Search must only use the two public movie feeds');
  await search.fill('');
  await expand.click();
  assert.equal(await expand.getAttribute('aria-expanded'),'false');
 }
 // Confirm a published movie link on the real custom domain opens that exact
 // movie as a new 25-square Bingo card, not merely the generic catalog.
 const firstLink=await site.locator('[data-published-posters] a').first().getAttribute('href');
 assert.match(firstLink,/^https:\/\/moldavite333\.github\.io\/Romantiverse-Bingo-App\/#invite=/,'Live published movie needs a direct Bingo invitation');
 const payload=JSON.parse(Buffer.from(new URL(firstLink).hash.slice('#invite='.length),'base64url').toString('utf8'));
 assert.equal(payload.v,3);
 assert.match(payload.invite_id,/^[a-f0-9]{32}$/);
 assert.equal(payload.movie.title,visible[0].title,'Live invitation must preserve HQ movie identity');
 assert.equal(Object.keys(payload).sort().join(','),['v','invite_id','movie','cardTheme','free','mode','difficulty','ratio'].filter(k=>k!=='cardTheme'||payload.movie.season==='Unspecified').sort().join(','),'No private HQ metadata may enter invitation');
 const direct=await browser.newPage({viewport:{width:390,height:844}});
 const directErrors=[];direct.on('pageerror',e=>directErrors.push(e.message));
 await direct.goto(firstLink,{waitUntil:'domcontentloaded',timeout:30000});
 await direct.waitForFunction(title=>document.querySelector('.play-heading h2')?.textContent===title&&document.querySelectorAll('.board .square').length===25,visible[0].title,{timeout:60000});
 assert.deepEqual(directErrors,[],'Direct invitation must open without JavaScript errors');
 await direct.close();
 assert.deepEqual(errors,[],'Public website JavaScript errors');
 await site.close();
 const bingo=await browser.newPage({viewport:{width:390,height:844}});
 const bingoErrors=[];
 bingo.on('pageerror',e=>bingoErrors.push(e.message));
 await bingo.goto('https://moldavite333.github.io/Romantiverse-Bingo-App/',{waitUntil:'domcontentloaded',timeout:30000});
 await bingo.waitForFunction(({title,poster})=>[...document.querySelectorAll('.movie-card')].some(card=>
  card.querySelector('h3')?.textContent===title&&card.querySelector('img.movie-poster')?.src===poster
 ),{title:locked.title,poster:locked.poster_url},{timeout:60000});
 assert.deepEqual(bingoErrors,[],'Public Bingo JavaScript errors');
 await bingo.waitForFunction(()=>document.querySelectorAll('.movie-poster').length>=38,null,{timeout:60000});
 const sample=cache.movies[0];
 const samplePoster=bingo.locator('img.movie-poster[alt="'+sample.title+' movie poster"]');
 await samplePoster.scrollIntoViewIfNeeded();
 await samplePoster.evaluate(img=>new Promise((resolve,reject)=>{
  if(img.complete)return img.naturalWidth>0?resolve():reject(Error('Poster image failed to load'));
  img.addEventListener('load',()=>resolve(),{once:true});
  img.addEventListener('error',()=>reject(Error('Poster image failed to load')),{once:true});
 }));
 assert.ok(await samplePoster.evaluate(img=>img.naturalWidth>0),'A real cached poster must render on mobile');
 console.log('Live mobile browser verified '+visible.length+' website movie selections, '+cache.movies.length+' cached Bingo posters, and locked HQ artwork in Bingo. No private HQ access used.');
 await bingo.close();
}finally{await browser.close()}
