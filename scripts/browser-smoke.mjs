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
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  const hero=page.locator('#hero-title');
  assert.ok(await hero.isVisible(),'Marquee hidden at '+width+'px');
  const rect=await hero.boundingBox();
  assert.ok(rect&&rect.width>100&&rect.height>40,'Marquee has no usable dimensions at '+width+'px');
  const heroArt=await page.locator('.hero-backdrop').evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.match(heroArt,/alpine-village\.svg/,'Hero must use clean scenery rather than baked-in map artwork');
  const dimensions=await page.evaluate(()=>({
   documentWidth:document.documentElement.scrollWidth,
   viewportWidth:document.documentElement.clientWidth,
   heroScroll:document.querySelector('.hero').scrollWidth,
   heroClient:document.querySelector('.hero').clientWidth
  }));
  assert.ok(dimensions.documentWidth<=dimensions.viewportWidth+2,'Horizontal document overflow at '+width+'px: '+JSON.stringify(dimensions));
  assert.ok(dimensions.heroScroll<=dimensions.heroClient+2,'Legacy oversized swipe map remains at '+width+'px');
  assert.ok(await page.locator('.homepage-tile').count()===4,'Expected four feature tiles');
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
