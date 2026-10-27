// Release-only gate for the public Cheese Louise homepage.
// Development may use placeholders; publishing must use the exact approved artwork.
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, join} from 'node:path';

const root=resolve(process.env.SITE_ROOT||'.');
const image=join(root,'assets/file_000000002040823089deaccfc427b599.png');
const cssPath=join(root,'mountain-home.css');
const htmlPath=join(root,'index.html');
const expectedSha='14c326a6f8ffb007b19b84a0bd1e24322523bceb0e3b26609b31882fc7372d11';
const problems=[];

if(!existsSync(image)){
 problems.push('Approved mountain-town image missing: assets/file_000000002040823089deaccfc427b599.png');
}else{
 const bytes=readFileSync(image);
 const digest=createHash('sha256').update(bytes).digest('hex');
 if(digest!==expectedSha)problems.push('Town image does not match the exact approved artwork (SHA-256 mismatch)');
 if(bytes.toString('hex',0,8)!=='89504e470d0a1a0a'){
  problems.push('Approved town image must be a PNG');
 }else{
  const width=bytes.readUInt32BE(16);
  const height=bytes.readUInt32BE(20);
  if(width!==1672||height!==941)problems.push(`Unexpected approved image dimensions: ${width}x${height}`);
 }
}

if(!existsSync(cssPath))problems.push('Missing mountain-home.css');
else{
 const css=readFileSync(cssPath,'utf8');
 if(!css.includes('assets/file_000000002040823089deaccfc427b599.png'))problems.push('Homepage CSS does not reference the approved town image');
 if(css.includes('url("assets/alpine-village.svg")'))problems.push('Temporary alpine-village illustration still appears in homepage CSS');
}

if(!existsSync(htmlPath))problems.push('Missing public index.html');
else{
 const html=readFileSync(htmlPath,'utf8');
 if(!/<h1\b[^>]*id="hero-title"[^>]*>Unlocking the Mysteries of the Romantiverse<br\s*\/?\s*>One Rule at a Time<\/h1>/i.test(html))problems.push('Accessible approved hero heading missing or changed');
 if((html.match(/class="homepage-tile\b/g)||[]).length!==4)problems.push('Expected four homepage feature cards');
 if(!html.includes('Because life is better with a little cheese.'))problems.push('Approved footer tagline missing');
 if(!html.includes('https://moldavite333.github.io/Romantiverse-Bingo-App/'))problems.push('Standalone Bingo link missing');
}

if(problems.length){
 console.error('PUBLIC WEBSITE NOT LAUNCH READY:\n'+problems.map(p=>' - '+p).join('\n'));
 process.exitCode=1;
}else{
 console.log('Approved image, public branding and homepage structure verified. Browser/real-device QA is still required before launch.');
}
