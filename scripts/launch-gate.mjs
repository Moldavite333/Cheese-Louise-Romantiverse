// Release-only gate for the public Cheese Louise homepage.
// Development may use placeholders; publishing must use the exact approved artwork.
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, join} from 'node:path';

const root=resolve(process.env.SITE_ROOT||'.');
const image=join(root,'assets/cheese-louise-approved-town-hero.webp');
const cssPath=join(root,'mountain-home.css');
const htmlPath=join(root,'index.html');
const expectedSha='809a00392ce05bbd0f2498707d2dbccc50e8b70f29c6418df26144924e5fa433';
const problems=[];

if(!existsSync(image)){
 problems.push('Approved mountain-town image missing: assets/cheese-louise-approved-town-hero.webp');
}else{
 const bytes=readFileSync(image);
 const digest=createHash('sha256').update(bytes).digest('hex');
 if(digest!==expectedSha)problems.push('Town image does not match the exact approved artwork (SHA-256 mismatch)');
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.toString('ascii',12,16)!=='VP8 '){
  problems.push('Approved town image must be the original WebP/VP8 asset');
 }else{
  const width=bytes.readUInt16LE(26)&0x3fff;
  const height=bytes.readUInt16LE(28)&0x3fff;
  if(width!==1223||height!==426)problems.push(`Unexpected approved image dimensions: ${width}x${height}`);
 }
}

if(!existsSync(cssPath))problems.push('Missing mountain-home.css');
else{
 const css=readFileSync(cssPath,'utf8');
 if(!css.includes('assets/cheese-louise-approved-town-hero.webp'))problems.push('Homepage CSS does not reference the approved town image');
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
