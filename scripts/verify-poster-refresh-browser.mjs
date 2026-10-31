// Exercise both *deployed* public applications against controlled public RPC
// responses. This verifies refresh and lock precedence without modifying HQ.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const title='Sweet Autumn', year=2020;
const automatic='https://image.tmdb.org/t/p/w500/auto-test.jpg';
const hqA='https://image.tmdb.org/t/p/w500/hq-test-a.jpg';
const hqB='https://image.tmdb.org/t/p/w500/hq-test-b.jpg';
const hqC='https://image.tmdb.org/t/p/w500/hq-test-c.jpg';
const privateMarker='NEVER_SHOW_PRIVATE_HQ_NOTES';
let feed=[];
function published(poster,locked){
 return {title,release_year:year,season:'Fall',poster_url:poster,
  poster_locked:locked,published_at:'2026-10-26T00:00:00Z',
  notes:privateMarker,workspace_id:'private-workspace-id'};
}
feed=[published(hqA,false)];
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
const privateRequests=[];
const cors={
 'access-control-allow-origin':'*',
 'access-control-allow-methods':'GET, POST, OPTIONS',
 'access-control-allow-headers':'apikey, accept, content-type, authorization'
};
const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YfXcZ0AAAAASUVORK5CYII=','base64');
await context.route('https://image.tmdb.org/t/p/**',route=>route.fulfill({status:200,contentType:'image/png',body:image}));
await context.route('**/functions/v1/bingo-public-posters',route=>route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({version:1,movies:[{title,release_year:year,poster_url:automatic,poster_source:'tmdb'}]})}));
await context.route('**/rest/v1/rpc/published_movie_posters',route=>{
 if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:cors});
 return route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(feed)});
});
await context.route(/^https:\/\/yxpamyibhclilgdhgsjd\.supabase\.co\/rest\/v1\/movies\?/,route=>{
 if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:cors});
 return route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify([
  {id:'public-catalog-auto',title,release_year:year,season:'Fall',poster_url:automatic,
   is_demo:false,verification_status:'unverified',source_name:'Public catalog'}
 ])});
});
context.on('request',request=>{
 const url=new URL(request.url());
 if(url.hostname==='wgvsnmukiaobcbyqhkkt.supabase.co'&&
    /^\/rest\/v1\/(?:movies|workspaces|published_bingo_cards|movie_traits)(?:[/?]|$)/.test(url.pathname))
  privateRequests.push(url.pathname);
});
const site=await context.newPage(),bingo=await context.newPage();
async function websitePoster(expected){
 await site.waitForFunction(({title,expected})=>{
  const row=[...document.querySelectorAll('.published-poster-row')].find(x=>x.querySelector('strong')?.textContent===title);
  return !!row&&row.querySelector('img')?.src===expected;
 },{title,expected},{timeout:45000});
}
async function bingoPoster(expected){
 await bingo.waitForFunction(({title,expected})=>{
  const card=[...document.querySelectorAll('.movie-card')].find(x=>x.querySelector('h3')?.textContent===title);
  return !!card&&card.querySelector('img.movie-poster')?.src===expected;
 },{title,expected},{timeout:45000});
}
async function refresh(){
 await Promise.all([site,bingo].map(page=>page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')))));
}
try{
 await Promise.all([
  site.goto('https://cheeselouisepod.com/',{waitUntil:'domcontentloaded',timeout:30000}),
  bingo.goto('https://bingo.cheeselouisepod.com/',{waitUntil:'domcontentloaded',timeout:30000})
 ]);
 await site.locator('[data-published-movie-search]').fill(title);
 await websitePoster(automatic); // Automatic artwork wins over an unlocked HQ selection.
 await bingoPoster(automatic); // HQ is unlocked; automatic exact-year artwork wins.
 feed=[published(hqB,true)];
 await refresh();
 await websitePoster(hqB);
 await bingoPoster(hqB); // HQ lock overrides the automatic match.
 feed=[published(hqC,true)];
 await refresh();
 await websitePoster(hqC);
 await bingoPoster(hqC); // Subsequent HQ edit propagates without reload.
 feed=[published(hqC,false)];
 await refresh();
 await websitePoster(automatic);
 await bingoPoster(automatic); // Unlock restores automatic priority.
 feed=[];
 await refresh();
 await websitePoster(automatic); // Unpublishing removes HQ artwork without deleting the public catalog.
 await bingoPoster(automatic);
 for(const page of [site,bingo]){
  assert.ok(!(await page.locator('body').innerText()).includes(privateMarker),'Private HQ fields must not appear in the UI');
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  assert.ok(dimensions.scroll<=dimensions.width+2,'Mobile page must not overflow: '+JSON.stringify(dimensions));
 }
 assert.deepEqual(privateRequests,[],'No public browser may query private HQ tables');
 console.log('PASS: live website and Bingo respond to mock public HQ poster changes, lock/unlock, unpublish, automatic-artwork priority and mobile privacy without changing HQ.');
}finally{
 await context.close();
 await browser.close();
}
