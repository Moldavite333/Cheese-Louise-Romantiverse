// Real-browser end-to-end check against both deployed public sites and the
// actual anonymous HQ poster feed. No private credentials or test mutations.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const rpc='https://wgvsnmukiaobcbyqhkkt.supabase.co/rest/v1/rpc/published_movie_posters';
const key='sb_publishable_3xcqfNu-mJPuDWivmlBXug_3Tw60QoM';
const response=await fetch(rpc,{headers:{apikey:key,Accept:'application/json'},signal:AbortSignal.timeout(15000)});
assert.equal(response.ok,true,'Anonymous HQ poster endpoint must respond successfully');
const movies=await response.json();
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
  const source=movies.find(m=>m.title===item.title);
  assert.ok(source,'Website displayed a title not published in HQ');
  if(source.poster_url)assert.equal(item.poster,source.poster_url,'Website poster differs from current HQ selection');
 }
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
 console.log('Live mobile browser verified '+visible.length+' website movie selections against HQ and a locked HQ poster in Bingo for a published movie. No private HQ access used.');
 await bingo.close();
}finally{await browser.close()}
