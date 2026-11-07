import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const image=readFileSync('assets/mountain-town.webp'),html=readFileSync('index.html','utf8');
const expected="406ba68d7f9013800391e6f4d794dddf2843c9eddd42f84a9b46e2be4db2b078";
if(expected)assert.equal(createHash('sha256').update(image).digest('hex'),expected);
assert.match(html,/src="assets\/mountain-town.webp"/);assert.match(html,/One Trope at a Time/);
assert.equal((html.match(/class="homepage-tile"/g)||[]).length,5);
console.log('Approved hero, five destinations, and current tagline verified.');
