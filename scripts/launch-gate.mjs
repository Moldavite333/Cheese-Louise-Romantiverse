import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const image=readFileSync('assets/mountain-town.webp'),html=readFileSync('index.html','utf8');
const expected="a6951825a941d8237f26fceb18ed58e7077360af4c9e0c5f6f6448f75082c960";
if(expected)assert.equal(createHash('sha256').update(image).digest('hex'),expected);
assert.match(html,/src="assets\/mountain-town.webp"/);assert.match(html,/One Trope at a Time/);
assert.equal((html.match(/class="homepage-tile"/g)||[]).length,4);
console.log('Approved hero, four destinations, and current tagline verified.');
