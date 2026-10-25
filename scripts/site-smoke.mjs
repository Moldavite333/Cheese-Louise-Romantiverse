import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const html=readFileSync('index.html','utf8');
const css=readFileSync('mountain-home.css','utf8');
const js=readFileSync('app.js','utf8');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
const links=[...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map(match=>match[1]);

for(const link of links){
 if(link.startsWith('#')){
  assert.ok(ids.has(decodeURIComponent(link.slice(1))), 'Missing anchor target: '+link);
 }else if(!/^(?:https?:|mailto:|tel:|data:)/i.test(link)){
  const pathname=link.split(/[?#]/)[0];
  assert.ok(existsSync(resolve(pathname)), 'Missing local resource: '+link);
 }
}
assert.match(html,/<main\s+id="home">/, 'Main landmark required');
assert.match(html,/class="skip-link" href="#features"/, 'Skip link required');
assert.match(html,/id="hero-title"/, 'Accessible marquee heading required');
assert.match(html,/id="music"/, 'Music section anchor required');
assert.ok(!html.includes('href="#about">Explore the Music'), 'Do not link music card to unrelated About section');
assert.match(html,/Illustrative preview, not a published episode/, 'Sample episode must be clearly labeled');
assert.match(css,/\.hero-copy h1\s*\{\s*display:block!important/, 'Override legacy hidden marquee');
assert.match(css,/\.hero-backdrop\s*\{\s*display:block!important/, 'Override legacy hidden backdrop');
assert.match(css,/\.site-header \.main-nav a\s*\{\s*color:#fff7e9/, 'Mobile menu links must contrast with dark menu');
assert.match(css,/prefers-reduced-motion:reduce/, 'Respect reduced-motion preferences');
assert.match(js,/event\.key === 'Escape'/, 'Mobile navigation must support Escape');
assert.ok(!html.includes('Cheese Louise HQ'), 'Do not expose private HQ references in public markup');
console.log('Public site static smoke checks passed: '+links.length+' resources/links, '+ids.size+' anchor targets.');
