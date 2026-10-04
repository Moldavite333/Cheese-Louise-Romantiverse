(() => {
  const C = { cream:'#f4ead1', green:'#173f36', red:'#c43e46', pink:'#e96b78', gold:'#d4a52e' };

  function hash(text){
    let h = 2166136261;
    for (const ch of String(text || '')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seed(name, category=''){ return hash(`${name}|${category}`).toString(36).toUpperCase().slice(0,8); }
  function sparkles(s){
    const h = hash(s);
    const pts = [[18+(h%11),19+((h>>3)%10)],[104-((h>>5)%13),22+((h>>9)%11)],[20+((h>>13)%9),103-((h>>17)%11)],[104-((h>>20)%12),104-((h>>24)%10)]];
    return pts.map(([x,y],i)=>i%2
      ? `<circle cx="${x}" cy="${y}" r="2.2" fill="${C.gold}" opacity=".75"/>`
      : `<path d="M${x} ${y-4}v8M${x-4} ${y}h8" stroke="${C.gold}" stroke-width="2" stroke-linecap="round" opacity=".75"/>`
    ).join('');
  }
  function heart(x=64,y=62,s=1,color=C.red){
    return `<path d="M${x} ${y+12*s}C${x-22*s} ${y-2*s},${x-18*s} ${y-20*s},${x} ${y-10*s}C${x+18*s} ${y-20*s},${x+22*s} ${y-2*s},${x} ${y+12*s}Z" fill="${color}"/>`;
  }
  function tree(x=30,y=78,s=1){
    return `<path d="M${x} ${y-38*s}l${-17*s} ${26*s}h${10*s}l${-14*s} ${22*s}h${42*s}l${-14*s} ${-22*s}h${10*s}Z" fill="${C.green}"/><rect x="${x-3*s}" y="${y+7*s}" width="${6*s}" height="${12*s}" rx="1" fill="${C.gold}"/>`;
  }

  function motif(name, category=''){
    const s = `${name || ''} ${category || ''}`.toLowerCase();
    const tests = [
      ['city',/big.city|corporate|another city|famous/],
      ['homecoming',/return|hometown|comes home|homecoming/],
      ['festival',/festival|pageant/],
      ['holiday',/holiday|christmas wish|christmas star/],
      ['snow',/snowed|snow.machine|storm|road closure|blizzard/],
      ['business',/family business|save the family business|business at risk/],
      ['inn',/inn|b&b|lodge/],
      ['farm',/farm|ranch|vineyard|winery|tree farm/],
      ['renovation',/renovat|carpenter|developer/],
      ['bakery',/bakery|bake|cookie|cooking|restaurant/],
      ['coffee',/coffee|cocoa|warm drink/],
      ['book',/bookstore|newspaper/],
      ['flower',/flower/],
      ['career',/career|promotion|boss|work assignment|event planner/],
      ['parent',/single parent|widow|parent|grandparent|family tragedy/],
      ['matchmaker',/matchmak/],
      ['child',/child|kid/],
      ['ex',/ex appears|old flame|dead spouse|breakup/],
      ['enemies',/rivals|enemies/],
      ['fake',/fake dating|fake relationship|fake engagement/],
      ['friends',/friends to lovers/],
      ['secondchance',/second chance|old flame/],
      ['workplace',/workplace|work assignment/],
      ['childhood',/childhood/],
      ['bed',/one bed|roommate/],
      ['kiss',/kiss/],
      ['gears',/working together|labor montage/],
      ['mistaken',/mistaken identity|royal mistaken/],
      ['misunderstanding',/misunderstanding|miscommunication|one sentence/],
      ['change',/plans change|ultimatum/],
      ['competition',/contest|competition|competing/],
      ['team',/team up|together/],
      ['simple',/simpler life|small.town|quaint mountain|seaside/],
      ['loveovercareer',/love over career|career.or.love|promotion vs hometown/],
      ['gesture',/grand romantic gesture|fundraiser/],
      ['gift',/gift|inheritance/],
      ['villain',/villain|developer/],
      ['town',/town|main street/]
    ];
    return (tests.find(([,re]) => re.test(s)) || ['cheese'])[0];
  }

  function icon(key){
    const g=C.green,r=C.red,p=C.pink,y=C.gold,c=C.cream;
    switch(key){
      case 'town': return `<g stroke="${g}" stroke-width="4" stroke-linejoin="round"><path d="M20 88V53l22-16 20 16v35H20Z" fill="${r}"/><path d="M57 88V42l23-18 27 22v42H57Z" fill="${c}"/><path d="M74 88V67h14v21" fill="${y}"/></g>${tree(20,82,.55)}`;
      case 'city': return `<g fill="${g}"><rect x="19" y="46" width="22" height="46"/><rect x="45" y="27" width="28" height="65"/><rect x="77" y="38" width="31" height="54"/></g><g fill="${y}"><rect x="26" y="55" width="6" height="7"/><rect x="34" y="67" width="6" height="7"/><rect x="52" y="55" width="6" height="7"/><rect x="62" y="67" width="6" height="7"/><rect x="82" y="55" width="6" height="7"/><rect x="92" y="67" width="6" height="7"/></g>`;
      case 'homecoming': return `<rect x="28" y="36" width="72" height="52" rx="10" fill="${r}" stroke="${g}" stroke-width="5"/><path d="M47 36v-8h34v8" fill="none" stroke="${g}" stroke-width="5"/>${heart(64,58,.62,c)}`;
      case 'festival': return `<path d="M20 87V49l44-23 44 23v38" fill="${c}" stroke="${g}" stroke-width="5"/><path d="M20 49h88M38 39v48M64 26v61M90 39v48" stroke="${r}" stroke-width="7"/><path d="M64 26V13l18 7-18 7" fill="${y}" stroke="${g}" stroke-width="3"/>`;
      case 'snow': return `<g stroke="${g}" stroke-width="5" stroke-linecap="round"><path d="M64 22v84M28 43l72 42M28 85l72-42"/><path d="M64 22l-8 9m8-9 8 9M64 106l-8-9m8 9 8-9"/></g>`;
      case 'business': return `<rect x="22" y="45" width="84" height="48" rx="5" fill="${c}" stroke="${g}" stroke-width="5"/><path d="M19 45l10-20h70l10 20" fill="${r}" stroke="${g}" stroke-width="5"/><path d="M30 25v20m16-20v20m18-20v20m18-20v20m17-20v20" stroke="${c}" stroke-width="5"/><rect x="53" y="61" width="22" height="32" fill="${y}" stroke="${g}" stroke-width="4"/>`;
      case 'inn': return `<path d="M20 91V50l44-27 44 27v41H20Z" fill="${y}" stroke="${g}" stroke-width="5"/><rect x="51" y="62" width="26" height="29" fill="${r}" stroke="${g}" stroke-width="4"/>${tree(26,89,.55)}${tree(102,90,.5)}`;
      case 'farm': return `<path d="M24 91V47l40-23 40 23v44" fill="${r}" stroke="${g}" stroke-width="5"/><rect x="50" y="60" width="28" height="31" fill="${c}" stroke="${g}" stroke-width="4"/><path d="M14 100c25-20 75-19 102 0" fill="none" stroke="${g}" stroke-width="5"/>`;
      case 'renovation': return `<path d="M33 94l47-55" stroke="${g}" stroke-width="12" stroke-linecap="round"/><path d="M68 30l13-13 28 27-13 13Z" fill="${r}" stroke="${g}" stroke-width="5"/><path d="M21 106l17-17" stroke="${y}" stroke-width="5"/>`;
      case 'bakery': return `<path d="M35 65h58l-8 35H43Z" fill="${r}" stroke="${g}" stroke-width="5"/><path d="M39 64c-6-19 12-25 22-14 6-20 28-13 26 3 17-1 20 17 6 21H39Z" fill="${c}" stroke="${g}" stroke-width="5"/><circle cx="64" cy="49" r="5" fill="${y}"/>`;
      case 'coffee': return `<path d="M31 50h58v37c0 12-10 20-22 20H53c-12 0-22-8-22-20V50Z" fill="${r}" stroke="${g}" stroke-width="5"/><path d="M89 58h10c16 0 16 25 0 25H89" fill="none" stroke="${g}" stroke-width="5"/><path d="M47 40c-8-11 8-14 0-25M66 40c-8-11 8-14 0-25" stroke="${g}" stroke-width="4" fill="none" stroke-linecap="round"/>${heart(61,71,.42,c)}`;
      case 'book': return `<path d="M22 35c15-8 29-6 42 4v59c-13-10-27-12-42-4V35Zm84 0c-15-8-29-6-42 4v59c13-10 27-12 42-4V35Z" fill="${c}" stroke="${g}" stroke-width="5"/>${heart(64,68,.38,r)}`;
      case 'flower': return `<g fill="${r}" stroke="${g}" stroke-width="3"><circle cx="64" cy="45" r="10"/><circle cx="47" cy="55" r="10"/><circle cx="81" cy="55" r="10"/><circle cx="53" cy="38" r="10"/><circle cx="75" cy="38" r="10"/></g><circle cx="64" cy="48" r="8" fill="${y}"/><path d="M64 57v43m0-20-18-12m18 18 20-14" stroke="${g}" stroke-width="5"/>`;
      case 'career': return `<rect x="26" y="42" width="76" height="54" rx="7" fill="${g}"/><path d="M47 42V31h34v11" fill="none" stroke="${g}" stroke-width="7"/><rect x="31" y="53" width="66" height="13" fill="${y}"/>${heart(64,76,.36,r)}`;
      case 'parent': return `<circle cx="47" cy="46" r="16" fill="${p}" stroke="${g}" stroke-width="4"/><circle cx="80" cy="59" r="12" fill="${y}" stroke="${g}" stroke-width="4"/><path d="M26 101c4-26 36-32 48-11 6-15 29-15 36 11" fill="${c}" stroke="${g}" stroke-width="5"/>${heart(67,72,.35,r)}`;
      case 'matchmaker': return `<path d="M23 54h36v42H34c-7 0-11-6-11-13V54Zm82 0H69v42h25c7 0 11-6 11-13V54Z" fill="${r}" stroke="${g}" stroke-width="5"/>${heart(64,43,.5,r)}`;
      case 'child': return `<circle cx="64" cy="61" r="31" fill="${p}" stroke="${g}" stroke-width="5"/><path d="M37 43q27-34 54 0" fill="${g}"/><circle cx="53" cy="61" r="3" fill="${g}"/><circle cx="75" cy="61" r="3" fill="${g}"/><path d="M54 76q10 8 20 0" stroke="${r}" stroke-width="4" fill="none"/>${heart(64,101,.25,r)}`;
      case 'ex': return `<path d="M64 103C24 75 29 35 53 35c8 0 12 5 17 12 5-7 9-12 17-12 24 0 27 39-23 68Z" fill="${r}"/><path d="M69 48 55 65l13 8-14 19" fill="none" stroke="${c}" stroke-width="6"/>`;
      case 'enemies': return `<path d="M26 95 88 34M102 95 40 34" stroke="${g}" stroke-width="7" stroke-linecap="round"/>${heart(64,56,.42,r)}`;
      case 'fake': return `<path d="M21 42q22-19 43 1v42q-25 20-43-1V42Zm86 0Q85 23 64 43v42q25 20 43-1V42Z" fill="${p}" stroke="${g}" stroke-width="4"/><path d="M31 61q10 9 20 0m26 10q10-9 20 0" fill="none" stroke="${c}" stroke-width="4"/>`;
      case 'friends': return `<circle cx="45" cy="62" r="24" fill="${r}" stroke="${g}" stroke-width="5"/><circle cx="83" cy="62" r="24" fill="${g}" stroke="${g}" stroke-width="5"/>${heart(64,62,.35,c)}`;
      case 'secondchance': return `<path d="M92 49A35 35 0 1 0 96 84" fill="none" stroke="${r}" stroke-width="9" stroke-linecap="round"/><path d="M93 35 96 55 78 51" fill="${r}"/>${heart(62,67,.42,r)}`;
      case 'workplace': return `<rect x="24" y="34" width="80" height="58" rx="5" fill="${g}"/><rect x="32" y="42" width="64" height="42" fill="${c}"/>${heart(64,62,.38,r)}<path d="M47 101h34" stroke="${g}" stroke-width="7"/>`;
      case 'childhood': return `<circle cx="45" cy="76" r="19" fill="none" stroke="${g}" stroke-width="5"/><circle cx="92" cy="76" r="19" fill="none" stroke="${g}" stroke-width="5"/><path d="M45 76 61 48h22l9 28M61 48l15 28M52 61h35" fill="none" stroke="${r}" stroke-width="5"/>${heart(80,35,.28,p)}`;
      case 'bed': return `<rect x="23" y="55" width="82" height="36" rx="5" fill="${r}" stroke="${g}" stroke-width="5"/><rect x="28" y="43" width="30" height="20" rx="8" fill="${c}" stroke="${g}" stroke-width="4"/><path d="M23 91v15m82-15v15" stroke="${g}" stroke-width="6"/>${heart(83,45,.25,r)}`;
      case 'kiss': return `<path d="M21 68c16-27 31-29 43-8 13-21 28-19 43 8-25 37-61 37-86 0Z" fill="${r}"/><path d="M31 68h66" stroke="${c}" stroke-width="4" opacity=".8"/>`;
      case 'gears': return `<g fill="${g}"><circle cx="49" cy="58" r="22"/><circle cx="83" cy="79" r="18"/></g><g fill="${c}"><circle cx="49" cy="58" r="9"/><circle cx="83" cy="79" r="7"/></g>${heart(83,41,.24,r)}`;
      case 'mistaken': return `<path d="M24 42q20-17 40 2v43q-23 18-40-2V42Zm80 0Q84 25 64 44v43q23 18 40-2V42Z" fill="${r}" stroke="${g}" stroke-width="4"/><path d="M35 62h12m34 0h12" stroke="${c}" stroke-width="5"/>`;
      case 'misunderstanding': return `<path d="M18 35h55v39H42L30 87v-13H18Z" fill="${p}"/><path d="M61 60h49v35H88l-10 12V95H61Z" fill="${g}"/>${heart(64,65,.28,r)}`;
      case 'change': return `<path d="M64 24v84" stroke="${g}" stroke-width="7"/><path d="M61 39h40l-11 12 11 12H61M67 72H27l11 12-11 12h40" fill="${r}" stroke="${g}" stroke-width="4"/>`;
      case 'competition': return `<path d="M41 31h46v33c0 21-12 32-23 32S41 85 41 64V31Z" fill="${y}" stroke="${g}" stroke-width="5"/><path d="M41 42H25c0 20 7 29 22 31M87 42h16c0 20-7 29-22 31" fill="none" stroke="${g}" stroke-width="5"/><path d="M64 96v12M46 110h36" stroke="${g}" stroke-width="6"/>`;
      case 'team': return `<path d="M21 64 45 43l20 17 18-15 24 20-31 29-14-12-14 11Z" fill="${p}" stroke="${g}" stroke-width="5"/>${heart(64,41,.25,r)}`;
      case 'simple': return `${tree(38,92,.72)}${tree(86,96,.55)}<path d="M18 93 48 55l16 18 17-27 29 47Z" fill="${c}" stroke="${g}" stroke-width="5"/>`;
      case 'loveovercareer': return `<rect x="22" y="48" width="84" height="52" rx="7" fill="${g}"/><path d="M45 48V35h38v13" fill="none" stroke="${g}" stroke-width="7"/>${heart(64,72,.52,r)}`;
      case 'gesture': return `${heart(64,66,.5,r)}<g stroke="${r}" stroke-width="4" stroke-linecap="round"><path d="M64 17v15M23 34l12 10M105 34 93 44M17 74h16M111 74H95"/></g>`;
      case 'gift': return `<rect x="24" y="51" width="80" height="52" rx="4" fill="${r}" stroke="${g}" stroke-width="5"/><path d="M64 51v52M19 51h90V36H19Z" fill="${y}" stroke="${g}" stroke-width="5"/><path d="M64 36c-21 1-24-18-11-19 8-1 11 7 11 19Zm0 0c21 1 24-18 11-19-8-1-11 7-11 19Z" fill="${p}" stroke="${g}" stroke-width="3"/>`;
      case 'villain': return `<path d="M18 86h87l-11 18H29Z" fill="${g}"/><rect x="32" y="48" width="44" height="37" fill="${r}" stroke="${g}" stroke-width="5"/><circle cx="42" cy="106" r="8" fill="${y}"/><circle cx="88" cy="106" r="8" fill="${y}"/><path d="M77 49h24l14 37h-39Z" fill="${y}" stroke="${g}" stroke-width="5"/>`;
      default: return `<path d="M26 36 94 47v43l-68 4Z" fill="${y}" stroke="${g}" stroke-width="5"/><circle cx="47" cy="58" r="6" fill="${c}"/><circle cx="74" cy="72" r="7" fill="${c}"/>${heart(93,91,.28,r)}`;
    }
  }

  function svg(name, category=''){
    const safeName = String(name || 'Cheese Trait').replace(/[&<>\"]/g,'');
    const s = seed(name, category);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${safeName}"><rect width="128" height="128" rx="18" fill="${C.cream}"/><rect x="4" y="4" width="120" height="120" rx="15" fill="none" stroke="${C.green}" stroke-width="4" opacity=".9"/>${sparkles(s)}<g>${icon(motif(name, category))}</g><path d="M12 113c28 6 76 6 104 0" fill="none" stroke="${C.red}" stroke-width="3" opacity=".28"/></svg>`;
  }

  window.romantiverseTraitIconDataUri = function(trait){
    const name = trait?.label || trait?.name || 'Cheese Trait';
    const category = trait?.category || '';
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg(name, category))}`;
  };
})();
