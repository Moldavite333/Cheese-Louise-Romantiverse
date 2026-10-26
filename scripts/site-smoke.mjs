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
assert.match(html,/<meta property="og:title" content="Cheese Louise — Visit the Romantiverse"/, 'Social sharing title required');
assert.match(html,/<meta property="og:description"[^>]+Podcast episodes coming soon/, 'Social sharing description must not imply episodes are published');
assert.match(html,/<meta name="twitter:card" content="summary"/, 'Social preview card required');
assert.match(html,/<a href="#support">Support<\/a>/, 'Support navigation must describe its actual destination');
assert.ok(!html.includes('<a href="#support">Contact</a>'), 'Do not mislabel the support section as contact');
assert.ok(!html.includes('map-overrides.css'), 'Old map hotspot stylesheet must not hide or duplicate the hero');
assert.ok(!css.includes('background:url("romantiverse-town.jpg")'), 'Baked-in text must not appear behind live marquee');
assert.match(css,/assets\/file_000000002040823089deaccfc427b599\.png/,'Approved mountain town required');
assert.ok(existsSync('assets/file_000000002040823089deaccfc427b599.png'),'Approved mountain-town image must be present');
assert.match(html,/id="music"/, 'Music section anchor required');
for (const art of ['podcast','music','bingo','drink']) {
 assert.match(html,new RegExp('src="assets/'+art+'-art\\.svg" alt="" loading="lazy"'),art+' card needs original decorative illustration');
 const svg=readFileSync('assets/'+art+'-art.svg','utf8');
 assert.match(svg,/<svg[^>]+viewBox="0 0 640 420"/,'Illustration must be scalable');
 assert.ok(!/<script|onload=|<foreignObject/i.test(svg),'No executable content in card art');
}
assert.ok(!html.includes('href="#about">Explore the Music'), 'Do not link music card to unrelated About section');
assert.match(html,/Illustrative preview, not a published episode/, 'Sample episode must be clearly labeled');
assert.match(html,/class="tile-action-placeholder"[^>]*>Listen Now · Coming Soon<\/span>/, 'Unpublished podcast audio must not have a live Listen Now link');
assert.ok(!html.includes('selected trope pool for this week'), 'Do not claim unpublished HQ movie selections are synchronized');
assert.match(html,/Friends can join with a direct link and receive independent cards/, 'Explain current Bingo invitation behavior');
assert.match(html,/data-published-posters/, 'Public homepage must include the opt-in HQ poster section');
assert.match(html,/src="published-posters\\.js\\?v=20261026"/, 'Public poster refresh script must be loaded');
const posters=readFileSync('published-posters.js','utf8');
assert.match(posters,/\/rpc\/published_movie_posters/, 'Use restricted public RPC, never private HQ tables');
assert.ok(!/\/rest\/v1\/movies|service_role|source_metadata|workspace_id/.test(posters), 'Public script must not access private HQ data');
assert.match(posters,/setInterval\(refresh,300000\)/, 'Published posters must refresh automatically');

assert.ok(!/Rules of the Romantiverse|Cheese Traits/i.test(html), 'Retired public terminology must not return');
assert.ok(!html.includes('Rule of the Week') && !html.includes('When you’re a single dad'), 'Do not prepublish private podcast rules');
assert.ok(!html.includes('may get a shout-out'), 'Do not promise unapproved podcast shout-outs');
assert.match(html,/No unpublished episode material is shown here/, 'Explain public trope publication status');
assert.match(css,/\.hero-copy h1\s*\{\s*display:block!important/, 'Override legacy hidden marquee');
assert.match(css,/\.hero-backdrop\s*\{\s*display:block!important/, 'Override legacy hidden backdrop');
assert.match(css,/\.site-header \.main-nav a\s*\{\s*color:#fff7e9/, 'Mobile menu links must contrast with dark menu');
assert.match(css,/prefers-reduced-motion:reduce/, 'Respect reduced-motion preferences');
assert.match(js,/event\.key === 'Escape'/, 'Mobile navigation must support Escape');
console.log('Public site static smoke checks passed: '+links.length+' resources/links, '+ids.size+' anchor targets.');
