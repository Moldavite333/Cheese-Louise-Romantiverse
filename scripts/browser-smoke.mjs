import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';

const root=process.cwd();
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+'/')&&file!==root+'/index.html')throw Error('Invalid path');
  const bytes=await readFile(file);
  res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'});
  res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
mkdirSync('artifacts',{recursive:true});
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.route(/^https:\/\/fonts\./,route=>route.abort());
  // The public HQ RPC is mocked to prove published posters render without
  // exposing private fields or requiring credentials in browser QA.
  await page.route('**/rest/v1/rpc/published_movie_posters',route=>route.fulfill({
   status:200,contentType:'application/json',
   body:JSON.stringify([{title:'HQ Test Movie',release_year:2026,season:'Fall',
    poster_url:'https://image.tmdb.org/t/p/w500/test.jpg',poster_locked:true,
    published_at:'2026-10-26T10:00:00Z',notes:'PRIVATE HQ NOTES MUST NEVER RENDER'}])
  }));
  await page.route('https://image.tmdb.org/**',route=>route.fulfill({
   status:200,contentType:'image/png',
   body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64')
  }));
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  const hero=page.locator('#hero-title');
  assert.equal(await hero.count(),1,'Accessible marquee heading missing');
  const hiddenHeading=await page.locator('.hero-copy').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),clip:getComputedStyle(el).clip,overflow:getComputedStyle(el).overflow}));
  assert.ok(hiddenHeading.rect.width<=2&&hiddenHeading.rect.height<=2&&hiddenHeading.overflow==='hidden'&&hiddenHeading.clip!=='auto','Baked-in marquee must not be visually duplicated at '+width+'px');
  const heroArt=await page.locator('.hero-backdrop').evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.match(heroArt,/file_000000002040823089deaccfc427b599\.png/,'Hero must use approved mountain-town artwork');
  const dimensions=await page.evaluate(()=>({
   documentWidth:document.documentElement.scrollWidth,
   viewportWidth:document.documentElement.clientWidth,
   heroScroll:document.querySelector('.hero').scrollWidth,
   heroClient:document.querySelector('.hero').clientWidth
  }));
  assert.ok(dimensions.documentWidth<=dimensions.viewportWidth+2,'Horizontal document overflow at '+width+'px: '+JSON.stringify(dimensions));
  assert.ok(dimensions.heroScroll<=dimensions.heroClient+2,'Legacy oversized swipe map remains at '+width+'px');
  assert.ok(await page.locator('.homepage-tile').count()===4,'Expected four feature tiles');
  await page.locator('[data-published-posters] strong').waitFor();
  assert.equal(await page.locator('[data-published-posters] strong').first().textContent(),'HQ Test Movie','Published HQ title missing');
  assert.equal(await page.locator('[data-published-posters] img[alt="Poster for HQ Test Movie"]').count(),1,'Published HQ poster missing');
  assert.ok(!(await page.locator('[data-published-posters]').innerText()).includes('PRIVATE HQ NOTES'),'Private HQ data leaked to public page');
  // The homepage must deep-link directly into a new independently dealt card
  // for this published HQ movie; each click must mint a fresh secure invitation.
  const inviteLink=page.locator('[data-published-posters] a').first();
  const firstHref=await inviteLink.getAttribute('href');
  assert.ok(firstHref.startsWith('https://moldavite333.github.io/Romantiverse-Bingo-App/#invite='),'Published movie must deep-link into Bingo');
  const decode=href=>JSON.parse(Buffer.from(new URL(href).hash.slice('#invite='.length),'base64url').toString('utf8'));
  const payload=decode(firstHref);
  assert.equal(payload.v,3);
  assert.match(payload.invite_id,/^[a-f0-9]{32}$/);
  assert.deepEqual(payload.movie,{title:'HQ Test Movie',season:'Fall'});
  assert.equal(payload.mode,'classic');
  assert.equal(payload.free,true);
  assert.ok(!JSON.stringify(payload).includes('PRIVATE HQ NOTES'),'Private HQ fields must never enter invitation links');
  await inviteLink.evaluate(el=>el.addEventListener('click',event=>event.preventDefault()));
  await inviteLink.click();
  const secondHref=await inviteLink.getAttribute('href');
  assert.notEqual(secondHref,firstHref,'Each click must generate a unique invitation URL');
  assert.deepEqual(decode(secondHref).movie,payload.movie,'Fresh invitation must preserve the selected movie');

  await page.locator('.tile-art img').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const art=[...document.querySelectorAll('.tile-art img')];
    return art.length===4&&art.every(img=>img.complete&&img.naturalWidth>0);
  });
  assert.equal(await page.locator('.tile-art img[alt=""]').count(),4,'All decorative art must have empty alt text');
  if(width===390){
   const menu=page.locator('[data-menu-button]');
   assert.ok(await menu.isVisible(),'Mobile menu button hidden');
   await menu.click();
   assert.equal(await menu.getAttribute('aria-expanded'),'true');
   assert.ok(await page.locator('.main-nav a[href="#music"]').isVisible(),'Music link hidden in open menu');
   const color=await page.locator('.main-nav a[href="#music"]').evaluate(el=>getComputedStyle(el).color);
   assert.equal(color,'rgb(255, 247, 233)','Mobile menu link must contrast with dark panel');
   await page.keyboard.press('Escape');
   assert.equal(await menu.getAttribute('aria-expanded'),'false','Escape must close mobile menu');
  }
  assert.deepEqual(errors,[],'Page errors or missing local assets at '+width+'px');
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'artifacts/homepage-'+width+'.png',fullPage:true});
  console.log('Browser smoke passed at '+width+'px; screenshot captured.');
  await page.close();
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
