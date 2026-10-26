// Verify that GitHub Pages actually serves the isolated public mobile preview.
// Do not treat a successful build alone as proof that a URL is reachable.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';

const base='https://moldavite333.github.io/Cheese-Louise-Romantiverse/preview/';
const expectedImageHash='14c326a6f8ffb007b19b84a0bd1e24322523bceb0e3b26609b31882fc7372d11';
const files=['','mountain-home.css','styles.css','cinematic-theme.css','app.js','cheese-tray.js','assets/file_000000002040823089deaccfc427b599.png','assets/podcast-art.svg','assets/music-art.svg','assets/bingo-art.svg','assets/drink-art.svg'];

async function check(){
 const responses=await Promise.all(files.map(async path=>{
  const url=new URL(path,base).href;
  const res=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  assert.equal(res.status,200, 'HTTP '+res.status+' for '+url);
  assert.ok(res.url.startsWith(base),'Unexpected preview redirect: '+res.url);
  return [path,Buffer.from(await res.arrayBuffer())];
 }));
 const data=new Map(responses);
 const html=data.get('').toString('utf8');
 const css=data.get('mountain-home.css').toString('utf8');
 assert.match(html,/<meta name="robots" content="noindex,nofollow"/,'Preview must be excluded from search indexing');
 assert.match(html,/Unlocking the Mysteries of the Romantiverse/,'Approved headline missing');
 assert.match(html,/One Trope at a Time/,'Approved trope tagline missing');
 assert.equal(html.split('class="homepage-tile').length-1,4,'Expected four public feature cards');
 assert.ok(css.includes('file_000000002040823089deaccfc427b599.png'),'Approved artwork not used in preview CSS');
 assert.ok(!css.includes('url("assets/alpine-village.svg")'),'Placeholder artwork still used');
 assert.ok(data.get('app.js').toString('utf8').includes("event.key === 'Escape'"),'Mobile menu keyboard behavior missing');
 const imageHash=createHash('sha256').update(data.get('assets/file_000000002040823089deaccfc427b599.png')).digest('hex');
 assert.equal(imageHash,expectedImageHash,'Published artwork differs from the approved original');
 return files.length;
}
let lastError;
for(let attempt=1;attempt<=18;attempt++){
 try{const count=await check();console.log('LIVE PREVIEW VERIFIED: '+base+' ('+count+' HTTP 200 assets, exact approved artwork, noindex, navigation and cards)');process.exit(0)}
 catch(e){lastError=e;console.log('Preview not yet verified ('+attempt+'/18): '+e.message);if(attempt<18)await sleep(15000)}
}
console.error('LIVE PREVIEW FAILED: '+lastError?.message);
process.exitCode=1;
