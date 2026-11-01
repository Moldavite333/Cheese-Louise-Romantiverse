import assert from 'node:assert/strict';import {createServer} from 'node:http';import {readFile,mkdir} from 'node:fs/promises';import {resolve,extname,sep} from 'node:path';import {chromium} from 'playwright';
const root=process.cwd(),server=createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+sep))throw Error('path');const body=await readFile(file);res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'}[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
await mkdir('artifacts',{recursive:true});
try{for(const width of [320,390,768,1440]){const page=await browser.newPage({viewport:{width,height:900}}),errors=[];let catalogUnavailable=false;page.on('pageerror',e=>errors.push(e.message));await page.route('**/rpc/published_movie_posters',r=>r.fulfill({json:[{title:'HQ Test Movie',release_year:2026,season:'Fall',poster_locked:true,poster_url:'https://image.tmdb.org/t/p/w500/hq.jpg',published_at:'2026-10-31T12:00:00Z',notes:'PRIVATE NOTES'},{title:'Café Noël',release_year:2024,season:'Fall',poster_locked:true,poster_url:'https://image.tmdb.org/t/p/w500/hq-cafe.jpg',published_at:'2026-10-30T12:00:00Z',notes:'PRIVATE CAFÉ NOTES'}]}));await page.route('**/functions/v1/bingo-public-posters',r=>catalogUnavailable?r.fulfill({status:503,body:'Temporarily unavailable'}):r.fulfill({json:{version:1,movies:[{title:'Christmas Test',release_year:2025,season:'Christmas',poster_url:null},{title:'Horror Test',release_year:2025,season:'Horror',poster_url:null},{title:'Cafe-Noel',release_year:2024,season:'Fall',poster_url:null},...Array.from({length:10},(_,i)=>({title:'Festival Movie '+String(i+1).padStart(2,'0'),release_year:2024,season:'Fall',poster_url:null}))]}}));await page.route('**/rpc/cheese_tray_top',r=>r.fulfill({json:[]}));await page.route('https://image.tmdb.org/**',r=>r.request().url().endsWith('/hq-cafe.jpg')?r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>'}):r.fulfill({status:404}));await page.route('**/catalog/movies.json',r=>r.fulfill({json:{version:1,movies:[
 {title:'Catalog Only Romance',release_year:2026,season:'Fall',network:'Lifetime',production_company:'MarVista Entertainment',verification_status:'metadata_verified',notes:'PRIVATE CATALOG NOTES',story_facts:{secret:'PRIVATE CATALOG STORY'}},
 {title:'Reel One Romance',release_year:2023,season:'Christmas',production_company:'Reel One Entertainment',verification_status:'metadata_verified'},
 {title:'Unverified Studio',release_year:2026,season:'Fall',production_company:'MarVista Entertainment',verification_status:'unverified'},
 {title:'Cafe Noel',release_year:2024,season:'Fall',network:'Hallmark Channel',verification_status:'metadata_verified'},
 {title:'Horror Catalog',release_year:2026,season:'Horror'},
 {title:'Demo Catalog',release_year:2026,season:'Fall',is_demo:true}
]}}));await page.goto(origin);await page.locator('[data-published-posters] strong').first().waitFor();
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(!(await page.locator('body').innerText()).includes('PRIVATE NOTES'));assert.ok(!(await page.locator('[data-published-posters]').innerText()).includes('Horror Test'));assert.ok((await page.locator('[data-published-posters]').innerText()).includes('Christmas Test'),'Movie without poster must remain playable');

// Refresh failures must keep the last usable catalog instead of dropping its titles.
catalogUnavailable=true;
await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
await page.locator('[data-movie-retry]').waitFor({state:'visible'});
assert.ok((await page.locator('[data-published-posters]').innerText()).includes('Christmas Test'),'A failed refresh must preserve the last successful feed');
catalogUnavailable=false;
await page.locator('[data-movie-retry]').click();
await page.locator('[data-movie-retry]').waitFor({state:'hidden'});
// Non-Latin search text must not normalize to an empty query and return all movies.
await page.locator('[data-published-movie-search]').fill('東京');
assert.match(await page.locator('[data-published-posters]').innerText(),/No Bingo movies/);
await page.locator('[data-published-movie-search]').fill('2026 movie HQ');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'HQ Test Movie','Out-of-order title/year search must work');
await page.locator('[data-published-movie-search]').fill('2024 noel cafe');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'Café Noël','Accents, punctuation, and reordered words must match');
assert.equal(await page.locator('[data-published-posters] strong').count(),1,'Accent and punctuation variants across HQ, poster cache, and catalog must not duplicate a movie');
assert.equal(await page.locator('[data-published-posters] img').first().getAttribute('src'),'https://image.tmdb.org/t/p/w500/hq-cafe.jpg','The exact-year HQ-locked poster must win over cached artwork');
assert.ok(!(await page.locator('body').innerText()).includes('PRIVATE CAFÉ NOTES'),'Private HQ notes must never appear');
await page.locator('[data-published-movie-search]').fill('2025 test christmas');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'Christmas Test','Year-first title search must work');
// Studio/network searches must work for both posterless and HQ-published titles,
// while rejecting unverified catalog production claims.
await page.locator('[data-published-movie-search]').fill('MarVista');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'Catalog Only Romance','Verified MarVista credits must be searchable');
assert.match(await page.locator('[data-published-posters]').innerText(),/MarVista Entertainment/,'Verified studio credit should be visible');
await page.locator('[data-published-movie-search]').fill('Lifetime');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'Catalog Only Romance','Verified Lifetime network must be searchable');
await page.locator('[data-published-movie-search]').fill('Reel One');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'Reel One Romance','Verified Reel One studio must be searchable');
await page.locator('[data-published-movie-search]').fill('Hallmark Channel');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'Café Noël','Verified network must enrich an HQ-locked poster without replacing it');
assert.equal(await page.locator('[data-published-posters] img').first().getAttribute('src'),'https://image.tmdb.org/t/p/w500/hq-cafe.jpg','Studio discovery must preserve HQ-locked poster precedence');
await page.locator('[data-published-movie-search]').fill('unverified studio');
assert.ok(!(await page.locator('[data-published-posters]').innerText()).includes('MarVista Entertainment'),'Unverified studio credits must not be displayed');
await page.locator('[data-published-movie-search]').fill('catalog only');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'Catalog Only Romance','A title missing from the poster cache must be searchable via the public Bingo catalog');
assert.match(await page.locator('[data-published-posters]').innerText(),/Bingo catalog/,'Missing artwork must not block movie discovery');
assert.ok(!(await page.locator('body').innerText()).includes('PRIVATE CATALOG'),'Catalog notes and story facts must never appear');
const catalogInvite=await page.locator('[data-published-posters] a').first().getAttribute('href');
assert.equal(JSON.parse(Buffer.from(new URL(catalogInvite).hash.slice(8),'base64url')).movie.title,'Catalog Only Romance','Catalog-only title must launch its own Bingo card');
assert.ok(!catalogInvite.includes('PRIVATE CATALOG'),'Catalog invitation must not leak extra fields');
await page.locator('[data-published-movie-search]').fill('demo catalog');
assert.match(await page.locator('[data-published-posters]').innerText(),/No Bingo movies/,'Demo titles must not enter public discovery');
await page.locator('[data-published-movie-search]').fill('horror catalog');
assert.match(await page.locator('[data-published-posters]').innerText(),/No Bingo movies/,'Horror titles must not enter romance discovery');
await page.locator('[data-published-movie-search]').fill('not in this catalog');
assert.match(await page.locator('[data-published-posters]').innerText(),/No Bingo movies/);
const noResultsLink=page.getByRole('link',{name:'Try this search in the full Bingo catalog'});
assert.equal(new URL(await noResultsLink.getAttribute('href')).searchParams.get('search'),'not in this catalog','No-results action must preserve the searched title');
assert.equal(await noResultsLink.isVisible(),true,'The full-catalog search action must be visible at the empty state');
await page.locator('[data-published-movie-search]').fill('2026 movie HQ');
assert.equal(await noResultsLink.count(),0,'The no-results action must disappear when matching movies return');
await page.locator('[data-published-movie-search]').fill('not in this catalog');
const fullCatalog=page.getByRole('link',{name:'Search the full Bingo catalog'});
assert.equal(new URL(await fullCatalog.getAttribute('href')).searchParams.get('search'),'not in this catalog','A missing movie title must carry into the full Bingo search');
await page.locator('[data-published-movie-search]').fill('A Christmas Village');
assert.equal(new URL(await fullCatalog.getAttribute('href')).searchParams.get('search'),'A Christmas Village','Search handoff must preserve exact movie title');
assert.ok(!(await fullCatalog.getAttribute('href')).includes('PRIVATE NOTES'),'No private HQ data may enter a public link');
await page.locator('[data-published-movie-search]').fill('');
assert.equal(await fullCatalog.getAttribute('href'),'https://bingo.cheeselouisepod.com/','Clearing search must restore the normal Bingo URL');
// Search should surface nine matches immediately instead of hiding all but
// three; the explicit expansion still exposes the complete matching catalog.
await page.locator('[data-published-movie-search]').fill('festival');
assert.equal(await page.locator('[data-published-posters] strong').count(),9,'Filtered searches show nine movies without an extra click');
const expandResults=page.locator('[data-published-movie-expand]');
assert.equal(await expandResults.textContent(),'Show all 10 matching movies');
await expandResults.click();
assert.equal(await page.locator('[data-published-posters] strong').count(),10,'Show all exposes every filtered match');
assert.equal(await expandResults.textContent(),'Show fewer matching movies','Filtered collapse label must not promise featured movies');
await expandResults.click();
assert.equal(await page.locator('[data-published-posters] strong').count(),9,'Collapse restores filtered limit');
await page.locator('[data-published-movie-search]').fill('');
assert.equal(await page.locator('[data-published-posters] strong').count(),3,'Clearing search restores three featured movies');
// A public search URL must survive reload and must never include private HQ fields.
await page.locator('[data-published-movie-search]').fill('Reel One');
assert.equal(new URL(page.url()).searchParams.get('search'),'Reel One','Search updates the shareable URL');
await page.reload();
await page.locator('[data-published-posters] strong',{hasText:'Reel One Romance'}).waitFor();
assert.equal(await page.locator('[data-published-movie-search]').inputValue(),'Reel One','Reload restores the public search');
assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'Reel One Romance');
assert.ok(!page.url().includes('PRIVATE'),'Shareable URL must not expose private metadata');
await page.locator('[data-published-movie-search]').fill('');
assert.equal(new URL(page.url()).searchParams.has('search'),false,'Clearing search removes the URL parameter');
const tile=page.locator('.homepage-tile').nth(2);
assert.ok(await tile.evaluate(el=>el.scrollWidth<=el.clientWidth),'Bingo label must fit inside its tile');
const href=await page.locator('[data-published-posters] a').first().getAttribute('href');assert.ok(href.startsWith('https://bingo.cheeselouisepod.com/#invite='));const payload=JSON.parse(Buffer.from(new URL(href).hash.slice(8),'base64url'));assert.equal(payload.movie.title,'HQ Test Movie');assert.equal(payload.v,3);assert.ok(!JSON.stringify(payload).includes('PRIVATE NOTES'));
await page.locator('[data-season="Christmas"]').click();
const christmasBrowse=await page.locator('[data-published-posters] strong').allTextContents();
assert.ok(christmasBrowse.includes('Christmas Test'),'Season browsing must retain cached poster selections');
assert.ok(christmasBrowse.includes('Reel One Romance'),'Season browsing must include posterless public Bingo catalog movies');
assert.ok(!christmasBrowse.includes('Demo Catalog')&&!christmasBrowse.includes('Horror Catalog'),'Season browsing must exclude demos and horror');
assert.equal(new URL(page.url()).searchParams.get('season'),'Christmas','Season selection must be shareable');
await page.reload();
await page.locator('[data-published-posters] strong').first().waitFor();
assert.equal(await page.locator('[data-season="Christmas"]').getAttribute('aria-pressed'),'true','Shared season must restore its selected control');
await page.locator('[data-published-posters] strong',{hasText:'Reel One Romance'}).waitFor();
assert.ok((await page.locator('[data-published-posters] strong').allTextContents()).includes('Reel One Romance'),'Shared season must restore posterless catalog movies');
await page.locator('[data-published-movie-search]').fill('no such movie');assert.match(await page.locator('[data-published-posters]').innerText(),/No Bingo movies/);await page.locator('[data-published-movie-search]').fill('');await page.locator('[data-season=""]').click();assert.equal(new URL(page.url()).searchParams.has('season'),false,'All Movies must remove season URL filter');
// One accessible action should clear both search and season, restore the featured
// selection, and remove only public filter parameters from the shareable URL.
await page.locator('[data-published-movie-search]').fill('catalog only');
await page.locator('[data-season="Fall"]').click();
const clearFilters=page.locator('[data-movie-clear-filters]');
assert.equal(await clearFilters.isVisible(),true,'Clear filters must be visible when filters are active');
assert.equal(new URL(page.url()).searchParams.get('search'),'catalog only');
assert.equal(new URL(page.url()).searchParams.get('season'),'Fall');
await clearFilters.click();
assert.equal(await page.locator('[data-published-movie-search]').inputValue(),'','Clearing filters resets search');
assert.equal(await page.locator('[data-season=""]').getAttribute('aria-pressed'),'true','Clearing filters restores All Movies');
assert.equal(new URL(page.url()).searchParams.has('search'),false,'Clearing filters removes search from URL');
assert.equal(new URL(page.url()).searchParams.has('season'),false,'Clearing filters removes season from URL');
assert.equal(await clearFilters.isHidden(),true,'Clear filters hides when no filters are active');
assert.equal(await page.locator('[data-published-posters] strong').count(),3,'Clearing filters restores featured movies');
assert.equal(await page.locator('[data-published-movie-search]').evaluate(el=>el===document.activeElement),true,'Keyboard focus returns to movie search');
await page.getByRole('link',{name:'Get the recipe',exact:true}).click();assert.ok(await page.locator('#mule-tide').getAttribute('open')!==null);
if(width===390){const menu=page.locator('[data-menu-button]');await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');await page.locator('#movie-title').click();assert.equal(await menu.getAttribute('aria-expanded'),'false','Outside tap closes mobile menu');await menu.click();await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false','Escape closes mobile menu');await menu.click();await page.locator('#main-nav a[href="#movies"]').click();assert.equal(await menu.getAttribute('aria-expanded'),'false','Movie navigation closes the mobile menu');assert.equal(new URL(page.url()).hash,'#movies','Mobile navigation reaches the movie search section')}
assert.equal(await page.locator('audio source').count(),2);
const audio=page.locator('audio').first();
const originalSource=await audio.locator('source').getAttribute('src');
await audio.evaluate(el=>{el.querySelector('source').src='/missing-test-audio.mp3';el.load()});
await page.getByRole('link',{name:'open the audio directly',exact:true}).waitFor();
await audio.evaluate((el,src)=>{el.querySelector('source').src=src;el.load()},originalSource);
await page.waitForFunction(()=>{const player=document.querySelector('audio');return Number.isFinite(player.duration)&&player.duration>0&&player.readyState>=2});
assert.equal(await page.getByRole('link',{name:'open the audio directly',exact:true}).count(),0,'Successful reload clears the stale audio error');
assert.deepEqual(errors,[]);await page.getByRole('link',{name:'Cheese Louise home',exact:true}).click();await page.screenshot({path:'artifacts/homepage-'+width+'.png',fullPage:true});for(const guide of ['hallmark-movie-bingo.html','romance-movie-podcast.html','romance-movie-tropes.html','404.html']){await page.goto(origin+'/'+guide);assert.equal(await page.locator('h1').count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Guide must fit '+width+'px: '+guide);assert.ok(await page.getByRole('link',{name:'Cheese Louise',exact:true}).isVisible());if(guide!=='404.html'){assert.equal(await page.locator('[aria-current="page"]').count(),1);assert.ok(await page.getByRole('link',{name:'Play Romantiverse Bingo',exact:true}).isVisible())}else{await page.getByRole('link',{name:'Back to Cheese Louise',exact:true}).click();assert.ok(await page.locator('#features').isVisible())}}assert.deepEqual(errors,[]);await page.close();console.log('Responsive controls, catalog filtering, missing artwork, and private data boundaries pass at '+width+'px')}}finally{await browser.close();await new Promise(r=>server.close(r))}
