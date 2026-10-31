import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const html=readFileSync('index.html','utf8'),css=readFileSync('homepage.css','utf8'),posters=readFileSync('published-posters.js','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate IDs break navigation');
for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){const value=m[1];if(value.startsWith('#'))assert.ok(ids.includes(value.slice(1)),'Missing anchor '+value);else if(!/^(https?:|mailto:|data:)/.test(value))assert.ok(existsSync(resolve(value.split(/[?#]/)[0])),'Missing asset '+value)}
assert.ok(!html.includes('moldavite333.github.io'),'Public links must use branded domains');
assert.ok(!/One Rule at a Time|Cheese Rating/i.test(html),'Retired terminology');
assert.match(html,/Brought to you by the/);assert.match(html,/Cheese Louise Podcast/);
assert.match(html,/rel="canonical" href="https:\/\/cheeselouisepod.com\//);
assert.match(css,/prefers-reduced-motion/);
assert.ok(!/service_role|\/rest\/v1\/movies|workspace_id/.test(posters),'Public code must not access private HQ records');
assert.match(posters,/textContent/);
assert.match(posters,/poster_locked/);
assert.match(posters,/getRandomValues/);
assert.equal((html.match(/<audio /g)||[]).length,1);
for(const m of css.matchAll(/url\("([^"]+)"\)/g))assert.ok(existsSync(m[1]),'Missing CSS artwork '+m[1]);
console.log('Navigation, local assets, branded links, public data boundaries, and audio sources verified.');
