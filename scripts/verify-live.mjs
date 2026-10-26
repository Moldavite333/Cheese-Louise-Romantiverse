// Verify the real public domain, current HTML/script bytes and anonymous HQ
// artwork endpoint. No private HQ queries or service-role credentials.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const domain='https://cheeselouisepod.com/';
const rpc='https://wgvsnmukiaobcbyqhkkt.supabase.co/rest/v1/rpc/published_movie_posters';
const key='sb_publishable_3xcqfNu-mJPuDWivmlBXug_3Tw60QoM';
const cache='https://wgvsnmukiaobcbyqhkkt.supabase.co/functions/v1/bingo-public-posters';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function readUrl(url,headers={}){
 const response=await fetch(url,{headers,cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error(url+': HTTP '+response.status);
 return Buffer.from(await response.arrayBuffer());
}
const expected=new Map(await Promise.all(['index.html','published-posters.js'].map(async path=>[path,digest(await readFile(path))])));
let last='';
for(let attempt=1;attempt<=15;attempt++){
 try{
  for(const [path,hash] of expected){
   const bytes=await readUrl(domain+(path==='index.html'?'':path));
   if(digest(bytes)!==hash)throw Error('Live '+path+' does not match current main');
  }
  const rows=JSON.parse((await readUrl(rpc,{apikey:key,Accept:'application/json'})).toString('utf8'));
  if(!Array.isArray(rows))throw Error('Public poster RPC did not return an array');
  for(const row of rows){
   const fields=Object.keys(row).sort();
   const allowed=['poster_locked','poster_url','published_at','release_year','season','title'].sort();
   if(JSON.stringify(fields)!==JSON.stringify(allowed))throw Error('Public poster RPC returned unexpected fields');
   if(typeof row.title!=='string'||typeof row.poster_locked!=='boolean')throw Error('Invalid public poster row');
  }
  const publicCache=JSON.parse((await readUrl(cache)).toString('utf8'));
  if(publicCache.version!==1||!Array.isArray(publicCache.movies)||publicCache.movies.length<38)throw Error('Public Bingo poster cache has fewer than 38 verified images');
  for(const movie of publicCache.movies){
   const fields=Object.keys(movie).sort();
   const allowed=['title','release_year','season','poster_url','poster_source','match_score'].sort();
   if(JSON.stringify(fields)!==JSON.stringify(allowed))throw Error('Public cache contains unexpected fields');
   if(!/^https:\/\/image\.tmdb\.org\/t\/p\/(?:w\d+|original)\/[A-Za-z0-9_.-]+$/.test(movie.poster_url))throw Error('Public cache has unapproved poster URL');
  }
  console.log('Verified custom-domain HTML and poster script match main; '+rows.length+' published HQ titles and '+publicCache.movies.length+' verified public Bingo posters, without private fields.');
  process.exit(0);
 }catch(error){last=String(error?.message||error);if(attempt<15)await wait(12000)}
}
throw Error('Live website or public poster feed not verified after retries: '+last);
