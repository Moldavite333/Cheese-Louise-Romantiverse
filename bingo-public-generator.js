// Public Movie + Season Bingo generator for Cheese Louise.

(() => {
  const UNIVERSAL = [
    ['small-town','Perfect little small town'],['hometown-return','Returns to hometown'],['big-city-job','Big-city job mentioned'],
    ['city-vs-home','City life vs. hometown life'],['family-business','Family business'],['save-business','Family business needs saving'],
    ['inn-bnb','Inn, lodge, or B&B'],['main-street','Quaint Main Street'],['old-flame','Old flame reappears'],
    ['childhood-sweetheart','Childhood sweetheart'],['rivals-to-lovers','Rivals-to-lovers chemistry'],['friends-to-lovers','Friends-to-lovers energy'],
    ['competitive-flirting','Competitive flirting'],['forced-together','Forced to work together'],['town-matchmaking','Town is clearly matchmaking'],
    ['family-matchmaking','Family is clearly matchmaking'],['almost-kiss','Almost kiss'],['interrupted-kiss','Interrupted kiss'],
    ['misunderstanding','One-sentence misunderstanding'],['career-or-love','Career-or-love decision'],['grand-gesture','Grand romantic gesture'],
    ['community-saves-day','Community saves the day'],['family-legacy','Family legacy speech'],['town-knows','Whole town knows before they do'],
    ['wholesome-work','Wholesome work montage'],['empty-coffee-cup','Coffee cup is clearly empty'],['dog','Adorable dog gets screen time'],
    ['friendly-competition','Friendly competition'],['deadline','Ridiculous last-minute deadline'],['workplace-rivals','Workplace rivals with suspicious chemistry'],
    ['single-parent','Single parent with adorable child'],['meddling-relative','Meddling relative helps the romance'],['local-expert','Conveniently helpful local expert'],
    ['festival-crisis','Community event suddenly has a crisis'],['shared-task','They must complete a wholesome task together'],['obvious-ex','Clearly doomed current boyfriend/girlfriend']
  ].map(([id,label])=>({id,label}));

  const SEASONS = {
    Fall: [
      ['pumpkins','Pumpkins everywhere'],['pumpkin-patch','Pumpkin patch'],['pumpkin-carving','Pumpkin carving'],['fall-festival','Fall festival'],
      ['hayride','Hayride'],['corn-maze','Corn maze'],['apple-picking','Apple picking'],['apple-cider','Apple cider'],
      ['cozy-drink','Cozy seasonal drink'],['plaid-flannel','Plaid or flannel'],['cozy-sweater','Cozy sweater'],['scenic-leaves','Gorgeous leaf shot'],
      ['fall-decor','Autumn décor overload'],['wreath','Fall wreath'],['bonfire-firepit','Bonfire or fire pit'],['barn','Barn or rustic setting'],
      ['farmers-market','Farmers market or craft booths'],['pie-contest','Pie, baking, or food contest'],['family-farm','Family farm or orchard'],['perfect-weather','Impossibly perfect fall weather']
    ],
    Winter: [
      ['snowfall','Perfectly timed snowfall'],['snowed-in','Snowed in together'],['hot-cocoa','Hot cocoa appears'],['ice-skating','Ice skating date'],
      ['tree-lighting','Tree-lighting ceremony'],['holiday-market','Holiday market'],['christmas-tree','Christmas tree farm or lot'],['sleigh-ride','Sleigh ride'],
      ['mistletoe','Mistletoe appears'],['ornament','Sentimental ornament'],['caroling','Carolers or singing'],['snowball-fight','Snowball fight'],
      ['winter-lodge','Cozy winter lodge'],['holiday-baking','Holiday baking montage'],['gift-exchange','Meaningful gift exchange'],['travel-delay','Weather ruins travel plans'],
      ['fireplace','Conversation by a fireplace'],['winter-coat','Absurdly fashionable winter coat'],['holiday-decor','Holiday décor everywhere'],['new-year-kiss','Midnight or New Year kiss']
    ],
    Spring: [
      ['flowers','Flowers everywhere'],['garden','Garden scene'],['spring-festival','Spring festival'],['flower-shop','Flower shop'],
      ['rainstorm','Romantic rainstorm'],['umbrella','Shared umbrella'],['farmers-market-spring','Spring farmers market'],['picnic','Picnic date'],
      ['blossoms','Blossoming trees'],['easter-event','Easter or spring community event'],['spring-cleaning','Wholesome cleanup project'],['wedding-season','Wedding season problem'],
      ['outdoor-cafe','Outdoor café scene'],['garden-party','Garden party'],['new-beginnings','Speech about new beginnings'],['baby-animals','Baby animals appear'],
      ['pastel-overload','Pastel décor overload'],['flower-festival','Flower festival'],['rain-kiss','Rain almost-kiss or kiss'],['spring-trip','Scenic spring getaway']
    ],
    Summer: [
      ['beach','Beach scene'],['lake-house','Lake house'],['boardwalk','Boardwalk date'],['summer-festival','Summer festival'],
      ['county-fair','County fair'],['boat-ride','Boat ride'],['barbecue','Barbecue or cookout'],['ice-cream','Ice cream date'],
      ['sunset','Suspiciously perfect sunset'],['summer-camp','Summer camp'],['outdoor-concert','Outdoor concert'],['fireworks','Fireworks'],
      ['farmers-market-summer','Summer farmers market'],['vacation-town','Vacation town'],['swimsuit-scene','Very wholesome swimsuit scene'],['road-trip','Road trip'],
      ['patio-dinner','Patio dinner'],['waterfront','Waterfront conversation'],['summer-job','Seasonal summer job'],['heat-wave','Nobody appears sweaty despite the heat']
    ]
  };
  Object.keys(SEASONS).forEach(k => SEASONS[k] = SEASONS[k].map(([id,label])=>({id,label})));

  const PROFILE = {
    'love fall & order': {
      required:['fall-festival','forced-together','deadline','workplace-rivals','small-town'],
      weighted:['hometown-return','family-business','misunderstanding','grand-gesture','scenic-leaves','pumpkins']
    }
  };

  function slug(s){ return String(s||'movie').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'movie'; }
  function unique(items){ const seen=new Set(); return items.filter(x=>x?.id && !seen.has(x.id) && seen.add(x.id)); }

  function inferProfile(title){
    const key=String(title||'').trim().toLowerCase();
    const exact=PROFILE[key];
    const required=[...(exact?.required||[])], weighted=[...(exact?.weighted||[])];
    const t=key;
    const add=(id,where=weighted)=>{ if(!where.includes(id)) where.push(id); };
    if(/christmas|holiday|mistletoe/.test(t)){ add('tree-lighting',required); add('hot-cocoa'); add('holiday-market'); }
    if(/wedding|bride|groom/.test(t)){ add('wedding-season',required); add('grand-gesture'); }
    if(/royal|prince|princess/.test(t)){ add('local-expert',required); add('obvious-ex'); }
    if(/bakery|bake|cookie|pie/.test(t)){ add('family-business',required); add('save-business'); add('pie-contest'); }
    if(/farm|ranch|orchard/.test(t)){ add('family-farm',required); add('small-town'); }
    if(/fall|autumn|pumpkin/.test(t)){ add('fall-festival',required); add('pumpkins'); add('scenic-leaves'); }
    if(/summer|beach|lake/.test(t)){ add('beach',required); add('sunset'); add('summer-festival'); }
    if(/winter|snow/.test(t)){ add('snowfall',required); add('snowed-in'); add('fireplace'); }
    if(/spring|flower|garden/.test(t)){ add('flowers',required); add('spring-festival'); add('garden'); }
    return {required,weighted};
  }

  function buildConfig(movie,season,holiday=''){
    const profile=inferProfile(movie);
    const seasonPool=SEASONS[season]||[];
    const pool=unique([...seasonPool,...UNIVERSAL]);
    return {
      id:`public-${slug(movie)}-${slug(season)}`,
      movie: movie || `${season} Romantiverse Bingo`,
      network:'Cheese Louise',
      season,
      holiday: holiday || season,
      subtitle:`${movie || season} in the Romantiverse`,
      description:`A randomized Cheese Louise Bingo card built for ${movie || 'this movie'} using ${season.toLowerCase()} tropes plus universal Romantiverse cheese.`,
      freeSpace:'CHEESE LOUISE!',
      required: profile.required.filter(id=>pool.some(x=>x.id===id)).slice(0,8),
      weighted: profile.weighted.filter(id=>pool.some(x=>x.id===id)),
      minTraitChanges:8,
      pool
    };
  }

  function activate(){
    const movie=document.querySelector('[data-generator-movie]')?.value.trim() || 'Fall Romantiverse Bingo';
    const season=document.querySelector('[data-generator-season]')?.value || 'Fall';
    const holiday=document.querySelector('[data-generator-holiday]')?.value.trim() || '';
    const next=buildConfig(movie,season,holiday);
    if(window.CHEESE_BINGO_SET_CONFIG?.(next) !== false){
      localStorage.setItem('cheese-louise:bingo-generator:last',JSON.stringify({movie,season,holiday}));
    }
  }

  window.addEventListener('DOMContentLoaded',()=>{
    const saved=(()=>{try{return JSON.parse(localStorage.getItem('cheese-louise:bingo-generator:last'))}catch{return null}})();
    if(saved){
      const m=document.querySelector('[data-generator-movie]'); const s=document.querySelector('[data-generator-season]'); const h=document.querySelector('[data-generator-holiday]');
      if(m) m.value=saved.movie||''; if(s&&saved.season) s.value=saved.season; if(h) h.value=saved.holiday||'';
    }
    document.querySelector('[data-generate-movie-season]')?.addEventListener('click',activate);
  });
})();
